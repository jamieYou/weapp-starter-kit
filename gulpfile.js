const gulp = require('gulp')
const del = require('del')
const createConfig = require('./config/gulp.config')

const { take_names, watch_take } = createConfig()

// clean dist folder
gulp.task('clean', () => del(['./dist/**']))

gulp.task('dev', gulp.series(['clean', ...take_names, watch_take]))

gulp.task('build', gulp.series(['clean', ...take_names]))
