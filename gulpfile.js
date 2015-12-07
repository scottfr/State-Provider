// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');


// Concatenate & Minify JS
gulp.task('scripts', function() {
  var bundler = browserify({
      entries: 'src/app.js',
      debug: true
  });
  bundler
  .transform(babelify);

  bundler.bundle()
      .on('error', function (err) { console.error(err); })
      .pipe(source('src/app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(concat("state_provider.js"))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist'))
      .pipe(rename('state_provider.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('src/*.js', ['scripts']);
});

// Default Task
gulp.task('default', ['scripts', 'watch']);
