import React, { useState } from 'react';

export interface TabsProps {
  defaultActiveKey?: {
    currentIndex: string;
  };
  disabled?: boolean;
  onChange?: (activeKey: string) => string;
}

export function TabPane(props: { children: JSX.Element[] }) {
  return <div>{props.children}</div>;
}

export const Tabs = React.forwardRef<HTMLElement, TabsProps>((props, ref) => {
  const [currentIndex, setCurrentIndex] = useState(props.defaultActiveKey);
  const onChange = (activeKey: string) => {
    if (typeof props.onChange === 'function') {
      props.onChange(activeKey);
    }
    setCurrentIndex(activeKey);
  };
  return (
    <div className='overflow-hidden'>
      <div className='flex relative py-8 px-16'>
        {React.Children.map(props.children, element => {
          const { disabled, tab } = element.props;
          return (
            <button
              className='flex-initial px-4'
              key={element.key}
              disabled={disabled}
              onClick={() => onChange(element.key)}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className='flex-1'>
        {React.Children.map(props.children, element => {
          return (
            <div
              key={element.key}
              className={`${currentIndex === element.key ? 'block' : 'hidden'}`}
            >
              {element}
            </div>
          );
        })}
      </div>
    </div>
  );
});

Tabs.displayName = 'Tabs';
