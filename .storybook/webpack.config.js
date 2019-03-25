const path = require('path');

console.log(path.resolve(__dirname, 'client'));

module.exports = {
  resolve: {
    modules: [path.resolve(__dirname, '../client'), 'node_modules'],
  },
};
