import React from 'react';

function PhotoPicker({ onChange }) {
  return (
    <input
      type="file"
      hidden
      id="photo-picker"
      accept="image/*"
      onChange={onChange}
    />
  );
}

export default PhotoPicker;
