import Error from './_error';

function Coffee() {
  return <Error statusCode={418} />;
}

export const getServerSideProps = async ({ res }) => {
  res.statusCode = 418;

  return {
    props: {
      error: "I'm a teapot! ",
    },
  };
};

export default Coffee;
