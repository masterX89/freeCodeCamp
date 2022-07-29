import { Story } from '@storybook/react';
import React from 'react';
import { TabsProps, TabPane, Tabs } from './tabs';

const story = {
  title: 'Example/Tabs',
  component: Tabs
};

const Template: Story<TabsProps> = args => (
  <div>
    <Tabs {...args}>
      <div tab='A00000' key='1'>
        <TabPane>A Content</TabPane>
      </div>
      <div tab='B' key='2'>
        <TabPane>B Content</TabPane>
      </div>
    </Tabs>

    {/* <Tabs.Group>
      <Tabs.List>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel>Content 1</Tabs.Panel>
        <Tabs.Panel>Content 2</Tabs.Panel>
        <Tabs.Panel>Content 3</Tabs.Panel>
      </Tabs.Panels>
    </Tabs.Group> */}
  </div>
);

export const Basic = Template.bind({});
Basic.args = {
  defaultActiveKey: '1',
  onChange: activeKey => {
    console.log('activeKey', activeKey);
  }
};

export default story;
