module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // Ensures Expo uses its default Babel preset
    };
  };
  