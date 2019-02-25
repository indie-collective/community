import React, { useState } from 'react';
import { useMutation } from 'urql';

import Dropzone from '../Dropzone';

import uploadImageMutation from '../../gql/uploadImage';

const ImageUploader = () => {
  const [images, setImages] = useState([]);
  const uploadImage = useMutation(uploadImageMutation)[1];

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
