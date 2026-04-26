import { json } from '@react-router/node';

export const loader = () => {
  return json("I'm a teapot!", { status: 418 });
};
