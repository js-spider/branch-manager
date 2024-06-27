const json = require('@rollup/plugin-json')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')

module.exports = {
  input: 'src/index.js',
  output: {
    dir: 'lib',
    format: 'cjs'
  },
  plugins:[
    json(),
    commonjs(),
    resolve(),
  ]
};
