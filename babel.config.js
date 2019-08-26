module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    ["module-resolver", {
      "alias": {
        "@server": "../test-data-server/src"
      }
    }]
  ]  
}
