import { useEffect, useRef } from 'react';

export default function usePreviousNonNullish(value) {
  const ref = useRef(value);
  useEffect(() => {
    if (value !== null && value !== undefined) {
      ref.current = value;
    }
  });
  return ref.current;
};
