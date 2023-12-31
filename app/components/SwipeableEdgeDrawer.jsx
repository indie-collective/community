import {
  Box,
  Button,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import React, { useEffect, useState } from 'react';
import {
  ThemeProvider as MUIThemeProvider,
  THEME_ID,
} from '@mui/material/styles';

import theme, { muiTheme } from '../theme';

const drawerBleeding = 56;

function SwipeableEdgeDrawer(props) {
  const { header, children, isOpen, onClose } = props;
  const [open, setOpen] = useState(isOpen);
  const listBgColor = useColorModeValue('white', 'gray.800');
  const dragHandlebgColor = useColorModeValue('gray.300', 'gray.500');
  const { colorMode } = useColorMode();

  useEffect(() => {
    // isOpen props changed, so we follow what's new
    setOpen(isOpen);
  }, [isOpen, setOpen]);

  return (
    <MUIThemeProvider theme={{ ...theme, [THEME_ID]: muiTheme }}>
    <Box height="100%" bgColor={listBgColor}>
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(50% - ${drawerBleeding}px)`,
            overflow: 'visible',
            background:
              colorMode === 'light' ? 'white' : 'var(--chakra-colors-gray-800)',
            color: 'inherit',
          },
        }}
      />
      {/* <Box
        textAlign="center"
        pt={1}
        position="absolute"
        top="100px"
        left={0}
        right={0}
      >
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          Open
        </Button>
      </Box> */}
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        onOpen={() => {
          setOpen(true);
        }}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box
          bgColor={listBgColor}
          position="absolute"
          top={-drawerBleeding + 'px'}
          borderTopLeftRadius="8px"
          borderTopRightRadius="8px"
          visibility="visible"
          right={0}
          left={0}
        >
          <Box
            width="30px"
            height="6px"
            backgroundColor={dragHandlebgColor}
            borderRadius="3px"
            position="absolute"
            top="8px"
            left="calc(50% - 15px)"
          />
          {header}
        </Box>
        {children}
      </SwipeableDrawer>
    </Box>
    </MUIThemeProvider>
  );
}

SwipeableEdgeDrawer.propTypes = {};

export default SwipeableEdgeDrawer;
