/** @type {import('tailwindcss').Config} */
module.exports = {
  // corePlugins: {
  //   preflight: false,
  // },
  content: [
    "./views/**/*.pug",
    "./public/stylesheets/style.css", // Adjust this based on your actual CSS file path
    // Add other file paths as needed
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

