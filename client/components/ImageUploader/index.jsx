import React, { useState } from 'react';
import { useMutation } from 'urql';

import Dropzone from '../Dropzone';

const uploadImageMutation = `
  mutation uploadFile($file: Upload!) {
    uploadImage(file: $file) {
      id
      filename
      mimetype
    }
  }
`;

const ImageUploader = () => {
  const [res, uploadImage] = useMutation(uploadImageMutation);
  const [images, setImages] = useState([]);

  const reader = new FileReader();

  reader.addEventListener('load', () => {
    setImages(images.concat({
      url: reader.result,
      loaded: false,
    }));
  }, false);

  const handleFile = (file) => {
    reader.readAsDataURL(file);
    uploadImage({ file })
      .then(data => {
        console.log(data);
      });
  };

  return (
    <div>
      {images.map(({ url, loaded }) => (
        <img
          src={url}
          style={{
            width: 100,
            height: 100,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: loaded ? 1 : .5,
          }}
        />
      ))}
      <Dropzone onFile={handleFile} />
    </div>
  );
}

export default ImageUploader;
