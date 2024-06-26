const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const fs = require('fs');

const manifestJson = JSON.parse(fs.readFileSync('src/manifest.json', 'utf-8'));
const name = manifestJson.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

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
          from: 'manifest.json',
          transform: function (content) {
            content = JSON.parse(content.toString());
            delete content.key;
            // generates the manifest file using the package.json version
            return Buffer.from(
              JSON.stringify({
                ...content,
                version: packageJson.version,
              })
            );
          },
        },
        {
          context: 'src/',
          from: 'icons'
        }
      ]
    }),
    new ZipPlugin({
      path: '../releases',
      filename: `${name}-${packageJson.version}.zip`,
    })
  ],
  mode: 'production'
};
