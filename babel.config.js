let plugins = []
if (process.env.VUE_APP_ENV === 'pro') {
  //exclude(忽略)
  plugins.push(['transform-remove-console', { 'exclude': ['error', 'warn'] }])
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins
}
