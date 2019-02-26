import React, { useState, useRef } from 'react';
import { IconButton } from 'evergreen-ui';

import Dropzone from '../Dropzone';

const ImageUploader = ({ children, onImage }) => {
  const [images, setImages] = useState([]);
  const fileInput = useRef(null);

  const reader = new FileReader();

  reader.addEventListener('load', () => {
    setImages(images.concat({
      url: reader.result,
      loaded: false,
    }));
  }, false);

  const handleFile = (file) => {
    reader.readAsDataURL(file);
    onImage(file);
  };

  return (
    <Dropzone onFile={handleFile}>
      {children}
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
      <IconButton
        appearance="minimal"
        icon="plus"
        width={100}
        height={100}
        onClick={() => fileInput.current.click()}
      />
      <input
        type="file"
        onChange={() => handleFile(fileInput.current.files[0])}
        ref={fileInput}
        style={{ display: 'none' }}
      />
    </Dropzone>
  );
}

export default ImageUploader;
