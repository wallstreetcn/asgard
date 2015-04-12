var gulp = require('gulp');
var tsc = require('gulp-tsc');

gulp.task('default', function () {

    gulp.src(['./src/asgard.ts'])
        .pipe(tsc({
            out: 'asgard.js',
            sourcemap: true
        }))
        .pipe(gulp.dest('./'));
});