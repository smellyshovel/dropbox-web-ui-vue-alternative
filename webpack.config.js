const BabelPolyfill = require("@babel/polyfill");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const Webpack = require("webpack");
const Path = require("path");

module.exports = {
    entry: ["@babel/polyfill", "./src/main.js"],
    module: {
        rules: [
            { test: /\.js$/, use: "babel-loader" },
            { test: /\.vue$/, use: "vue-loader" },
            { test: /\.css$/, use: ["vue-style-loader", "css-loader"]},

            { test: /\.txt$/, use: "raw-loader" },
            { test: /\.(svg|png|jpg|gif)$/i, use: "url-loader" }
        ]
    },
    devServer: {
        hot: true,
        historyApiFallback: true
    },
    resolve: {
        extensions: [".js", ".vue", ".json"],
        alias: {
            "@": Path.join(__dirname, "src")
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
        new VueLoaderPlugin(),
        new Webpack.HotModuleReplacementPlugin()
    ]
};
