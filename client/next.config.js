module.exports = {
  webpack: config => {
    config.module.rules.push({
      test: /\.(txt|jpg|png|svg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            context: '',
            outputPath: 'static',
            publicPath: '_next/static',
            name: '[path][name].[hash].[ext]',
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.gql$/,
      use: [
        {
          loader: 'webpack-graphql-loader',
        },
      ],
    });

    return config;
  },
};
