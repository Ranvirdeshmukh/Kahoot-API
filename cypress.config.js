/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    baseUrl: 'https://kahoots-api-ranvirdeshmukh-1.onrender.com/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
