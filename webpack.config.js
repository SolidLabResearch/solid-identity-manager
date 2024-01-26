const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('src/manifest.json', 'utf-8'));

module.exports = {
  entry: {
    sw: './src/js/sw.js',
    popup: './src/popup/popup.js'
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: '[name].js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          context: 'src/',
          from: 'popup'
        },
        {
          context: 'src/',
          from: 'manifest.json'
        },
        {
          context: 'src/',
          from: 'icons'
        }
      ]
    }),
    new ZipPlugin({
      path: '../releases',
      filename: `solid-identity-manager-${json.version}.zip`,
    })
  ],
  mode: 'production'
};
