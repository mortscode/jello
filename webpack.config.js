module.exports = {
  resolve: {
    root: __dirname
  },

  entry: {
    app: "./_src/js/App.js"
  },

  output: {
    path: "./assets/scripts/",
    filename: "app.js"
  },

  module: {
    loaders: [
      {
        test: /js\/.*\.js$/,
        exclude: /node_modules|jquery/,
        loader: "babel-loader",
        query: {
          presets: ['es2015'],
          plugins: ['transform-decorators-legacy']
        }
      },

      {
        test: /jquery\.js$/,
        loader: "expose?$!expose?jQuery"
      }
    ]
  }
};
