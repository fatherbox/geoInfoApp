var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');

gulp.task('copy-html-files', function() {
    gulp.src(['*.html', '!index.html', 'globe.gif'], {base: './'})
        .pipe(gulp.dest('build/'));
});

gulp.task('usemin', function() {
    gulp.src('index.html')
        .pipe(usemin({
            css: [minifyCss(), 'concat', rev()],
            js: [uglify(), rev()]
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('build', ['copy-html-files', 'usemin']);