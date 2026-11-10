const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:4500",
    supportFile: false,
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});
