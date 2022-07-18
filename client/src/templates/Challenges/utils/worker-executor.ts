type Listener = (...args: unknown[]) => void | Task;

class Task {
  _events: Record<string, Listener[]> = {};
  on = (event: string, listener: Listener) => {
    if (typeof this._events[event] === 'undefined') {
      this._events[event] = [];
    }
    this._events[event].push(listener);
    return this;
  };
  removeListener = (event: string, listener?: Listener) => {
    if (typeof this._events[event] !== 'undefined' && listener) {
      const index = this._events[event].indexOf(listener);
      if (index !== -1) {
        this._events[event].splice(index, 1);
      }
    }
    return this;
  };
  emit = (event: string, ...args: unknown[]) => {
    if (typeof this._events[event] !== 'undefined') {
      this._events[event].forEach(listener => {
        listener.apply(this, args);
      });
    }
    return this;
  };
  once = (event: string, listener: Listener) => {
    this.on(event, (...args) => {
      this.removeListener(handler);
      listener.apply(this, args);
    });
    return self;
  };
}

class WorkerExecutor {
  _workerPool: Worker[];
  _taskQueue: Task[];
  _workersInUse: number;
  _maxWorkers: number;
  _terminateWorker: boolean;
  _scriptURL: string;
  constructor(
    workerName: string,
    { location = '/js/', maxWorkers = 2, terminateWorker = false } = {}
  ) {
    this._workerPool = [];
    this._taskQueue = [];
    this._workersInUse = 0;
    this._maxWorkers = maxWorkers;
    this._terminateWorker = terminateWorker;
    this._scriptURL = `${location}${workerName}.js`;

    this._getWorker = this._getWorker.bind(this);
  }

  _getWorker = async () => {
    return this._workerPool.length
      ? this._workerPool.shift()
      : await this._createWorker();
  };

  _createWorker() {
    return new Promise((resolve, reject) => {
      const newWorker = new Worker(this._scriptURL);
      newWorker.onmessage = (e: MessageEvent<{ type?: string }>) => {
        if (e.data?.type === 'contentLoaded') {
          resolve(newWorker);
        }
      };
      newWorker.onerror = err => reject(err);
    });
  }

  _handleTaskEnd(task: Task) {
    return () => {
      this._workersInUse--;
      const worker = task._worker;
      if (worker) {
        if (this._terminateWorker) {
          worker.terminate();
        } else {
          worker.onmessage = null;
          worker.onerror = null;
          this._workerPool.push(worker);
        }
      }
      this._processQueue();
    };
  }

  _processQueue() {
    while (this._workersInUse < this._maxWorkers && this._taskQueue.length) {
      const task = this._taskQueue.shift();
      const handleTaskEnd = task && this._handleTaskEnd(task);
      task?._execute(this._getWorker).done.then(handleTaskEnd, handleTaskEnd);
      this._workersInUse++;
    }
  }

  execute(data: unknown, timeout = 1000) {
    const task = eventify({} as Task);
    task._execute = function (getWorker: () => Promise<Worker>) {
      getWorker().then(
        (worker: Worker) => {
          task._worker = worker;
          const timeoutId = setTimeout(() => {
            task._worker?.terminate();
            task._worker = null;
            this.emit('error', { message: 'timeout' });
          }, timeout);

          worker.onmessage = (
            e: MessageEvent<{ type?: string; data: string | number }>
          ) => {
            clearTimeout(timeoutId);
            // data.type is undefined when the message has been processed
            // successfully and defined when something else has happened (e.g.
            // an error occurred)
            if (e.data?.type) {
              this.emit(e.data.type, e.data.data);
            } else {
              this.emit('done', e.data);
            }
          };

          worker.onerror = e => {
            clearTimeout(timeoutId);
            this.emit('error', { message: e.message });
          };

          worker.postMessage(data);
        },
        (err: Error) => this.emit('error', err)
      );
      return this;
    };

    task.done = new Promise((resolve, reject) => {
      task
        .once('done', data => resolve(data))
        .once('error', (err: Error) => reject(err.message));
    });

    this._taskQueue.push(task);
    this._processQueue();
    return task;
  }
}

// Error and completion handling
const eventify = (self: Task) => {
  self._events = {};

  self.on = (event, listener) => {
    if (typeof self._events[event] === 'undefined') {
      self._events[event] = [];
    }
    self._events[event].push(listener);
    return self;
  };

  self.removeListener = (event, listener) => {
    if (typeof self._events[event] !== 'undefined') {
      const index = self._events[event].indexOf(listener);
      if (index !== -1) {
        self._events[event].splice(index, 1);
      }
    }
    return self;
  };

  self.emit = (event, ...args) => {
    if (typeof self._events[event] !== 'undefined') {
      self._events[event].forEach(listener => {
        listener.apply(self, args);
      });
    }
    return self;
  };

  self.once = (event, listener) => {
    self.on(event, function handler(...args) {
      self.removeListener(handler);
      listener.apply(self, args);
    });
    return self;
  };

  return self;
};

export default function createWorkerExecutor(
  workerName: string,
  options: {
    location?: string;
    maxWorkers?: number;
    terminateWorker?: boolean;
  }
) {
  return new WorkerExecutor(workerName, options);
}
