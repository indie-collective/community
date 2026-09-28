import { data } from 'react-router';

export const loader = () => {
  return data("I'm a teapot!", { status: 418 });
};
