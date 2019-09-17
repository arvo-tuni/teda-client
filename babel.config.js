module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    ["module-resolver", {
      "alias": {
        "@server": "../teda-server/src"
      }
    }]
  ]  
}
