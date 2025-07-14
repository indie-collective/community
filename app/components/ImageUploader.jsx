import { Box, AspectRatio, Image, Spinner } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

const ImageUploader = ({ gameId, currentUser, fetcher }) => {
  const dzColor = 'gray.200';
  const dzHoverColor = 'gray.400';
  const dzActiveColor = 'teal.200';
  const dzActiveHoverColor = 'teal.600';

  const dzBorderColor = 'gray.200';
  const dzActiveBorderColor = 'teal.200';
  const dzHoverBorderColor = 'gray.200';
  const dzActiveHoverBorderColor = 'teal.600';

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
          <FiPlus size="48px" />
        </Box>
      </AspectRatio>
    );
  }
};

export default ImageUploader;
