const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "eval",
    entry: [
        "react-hot-loader/patch",
        "webpack-dev-server/client?http://localhost:3000",
        "webpack/hot/only-dev-server",
        path.join(__dirname, "app/index")
    ],
    output: {
        path: path.join(__dirname, "build"),
        filename: "main.js",
        // publicPath: "./"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "app/index.tpl.html",
            inject: "body",
            filename: "index.html"
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: [".js", ".jsx"],
        alias: {
            event: path.join(__dirname, "app/utils/Event.js"),
            shared: path.join(__dirname, "app/shared")
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ["babel-loader"],
                include: path.join(__dirname, "app")
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                include: path.join(__dirname, "app")
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "less-loader",
                        query: {
                            "sourceMap": true,
                            "modifyVars": {
                                "@icon-url": "'/app/assets/fonts/iconfont/iconfont'"
                            }
                        }
                    }],
                include: [path.join(__dirname, "app"), path.join(__dirname, "node_modules")]
            },
            {
                test: /\.(jpe?g|png|gif|svg|eot|ttf|woff)$/,
                use: [{
                    loader: "file-loader",
                    query: {
                        name: "[path][name].[ext]",
                    }
                }],
                include: path.join(__dirname, "app")
            }
        ]
    }
};
