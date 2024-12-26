/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        fontFamily: {
          rubik: ["Rubik-Regular", "sans-serif"],
          rubikBold: ["Rubik-Bold", "sans-serif"],
          rubikExtrabold: ["Rubik-ExtraBold", "sans-serif"],
          rubikMedium: ["Rubik-Medium", "sans-serif"],
          rubikSemibold: ["Rubik-SemiBold", "sans-serif"],
          rubikLight: ["Rubik-Light", "sans-serif"],
        },
        colors: {
          primary: {
            100: "#AED6A1",
            200: "#C1D9C5",
            300: "#7D9784",
          },
          accent: {
            100: "#FBFBFD",
          },
          black: {
            DEFAULT: "#000000",
            100: "#8C8E98",
            200: "#666876",
            300: "#191D31",
          },
          danger: "#F75555",
        },
      },
    },
    plugins: [],
  };