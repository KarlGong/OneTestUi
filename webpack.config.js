const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "eval",
    entry: [
        "react-hot-loader/patch",
        "webpack-dev-server/client?http://localhost:3000",
        "webpack/hot/only-dev-server",
        path.join(__dirname, "src/index")
    ],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "main.js",
        // publicPath: "./"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.tpl.html",
            inject: "body",
            filename: "index.html"
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: [".js", ".jsx"],
        alias: {
            event: path.join(__dirname, "src/utils/Event.js")
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
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
