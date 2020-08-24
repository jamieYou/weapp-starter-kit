require('../config/env')
const del = require('del')
const gulp = require('gulp')
const gutil = require('gulp-util')
const uglify = require('gulp-uglify-es').default
const eslint = require('gulp-eslint')
const gulpif = require('gulp-if')
const changed = require('gulp-changed')
const notifier = require('node-notifier')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const header = require('gulp-header')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const wxBabel = require('./gulp-wx-babel')
const px2rpx = require('./gulp-px2rpx')

const handleError = function (err) {
  const colors = gutil.colors
  gutil.log(colors.red('Error!'))
  gutil.log('fileName: ' + colors.red(err.fileName))
  gutil.log('lineNumber: ' + colors.red(err.lineNumber))
  gutil.log('message: ' + err.message)
  gutil.log('plugin: ' + colors.yellow(err.plugin))
  notifier.notify({ title: `${err.plugin}错误`, message: err.fileName || err.message })
  this.emit('end')
}

const fileTypes = {
  fileCopy: ['src/**/*.json', 'src/**/*.{png,svg,jpg,jpeg}', 'src/**/*.wxs'],
  wxmlCopy: 'src/**/*.wxml',
  wxssCompile: 'src/**/*.wxss',
  scssCompile: ['src/**/*.scss', '!_*.scss', '!src/styles/*.scss'],
  buildJS: ['src/**/*.js'],
}

function fileCopy() {
  return gulp.src(fileTypes.fileCopy, { base: 'src' })
    .pipe(changed('dist'))
    .pipe(gulp.dest('dist'))
}

function wxmlCopy() {
  return gulp.src(fileTypes.wxmlCopy, { base: 'src' })
    .pipe(changed('dist'))
    .pipe(px2rpx())
    .pipe(gulp.dest('dist'))
}

function wxssCompile() {
  return gulp.src(fileTypes.wxssCompile, { base: 'src' })
    .pipe(changed('dist'))
    .pipe(px2rpx())
    .pipe(autoprefixer(['iOS >= 8', 'Android >= 4.1']))
    .pipe(gulp.dest('dist'))
}

const sassHeader = `
@import 'src/styles/colors.scss';
@import 'src/styles/mixins.scss';
`

function scssTask(useChanged) {
  return gulp.src(fileTypes.scssCompile, { base: 'src' })
    .pipe(gulpif(useChanged, changed('dist', { extension: '.wxss' })))
    .pipe(header(sassHeader))
    .pipe(sass())
    .on('error', handleError)
    .pipe(px2rpx())
    .pipe(autoprefixer(['iOS >= 8', 'Android >= 4.1']))
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest('dist'))
}

function scssCompile() {
  return scssTask(true)
}

function buildJS() {
  return gulp.src(fileTypes.buildJS, { base: 'src' })
    .pipe(changed('dist'))
    .pipe(eslint())
    .pipe(babel())
    .pipe(wxBabel())
    .on('error', handleError)
    .pipe(gulp.dest('dist'))
}

function uglifyJs() {
  return gulp.src('dist/**/*.js', { base: 'dist' })
    .pipe(uglify({ toplevel: true }))
    .pipe(gulp.dest('dist'))
}

function watch(done) {
  gulp.watch(fileTypes.fileCopy, gulp.series(fileCopy))
  gulp.watch(fileTypes.wxmlCopy, gulp.series(wxmlCopy))
  gulp.watch(fileTypes.wxssCompile, gulp.series(wxssCompile))
  gulp.watch(fileTypes.scssCompile, gulp.series(scssCompile))
  gulp.watch(fileTypes.buildJS, gulp.series(buildJS))
  gulp.watch(
    ['_*.scss', 'src/styles/*.scss'],
    function scssCompile() {
      return scssTask(false)
    }
  )
  done()
}

function clean() {
  return del(['./dist/**'])
}

function eslintCode() {
  return gulp
    .src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.failAfterError())
}

const common = [clean, gulp.parallel(fileCopy, wxmlCopy, wxssCompile, buildJS, scssCompile)]

exports.dev = gulp.series(...common, watch)
exports.build = gulp.series(...common, uglifyJs)
exports.eslint = eslintCode
