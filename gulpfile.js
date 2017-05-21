var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var pump = require('pump');
var babel  = require('gulp-babel');

gulp.task('compress', function (cb) {
  pump([
        gulp.src('./public/javascripts/*.js'),
        babel({presets: ['es2015']}),
        concat('all.js'),
        uglify(),
        gulp.dest('./public/javascripts/')
      ],
      cb
  );
});