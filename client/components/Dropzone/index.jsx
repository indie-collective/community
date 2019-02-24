import React, { useState } from 'react';

const Dropzone = ({ onFile }) => {
  const [dragOver, setDragOver] = useState(false);

  const onDragOver = (evt) => {
    evt.preventDefault();
    setDragOver(true)
  }

  const onDragLeave = () => {
    setDragOver(false);
  }

  const onDrop = (evt) => {
    evt.preventDefault();

    const files = evt.dataTransfer.items ? (
      Array.from(evt.dataTransfer.items)
        .filter(i => i.kind === 'file')
        .map(i => i.getAsFile())
    ) : (
      Array.from(evt.dataTransfer.files)
    );

    files.forEach(onFile);
    setDragOver(false);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        border: '1px solid silver',
        padding: '1em',
        borderWidth: dragOver ? 3 : 1,
      }}
    >
      Drop files here
    </div>
  );
}

export default Dropzone;
