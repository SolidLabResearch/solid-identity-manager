const config = require('./webpack.config');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

config.optimization = {
  minimize: false,
};

config.mode = 'development';
config.devtool = 'inline-source-map';
config.plugins = [
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
          // generates the manifest file using the package.json version
          return Buffer.from(
            JSON.stringify({
              ...JSON.parse(content.toString()),
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
  })
];

module.exports = config;
