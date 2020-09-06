import React from 'react';

import NumberedPagination from '../components/NumberedPagination';

export default {
  title: 'Components/NumberedPagination',
  component: NumberedPagination,
};

const Template = (args) => <NumberedPagination {...args} />;

export const Example = Template.bind({});
Example.args = {
  totalPages: 10,
  currentPage: 3,
};
