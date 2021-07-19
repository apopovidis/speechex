const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

process.env.NODE_ENV = "development";
process.env.ENDPOINT_IP = "http://localhost";
process.env.ENDPOINT_PORT = "8000";

module.exports = {
  mode: "development",
  target: "web",
  devtool: "cheap-module-source-map",
  entry: ["babel-polyfill", "./src/index"],
  output: {
    path: path.resolve(__dirname),
    publicPath: "/",
    filename: "bundle.js"
  },
  devServer: {
    stats: "minimal",
    overlay: true,
    historyApiFallback: true,
    disableHostCheck: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    https: false
  },
  plugins: [
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
      template: "./src/index.html",
      favicon: "./src/favicon.ico"
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
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
