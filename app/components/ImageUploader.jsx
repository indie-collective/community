import { Box, AspectRatio, Image, Spinner } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

import { makeThumbnail } from '../utils/thumbnail';

const ImageUploader = ({ gameId, currentUser, fetcher }) => {
  // The drop zone: a hairline, ink under the pointer, green while a file
  // is dragged over it.
  const dzColor = 'muted';
  const dzHoverColor = 'ink';
  const dzActiveColor = 'primary.fg';
  const dzActiveHoverColor = 'primary.fg';

  const dzBorderColor = 'rule';
  const dzActiveBorderColor = 'brand';
  const dzHoverBorderColor = 'ink';
  const dzActiveHoverBorderColor = 'brand';

  const onDrop = useCallback(async (acceptedFiles) => {
    const form = new FormData();

    // Each image with its thumbnail and size (see utils/createUploadHandler);
    // an empty thumbnail when the browser can't draw it.
    const thumbnails = await Promise.all(acceptedFiles.map(makeThumbnail));
    acceptedFiles.forEach((file, i) => {
      const made = thumbnails[i];
      form.append('images', file);
      form.append('images_thumb', made?.thumbnail ?? new File([], ''));
      form.append('images_width', made?.width ?? '');
      form.append('images_height', made?.height ?? '');
    });

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
    fetcher.formAction?.includes('images/add')
  ) {
    fetcher.formData.getAll('images').map((file) => (
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
          rounded="card"
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
          <LuPlus size="48px" />
        </Box>
      </AspectRatio>
    );
  }
};

export default ImageUploader;
