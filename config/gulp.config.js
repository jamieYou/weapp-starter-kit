const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const less = require('gulp-less')
const gutil = require('gulp-util')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const revertPath = require('gulp-revert-path')
const eslint = require('gulp-eslint')
const px2rpx = require('gulp-px2rpx')
const gulpif = require('gulp-if')
const changed = require('gulp-changed')
const ipv4 = require('ipv4')
const notifier = require('node-notifier')
const miniProgram = require('./gulp-mini-program')

const NODE_ENV = process.env.NODE_ENV || 'development'
const settings = {
  ipv4,
  NODE_ENV,
  PORT: process.env.PORT || 3000,
  __DEV__: NODE_ENV === 'development',
}
const colors = gutil.colors
const handleError = function (err) {
  gutil.log(colors.red('Error!'))
  gutil.log('fileName: ' + colors.red(err.fileName))
  gutil.log('lineNumber: ' + colors.red(err.lineNumber))
  gutil.log('message: ' + err.message)
  gutil.log('plugin: ' + colors.yellow(err.plugin))
  notifier.notify({ title: `${err.plugin}错误`, message: err.fileName || err.message })
  this.emit('end')
}

const srcFiles = {
  js: ['src/**/*.js', 'src/**/*.wxs'],
  style: ['src/**/*.less', 'src/**/*.wxss'],
  html: ['src/**/*.wxml'],
  other: ['src/**/*.json', 'src/**/*.{png,svg,jpg,jpeg}'],
}

const fileCopy = (src = srcFiles.other, dest = 'dist') => {
  return gulp
    .src(src, { base: 'src' })
    .pipe(changed(dest))
    .on('error', handleError)
    .pipe(gulp.dest(dest))
}

const wxmlCopy = (src = srcFiles.html, dest = 'dist') => {
  return gulp
    .src(src, { base: 'src' })
    .pipe(changed(dest))
    .on('error', handleError)
    .pipe(
      px2rpx({
        screenWidth: 375,
        wxappScreenWidth: 750,
      }),
    )
    .pipe(gulp.dest(dest))
}

// lessCompile
const lessCompile = (src = srcFiles.style, dest = 'dist') => {
  return gulp
    .src(src, { base: 'src' })
    .pipe(less())
    .on('error', handleError)
    .pipe(
      px2rpx({
        screenWidth: 375,
        wxappScreenWidth: 750,
      }),
    )
    .pipe(autoprefixer(['iOS >= 8', 'Android >= 4.1']))
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest(dest))
}

const buildJS = (src = srcFiles.js, dest = 'dist') => {
  return gulp
    .src(src, { base: 'src' })
    .pipe(changed(dest))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(!settings.__DEV__, eslint.failAfterError()))
    .pipe(babel())
    .on('error', handleError)
    .pipe(miniProgram(settings))
    .on('error', handleError)
    .pipe(gulpif(!settings.__DEV__, uglify()))
    .pipe(revertPath())
    .pipe(gulp.dest(dest))
}

const lint = (src = srcFiles.js) => {
  return gulp
    .src(src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

module.exports = {
  fileCopy,
  lessCompile,
  buildJS,
  wxmlCopy,
  lint,
  srcFiles,
}
