var gulp = require('gulp')
var babel = require('gulp-babel')
var sourcemaps = require('gulp-sourcemaps')
var plumber = require('gulp-plumber')
var liveReload = require('gulp-livereload');
var concat = require('gulp-concat')
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');


gulp.task("watch", ['all'], function () {
    liveReload.listen();
    return gulp.watch('src/**/*.js', ['all'])
})


gulp.task('all', function () {
    browserify({
        entries: './src/Asgard.js',
        debug: true,
        standalone: "Asgard"
    }).transform(babelify)
        .bundle()
        .on('error', function (err) {
            gutil.log(
                gutil.colors.red("Browserify compile error:"),
                err.message
            )
        })
        .pipe(source('asgard.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['all'], function () {

})