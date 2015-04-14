var gulp = require('gulp'),
    tsc = require('gulp-tsc'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber');

gulp.task('build', function () {

    // less
    gulp.src('./src/css/theme/**/*.less')
        .pipe(plumber())
        .pipe(less({}))
        .pipe(gulp.dest('./dist/css/theme/'))
        .pipe(livereload());

    // typescript
    gulp.src(['./src/asgard.ts'])
        .pipe(plumber())
        .pipe(tsc({
            out: 'asgard.js',
            sourcemap: true
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(livereload());

});

gulp.task('serve',function(){
    livereload.listen();
    return gulp.watch(['./src/asgard.ts','./src/css/**/*.less','./example/**/*'],['build'])
})