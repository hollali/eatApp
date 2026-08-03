module.exports = {
  expo: {
    name: "eatApp",
    slug: "eatApp",
    assetBundlePatterns: ["**/*"],
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "eatapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
          url: process.env.EXPO_PUBLIC_SENTRY_URL,
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORGANIZATION,
        },
      ],
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow eatApp to access your photos so you can update your profile picture.",
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Allow eatApp to use your location so we can detect your delivery address.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
