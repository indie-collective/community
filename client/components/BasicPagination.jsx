import React from 'react';
import PropTypes from 'prop-types';

import { Stack, IconButton } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';

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
        icon={<ArrowBackIcon />}
        size="sm"
        isDisabled={!hasPreviousPage}
        onClick={onGetPrev}
      />
      <IconButton
        icon={<ArrowForwardIcon />}
        size="sm"
        isDisabled={!hasNextPage}
        onClick={onGetNext}
      />
    </Stack>
  );
};

BasicPagination.propTypes = propTypes;
BasicPagination.defaultProps = defaultProps;

export default BasicPagination;
