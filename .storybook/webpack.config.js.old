const path = require('path');

module.exports = {
  resolve: {
    modules: [path.resolve(__dirname, '../client'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: { modules: true },
          }
        ],
        include: path.resolve(__dirname, '../'),
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }]
      }
    ],
  },
};
