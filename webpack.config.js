const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './example/index.tsx',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
    publicPath: '/'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: { react: path.resolve(__dirname, 'node_modules/react') }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.example.json'
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/node_modules/, /\.cache/]
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true
    })
  ],
  devServer: {
    contentBase: __dirname,
    publicPath: '/',
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true
  }
};
