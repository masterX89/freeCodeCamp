import { Story } from '@storybook/react';
import React from 'react';
import { Tabs, TabsProps, TabPane } from './tabs';

const story = {
  title: 'Example/Tabs',
  component: Tabs
};

const Template: Story<TabsProps> = args => (
  <Tabs {...args}>
    <div tab='A00000' key='1'>
      <TabPane>A Content</TabPane>
    </div>
    <div tab='B' key='2'>
      <TabPane>B Content</TabPane>
    </div>
  </Tabs>
);

export const Basic = Template.bind({});
Basic.args = {
  defaultActiveKey: '1',
  onChange: activeKey => {
    console.log('activeKey', activeKey);
  }
};

export default story;
