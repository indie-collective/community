import React from 'react';

import BasicPagination from '../components/BasicPagination';

export default {
  title: 'Components/BasicPagination',
  component: BasicPagination,
};

const Template = (args) => <BasicPagination {...args} />;

export const Example = Template.bind({});
Example.args = {
  hasNextPage: true,
};
 