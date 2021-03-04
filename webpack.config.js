const path = require('path');

module.exports = {
	mode: "production",
  entry: '/src/javascripts/index.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};