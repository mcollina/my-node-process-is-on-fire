'use strict';

var pkg = require('./package.json'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  livereload = require('gulp-livereload'),
  browserify = require('gulp-browserify'),
  uglify = require('gulp-uglify'),
  pug = require('gulp-pug'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  del = require('del'),
  through = require('through'),
  opn = require('opn'),
  ghpages = require('gh-pages'),
  path = require('path'),
  http = require('http'),
  st = require('st'),
  spawn = require('child_process').spawn,
  isDist = process.argv.indexOf('serve') === -1;

var server;

gulp.task('clean', function() {
  return del('dist')
});

gulp.task('js', function() {
  return gulp.src('src/scripts/main.js')
    .pipe(isDist ? through() : plumber())
    .pipe(browserify({ debug: !isDist }))
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('dist/build'))
    .pipe(livereload());
});

gulp.task('html', () => {
  return gulp.src('src/index.pug')
    .pipe(isDist ? through() : plumber())
    .pipe(pug({ pretty: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});

gulp.task('css', function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({
      // Allow CSS to be imported from node_modules and bower_components
      'include css': true,
      'paths': ['./node_modules']
    }))
    .pipe(autoprefixer('last 2 versions', { map: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/build'))
    .pipe(livereload());
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(livereload());
});

gulp.task('copy-html', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'))
    .pipe(livereload());
});

gulp.task('build', gulp.series('clean', gulp.parallel(['js', 'html', 'css', 'images', 'copy-html'])));

gulp.task('watch', function(done) {
  livereload.listen({ basePath: 'dist' });
  gulp.watch('src/**/*.pug', gulp.parallel('html', 'copy-html'));
  gulp.watch('src/styles/**/*.styl', gulp.parallel('css'));
  gulp.watch('src/images/**/*', gulp.parallel('images'));
  gulp.watch('src/*.html', gulp.parallel('html', 'copy-html'));
  gulp.watch('src/scripts/**/*.js', gulp.parallel('js'));
  gulp.watch('bespoke-theme-*/dist/*.js', gulp.parallel('js')); // Allow themes to be developed in parallel
  done();
});

gulp.task('open', gulp.series('watch', function realOpen () {
  return opn('http://localhost:8080');
}));

gulp.task('server', (done) => {
 server = http.createServer(
    st({ path: __dirname + '/dist', index: 'index.html', cache: false })
  )

 sever.listen(8080, done);
})

gulp.task('serve', gulp.series('build', 'server'));

gulp.task('open', gulp.series('serve', 'watch', 'open'));

gulp.task('default', gulp.series('build'));

gulp.task('deploy', gulp.series('build'), function(done) {
  ghpages.publish(path.join(__dirname, 'dist'), done);
});

gulp.task('pdf', gulp.series('build', 'server', function print () {
  return spawn('decktape', ['bespoke', 'http://localhost:8080', 'slides.pdf'], { stdio: 'inherit' })
}, function shutdown (done) {
  if (server) {
    server.close()
  }
  done()
}))
