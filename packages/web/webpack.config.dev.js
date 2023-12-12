const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].[contenthash].js",
        clean: true,
        publicPath: "/",
    },
    mode: "development",
    resolve: {
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        port: 3000,
        historyApiFallback: true,
        static: { directory: path.join(__dirname, "src") },
        proxy: {
            '/socket.io': {
                target: 'http://localhost:8080',
                ws: true,
                pathRewrite: {
                    '^/socket.io': '/socket.io',
                }
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["ts-loader"],
            },
            {
                test: /\.(css|scss)$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
                use: ["file-loader"],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "public", to: "public", noErrorOnMissing: true },
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "static", "index.html"),
        }),
    ],
    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        }
    }
};