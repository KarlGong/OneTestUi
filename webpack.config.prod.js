const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "eval",
    entry: [
        path.join(__dirname, "src/index")
    ],
    output: {
        path: path.join(__dirname, "build"),
        filename: "main.js",
        // publicPath: "./"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.tpl.html",
            inject: "body",
            filename: "index.html"
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ],
    resolve: {
        extensions: [".js", ".jsx"],
        alias: {
            event: path.join(_dirname, "src/utils/Event.js")
        }
    },
    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                use: ["babel-loader"],
                exclude: /node_modules/,
                include: path.join(__dirname, "src")
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                exclude: /node_modules/,
                include: path.join(__dirname, "src")
            },
            {
                test: /\.less$/,
                use: ["style-loader", "css-loader", "less-loader"],
                include: [path.join(__dirname, "src"), path.join(__dirname, "node_modules", "antd")]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/,
                use: ["file-loader"],
                exclude: /node_modules/,
                include: path.join(__dirname, "src")
            }
        ]
    }
};