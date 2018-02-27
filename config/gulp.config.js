const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const less = require('gulp-less')
const gutil = require('gulp-util')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const revertPath = require('gulp-revert-path')
const eslint = require('gulp-eslint')
const px2rpx = require('gulp-px2rpx')
const gulpif = require('gulp-if')
const changed = require('gulp-changed')
const ipv4 = require('ipv4')
const gulpWebpack = require('webpack-stream')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')
const miniProgram = require('./gulp-mini-program')

const NODE_ENV = process.env.NODE_ENV || 'development'
const settings = {
  ipv4,
  NODE_ENV,
  PORT: process.env.PORT || 3000,
  __DEV__: NODE_ENV === 'development'
}
const colors = gutil.colors
const handleError = function (err) {
  console.log('\n')
  gutil.log(colors.red('Error!'))
  gutil.log('fileName: ' + colors.red(err.fileName))
  gutil.log('lineNumber: ' + colors.red(err.lineNumber))
  gutil.log('message: ' + err.message)
  gutil.log('plugin: ' + colors.yellow(err.plugin))
  this.emit('end')
}

const srcFiles = {
  js: ['src/**/*.js', 'src/**/*.wxs', '!src/lib/**'],
  style: ['src/**/*.less', 'src/**/*.wxss', '!src/**/_*.less'],
  other: ['src/**/*.wxml', 'src/**/*.json', 'src/**/*.{png,svg,jpg,jpeg}'],
}

const fileCopy = (src = srcFiles.other, dest = 'dist') => {
  return gulp.src(src, { base: 'src' }).pipe(changed(dest)).pipe(gulp.dest(dest))
}

// lessCompile
const lessCompile = (src = srcFiles.style, dest = 'dist', use_changed = true) => {
  return gulp.src(src, { base: 'src' })
    .pipe(gulpif(use_changed, changed(dest, { extension: '.wxss' })))
    .pipe(less())
    .on('error', handleError)
    .pipe(
      px2rpx({
        screenWidth: 375,
        wxappScreenWidth: 750
      })
    )
    .pipe(
      autoprefixer([
        'iOS >= 8',
        'Android >= 4.1'
      ])
    )
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest(dest))
}

const buildJS = (src = srcFiles.js, dest = 'dist') => {
  return gulp.src(src, { base: 'src' })
    .pipe(changed(dest))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(!settings.__DEV__, eslint.failAfterError()))
    .pipe(babel())
    .on('error', handleError)
    .pipe(miniProgram(settings, webpackConfig.resolve.alias))
    .pipe(revertPath())
    .pipe(gulp.dest(dest))
}

const runWebpack = done => {
  gulp.src('src/lib/index.js')
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest('dist/lib'))
  done()
}

const lint = (src = ['src/**/*.js']) => {
  return gulp.src(src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

module.exports = {
  fileCopy,
  lessCompile,
  buildJS,
  runWebpack,
  lint,
  srcFiles,
}
