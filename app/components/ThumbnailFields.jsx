import { useEffect, useRef, useState } from 'react';

import { makeThumbnail } from '../utils/thumbnail';

/**
 * Hidden fields sent with the image picked in the file input `name`: its
 * thumbnail (`name_thumb`) and size (`name_width`, `name_height`), which
 * the server stores with it (utils/createUploadHandler). Render it inside
 * the form, and pass the picked file.
 */
const ThumbnailFields = ({ name, file }) => {
  const thumbRef = useRef(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    let current = true;
    setSize(null);
    if (thumbRef.current) thumbRef.current.value = '';
    if (!file) return undefined;

    makeThumbnail(file).then((made) => {
      if (!current || !made || !thumbRef.current) return;
      const files = new DataTransfer();
      files.items.add(made.thumbnail);
      thumbRef.current.files = files.files;
      setSize({ width: made.width, height: made.height });
    });
    return () => {
      current = false;
    };
  }, [file]);

  return (
    <>
      <input type="file" name={`${name}_thumb`} ref={thumbRef} hidden />
      {size && (
        <>
          <input type="hidden" name={`${name}_width`} value={size.width} />
          <input type="hidden" name={`${name}_height`} value={size.height} />
        </>
      )}
    </>
  );
};

export default ThumbnailFields;
