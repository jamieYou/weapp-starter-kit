const gulp = require('gulp')
const del = require('del')
const { take_names, watch_take } = require('./config/gulp.config')

// clean dist folder
gulp.task('clean', () => del(['./dist/**']))

gulp.task('dev', gulp.series(['clean', ...take_names, watch_take]))

gulp.task('build', gulp.series(['clean', ...take_names]))
