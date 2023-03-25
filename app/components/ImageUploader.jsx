import { Box, AspectRatio, Image, Spinner, useColorModeValue } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

const ImageUploader = ({ gameId, currentUser, fetcher }) => {
  const dzColor = useColorModeValue('gray.200', 'gray.700');
  const dzHoverColor = useColorModeValue('gray.400', 'gray.50');
  const dzActiveColor = useColorModeValue('teal.200', 'teal.700');
  const dzActiveHoverColor = useColorModeValue('teal.600', 'teal.50');

  const dzBorderColor = useColorModeValue('gray.200', 'gray.700');
  const dzActiveBorderColor = useColorModeValue('teal.200', 'teal.700');
  const dzHoverBorderColor = useColorModeValue('gray.200', 'gray.700');
  const dzActiveHoverBorderColor = useColorModeValue('teal.600', 'teal.700');

  const onDrop = useCallback(async (acceptedFiles) => {
    const form = new FormData();

    for (const file of acceptedFiles) {
      form.append('images', file);
    }

    await fetcher.submit(
      form,
      {
        method: 'post',
        action: `/game/${gameId}/images/add`,
        encType: 'multipart/form-data',
      }
      // { method: 'post', action: './images/add' }
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (
    fetcher.state === 'submitting' &&
    fetcher.submission.action.includes('images/add')
  ) {
    fetcher.submission.formData.getAll('images').map((file) => (
      <Box key={file.name} position="relative">
        <AspectRatio ratio={16 / 9}>
          <Image
            objectFit="cover"
            size="100%"
            src={URL.createObjectURL(file)}
            alt=""
            opacity={0.5}
          />
        </AspectRatio>
        <Spinner position="absolute" inset={0} margin="auto" size="lg" />
      </Box>
    ));
  }

  if (currentUser) {
    return (
      <AspectRatio ratio={16 / 9}>
        <Box
          transition="background-color 200ms ease-out"
          color={isDragActive ? dzActiveColor : dzColor}
          borderColor={isDragActive ? dzActiveBorderColor : dzBorderColor}
          _hover={
            isDragActive
              ? {
                  color: dzActiveHoverColor,
                  borderColor: dzActiveHoverBorderColor,
                  cursor: 'pointer',
                }
              : {
                  color: dzHoverColor,
                  backgroundColor: dzHoverBorderColor,
                  cursor: 'pointer',
                }
          }
          rounded={5}
          borderWidth={5}
          padding={5}
          borderStyle="dashed"
          textAlign="center"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <AddIcon size="48px" />
        </Box>
      </AspectRatio>
    );
  }
};

export default ImageUploader;
