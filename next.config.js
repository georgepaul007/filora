module.exports = {
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: "url-loader",
      },
    });

    return config;
  },
};
