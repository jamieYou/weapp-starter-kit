const gulp = require('gulp')
const del = require('del')
const config = require('./config/gulp.config')

// clean dist folder
gulp.task('clean', () => del(['./dist/**']))

gulp.task('copy-file', () => config.fileCopy())

gulp.task('lessCompile', () => config.lessCompile())

gulp.task('buildJsTask', () => config.buildJS())

gulp.task('eslint', () => config.lint())

gulp.task('webpack', config.runWebpack)

// watch 监听
gulp.task('watch', done => {
  gulp.watch(config.srcFiles.other, gulp.series(['copy-file']))
  gulp.watch(config.srcFiles.style, gulp.series(['lessCompile']))
  gulp.watch(config.srcFiles.js, gulp.series(['buildJsTask']))
  done()
})

gulp.task(
  'dev',
  gulp.series(['clean', 'buildJsTask', 'webpack', 'lessCompile', 'copy-file', 'watch']),
)

gulp.task('build', gulp.series(['clean', 'buildJsTask', 'webpack', 'lessCompile', 'copy-file']))
