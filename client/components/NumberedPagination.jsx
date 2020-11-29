import React from 'react';
import PropTypes from 'prop-types';

import { Stack, Button } from '@chakra-ui/react';

const propTypes = {
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onChange: PropTypes.func,
};

const defaultProps = {
  onChange() {},
};

const NumberedPagination = ({ totalPages, currentPage, onChange }) => {
  const pageArray = Array.from({ length: totalPages });

  return (
    <Stack isInline spacing={1}>
      {pageArray.map((d, i) => (
        <Button
          key={i}
          size="sm"
          variant="ghost"
          isActive={i + 1 === currentPage}
        >
          {i + 1}
        </Button>
      ))}
    </Stack>
  );
};

NumberedPagination.propTypes = propTypes;
NumberedPagination.defaultProps = defaultProps;

export default NumberedPagination;
