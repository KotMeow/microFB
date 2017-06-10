const gulp = require('gulp');
const imagemin = require('gulp-imagemin');

gulp.task('default', () =>
    gulp.src('uploads/*')
        .pipe(imagemin({
          progressive: true
        }))
        .pipe(gulp.dest('uploads'))
);