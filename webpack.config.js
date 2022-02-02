const PACKAGE = require('./package.json');
const webpack = require('webpack');
const path = require('path');

module.exports = function(env, argv) {
    const prod = argv.mode === 'production';
    return {
        mode: prod ? 'production' : 'development',
        devtool: 'cheap-source-map',
        entry: path.resolve(__dirname, './src/index.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'main.js'
        }
    };
};
