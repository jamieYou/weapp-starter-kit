const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const less = require('gulp-less')
const gutil = require('gulp-util')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const eslint = require('gulp-eslint')
const px2rpx = require('gulp-px2rpx')
const gulpif = require('gulp-if')
const changed = require('gulp-changed')
const lessChanged = require('gulp-less-changed')
const _ = require('lodash')
const notifier = require('node-notifier')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const { __DEV__ } = require('./env')
const wxBabel = require('./gulp-wx-babel')
const ewx = require('./gulp-ewx')

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

const takes_config = {
  fileCopy: [
    ['src/**/*.json', 'src/**/*.{png,svg,jpg,jpeg}', 'src/**/*.wxs'],
    steam => steam
      .pipe(changed('dist'))
      .pipe(gulp.dest('dist'))
  ],

  wxmlCopy: [
    'src/**/*.wxml',
    steam => steam
      .pipe(changed('dist'))
      .pipe(
        px2rpx({
          screenWidth: 375,
          wxappScreenWidth: 750,
        }),
      )
      .pipe(gulp.dest('dist'))
  ],

  lessCompile: [
    'src/**/*.{less,wxss}',
    steam => steam
      .pipe(lessChanged())
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
      .pipe(gulp.dest('dist'))
  ],

  buildJS: [
    'src/**/*.js',
    steam => steam
      .pipe(changed('dist'))
      .pipe(sourcemaps.init())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(gulpif(!__DEV__, eslint.failAfterError()))
      .pipe(babel())
      .pipe(wxBabel())
      .on('error', handleError)
      .pipe(gulpif(!__DEV__, uglify()))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('dist'))
  ],

  ewxParse: [
    'src/**/*.ewx',
    steam => steam
      .pipe(changed('dist'))
      .pipe(
        px2rpx({
          screenWidth: 375,
          wxappScreenWidth: 750,
        }),
      )
      .pipe(ewx())
      .on('error', handleError)
      .pipe(rename({ extname: '.wxml' }))
      .pipe(gulp.dest('dist'))
  ]
}

const watch_list = _.map(takes_config, ([src, take], name) => {
  gulp.task(name, () => {
    return take(gulp.src(src, { base: 'src' }))
  })

  return () => gulp.watch(src, gulp.series([name]))
})

gulp.task('eslint', () => {
  return gulp
    .src('src/**/*.{js,wxs}')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('watch', done => {
  watch_list.forEach(watch => watch())
  done()
})

module.exports =  {
  take_names: Object.keys(takes_config),
  watch_take: 'watch',
}
