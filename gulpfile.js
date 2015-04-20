var gulp = require('gulp'),
    tsc = require('gulp-tsc'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    typedoc = require("gulp-typedoc");

gulp.task('docs', function () {
    // typedocs
    gulp.src(["src/Asgard.ts"])
        .pipe(plumber())
        .pipe(typedoc({
            out: "./docs",
            name: "Asgard"
        }))
        .pipe(livereload());
});

gulp.task('build', function () {

    var buildOrder = [
        'Asgard',
        'StockChart',
        'Util/Core',
        'Util/D3',
        'Util/Object',
        'Util/String',
        'Util/Array',
        'Stock/Data/Data',
        'Stock/Options/Interface',
        'Stock/Options/Default',
        'Stock/Components/Interface',
        'Stock/Components/Base',
        'Stock/Components/Axis',
        'Stock/Components/Tips',
        'Stock/Charts/Interface',
        'Stock/Charts/Base',
        'Stock/Charts/Ohlc',
        'Stock/Charts/Candle',
        'Stock/Charts/HollowCandle',
        'Stock/Charts/Line',
        'Stock/Charts/Area',
        'Stock/Charts/Volume'
    ];

    var buildList = [];

    buildOrder.forEach(function (name) {
        buildList.push('./src/typescript/' + name + '.ts');
    });


    // less
    gulp.src('./src/css/theme/**/*.less')
        .pipe(plumber())
        .pipe(less({}))
        .pipe(gulp.dest('./dist/css/theme/'))
        .pipe(livereload());

    // typescript
    gulp.src(buildList)
        .pipe(plumber())
        .pipe(tsc({
            out: 'asgard.js',
            sourcemap: true
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(livereload());

});

gulp.task('serve', function () {
    livereload.listen();
    return gulp.watch(['./src/**/*', './example/**/*'], ['build'])
})