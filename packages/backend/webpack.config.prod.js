const path = require('path');

const config = {
    mode: "production",
    target: "node",
    entry: "./src/index.ts",
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
    optimization: {
        minimize: true,
    },
};

module.exports = config;