import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Spacer } from '@chakra-ui/react';

const LinearGradient = ({ data }) => {
  return (
    <div>
      <Flex w="50%" m="auto">
        <span>{data.min}</span>
        <Spacer />
        <span>{data.max}</span>
      </Flex>
      <Box
        w="50%"
        m="auto"
        bgImage={`linear-gradient(to right, ${data.fromColor} , ${data.toColor})`}
        height="20px"
        mt="8px"
      />
    </div>
  );
};

LinearGradient.propTypes = {
  data: PropTypes.object.isRequired,
};

export default LinearGradient;
