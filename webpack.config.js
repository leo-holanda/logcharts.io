const path = require('path');

module.exports = {
	mode: "production",
  entry: './public/javascripts/index.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'public/dist'),
  },
};