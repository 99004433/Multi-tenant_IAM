const { ModuleFederationPlugin } = require('webpack').container;
const fs = require('fs');
const path = require('path');
 
const webpackConfigPath = 'react-scripts/config/webpack.config';
const webpackConfig = require(webpackConfigPath);
 
const override = (config) => {
const mfConfigPath = path.resolve(__dirname, 'moduleFederation.config.js');
 
if (fs.existsSync(mfConfigPath)) {
const mfConfig = require(mfConfigPath);
config.plugins.push(new ModuleFederationPlugin(mfConfig));
config.output.publicPath = 'auto';
}
return config;
};
 
require.cache[require.resolve(webpackConfigPath)].exports = (env) =>
override(webpackConfig(env));
 
module.exports = require(webpackConfigPath);