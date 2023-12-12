const path = require('path');
const WebpackShellPlugin = require("webpack-shell-plugin-next");

const config = {
    mode: "development",
    target: "node",
    entry: "./src/index.ts",
    plugins: [
        new WebpackShellPlugin({
            onBuildEnd: {
                scripts: ["nodemon build/bundle.js"],
                blocking: false,
                parallel: true,
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    ignoreWarnings: [
        w => w !== 'CriticalDependenciesWarning'
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        clean: true,
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
};

module.exports = config;