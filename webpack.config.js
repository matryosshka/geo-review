let path = require('path');
let rules = require('./webpack.config.rules.js')();
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

rules.push(
    {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
    },

    {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    },

    {
        test: /\.html$/,
        use: 'html-loader'
    },
)

module.exports = {
    entry: {
        index: './src/index.js'
    },

    output: {
        filename: '[name].[hash].js',
        path: path.resolve('dist'),
    },

    devtool: 'source-map',
    module: {
        rules
    },

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: false,
                    ecma: 6,
                    mangle: true
                },
                sourceMap: true
            })
        ]
    },

    plugins: [
        new HtmlPlugin({
            title: 'Оставь отзыв! ✨',
            template: 'index.hbs',
            favicon: "./src/img/favicon.ico"
        }),
        new CleanWebpackPlugin(['dist']),
        new MiniCssExtractPlugin(),
    ]
}