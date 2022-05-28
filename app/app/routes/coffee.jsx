import { json } from '@remix-run/node';

export const loader = () => {
  return json("I'm a teapot!", { status: 418 });
};
