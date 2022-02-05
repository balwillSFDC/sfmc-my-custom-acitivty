const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = (env, argv) => {
    const prod = argv.mode === 'production';
    return {
        mode: prod ? 'production' : 'development',
        devtool: 'cheap-source-map',
        entry: path.resolve(__dirname, './src/index.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'main.js'
        },
        // REVISIT - it should copy SLDS design assets into /dist, but is erroring. Doing it manually for now
        // plugins: [
        //   new CopyPlugin({
        //     patterns: [
        //       {
        //         from: path.resolve(__dirname, 'node_modules/@salesforce-ux/design-system/assets/styles'),
        //         to: path.resolve(__dirname, 'dist/design-system')
        //       }
        //   ]
        //   })
        // ]
    };
};
