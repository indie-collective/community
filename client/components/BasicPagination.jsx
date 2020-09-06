import React from 'react';
import PropTypes from 'prop-types';

import { Stack, IconButton } from '@chakra-ui/core';

const propTypes = {
  hasNextPage: PropTypes.bool,
  hasPreviousPage: PropTypes.bool,
  onGetNext: PropTypes.func,
  onGetPrev: PropTypes.func,
};

const defaultProps = {
  onGetNext() {},
  onGetPrev() {},
};

const BasicPagination = ({
  hasPreviousPage,
  hasNextPage,
  onGetNext,
  onGetPrev,
}) => {
  return (
    <Stack isInline spacing={1}>
      <IconButton
        icon="arrow-back"
        size="sm"
        isDisabled={hasPreviousPage}
        onClick={onGetPrev}
      />
      <IconButton
        icon="arrow-forward"
        size="sm"
        isDisabled={hasNextPage}
        onClick={onGetNext}
      />
    </Stack>
  );
};

BasicPagination.propTypes = propTypes;
BasicPagination.defaultProps = defaultProps;

export default BasicPagination;
