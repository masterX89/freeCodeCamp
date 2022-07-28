import { Story } from '@storybook/react';
import React from 'react';
import { Tabs, TabsProps } from './tabs';

const story = {
  title: 'Example/Tabs',
  component: Tabs
};

const Template: Story<TabsProps> = args => (
  <Tabs {...args}>
    <div tab='tab1'></div>
    <div tab='tab2'></div>
  </Tabs>
);

export const Basic = Template.bind({});
Basic.args = {};

export default story;
