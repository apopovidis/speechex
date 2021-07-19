const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

process.env.NODE_ENV = "production";
process.env.ENDPOINT_IP = "http://localhost";
process.env.ENDPOINT_PORT = "8000";

module.exports = {
  mode: "production",
  target: "web",
  devtool: "source-map",
  entry: {
    vendor: ["react", "react-dom", "prop-types"],
    bundle: ["babel-polyfill", "./src/index"]
  },
  output: {
    path: path.resolve(__dirname, "../static"),
    publicPath: "/",
    filename: "[name].[contenthash].js"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }),
    new webpack.DefinePlugin({
      process: {
        env: {
          NODE_ENV: JSON.stringify("development"),
          ENDPOINT: JSON.stringify(!process.env.ENDPOINT_IP ? "http://localhost" : process.env.ENDPOINT_IP),
          PORT: JSON.stringify(!process.env.ENDPOINT_PORT ? "8000" : process.env.ENDPOINT_PORT)
        }
      }
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'ENDPOINT', 'PORT']),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      favicon: "./src/favicon.ico",
      minify: {
        // see https://github.com/kangax/html-minifier#options-quick-reference
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          },
          "eslint-loader"
        ]
      },
      {
        test: /(\.css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("cssnano")],
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
};
