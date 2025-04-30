const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }], // Ajoute le runtime automatique pour éviter l'importation manuelle de React
            ],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "manifest.json" },
        { from: "src/index.html", to: "index.html" },
        { from: "src/styles/index.css", to: "index.css" },
        { from: "src/assets/icon16.png", to: "icon16.png" },
        { from: "src/assets/icon48.png", to: "icon48.png" },
        { from: "src/assets/icon128.png", to: "icon128.png" },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    splitChunks: false,
  },
  mode: "development",
  devtool: false,
  resolve: {
    extensions: [".js", ".jsx"], // Résout les fichiers .jsx
  },
};