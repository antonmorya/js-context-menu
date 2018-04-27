const gulp = require('gulp');
const babel = require('gulp-babel');
var sass = require('gulp-sass');
var rename = require("gulp-rename");

gulp.task('js', () =>
    gulp.src('./js/app.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(rename({ suffix: '-es5' }))
        .pipe(gulp.dest('js/'))
);

gulp.task('sass', function () {
    return gulp.src('./scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

// watch files for changes and reload
gulp.task('serve', function () {
    gulp.watch('./scss/*.scss', gulp.parallel('sass'));
    gulp.watch('./js/app.js', gulp.parallel('js'));
});