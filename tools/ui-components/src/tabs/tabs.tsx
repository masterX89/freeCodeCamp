import React, { Fragment, useState } from 'react';

export interface TabsProps {
  defaultActiveKey?: {
    currentIndex: any;
  };
  disabled?: boolean;
  onChange?: (activeKey: any) => any;
}

export function TabPane(props: { children: any }) {
  return <div>{props.children}</div>;
}

export function Tabs(props: TabsProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(props.defaultActiveKey);
  const onChange = (activeKey: any) => {
    if (typeof props.onChange === 'function') props.onChange(activeKey);
    setCurrentIndex(activeKey);
  };
  return (
    <div style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          padding: '8px 16px',
          background: '#fff',
          flexShrink: 0
        }}
      >
        {React.Children.map(props.children, (element, index) => {
          let { disabled, tab } = element.props;
          return (
            <button
              className={currentIndex === element.key ? 'active' : ''}
              key={element.key}
              disabled={disabled}
              onClick={() => onChange(element.key)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 34px 0 0',
                padding: '12px 0px',
                boxSizing: 'border-box',
                border: 'none',
                boxShadow: 'none',
                fontSize: '14px'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: '100%'
        }}
      >
        {React.Children.map(props.children, (element, index) => {
          return (
            <div
              key={element.key}
              style={{
                display: currentIndex === element.key ? 'block' : 'none'
              }}
            >
              {element}
            </div>
          );
        })}
      </div>
    </div>
  );
}
