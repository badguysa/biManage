const path = require('path')
const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const AutoImport = require('unplugin-auto-import/webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const WebpackObfuscator = require('webpack-obfuscator');

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: './',
  productionSourceMap: false,
  chainWebpack: config =>{
    if(process.env.ANALAYZ) {
      config.plugin('webpack-bundle-analyzer')
        .use(new BundleAnalyzerPlugin({
          analyzerPort: 2333
        }))
    }
    const { resolve, module } = config
    resolve.alias.set('vue-i18n', 'vue-i18n/dist/vue-i18n.cjs.js')
    module
      .rule('worker-loader')
        .test(/\.worker\.js$/)
        .use({
          loader: 'worker-loader',
            options: {
            inline: true
          }
        })
          .loader('worker-loader')
          .end()
        .exclude
        .add(/(node_modules|bower_components)/)
        .end()

    module.rule('svg')
      .exclude.add(path.join(__dirname, 'src/assets/svg'))
      .end()

    module
      .rule('icons') // 新规则
      .test(/\.svg$/)
      .include.add(path.join(__dirname, 'src/assets/svg')) // 新规则应用于存放svg的目录
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['json', 'sql']
      }),
      // 自动导入 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
        dirs: ['src/Stores']
      }),
      // new WebpackObfuscator ({
      //   rotateStringArray: true
      // }, [])
    ],
  },
  devServer: {
    port: 8800,
    allowedHosts: 'all',
    proxy: {
      '/biapi': {
        // target: 'http://192.168.40.76:8080', // 郭军
        // target: 'http://192.168.40.62:8080', // 高华
        // target: 'http://192.168.40.59:8080', // 晓华
        // target: 'http://192.168.40.81:8080', // 泽华
        // target: 'http://192.168.40.14:8080', // 庚乾
        // target: 'http://wjzt.wtc.edu.cn/biapi/', // 公网
        target: 'http://appswh.chaoxing.com/biapi/', // 线上
        changeOrigin: true,
        pathRewrite: {'^/biapi': '/'}
      },
      '/noteyd': {
        target: 'http://noteyd.chaoxing.com',
        changeOrigin: true,
        pathRewrite: {'^/noteyd': '/'}
      },
      '/yunpan': {
        target: 'https://pan-yz.chaoxing.com',
        changeOrigin: true,
        pathRewrite: {'^/yunpan': '/'}
      },
    }
  }
})
