import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eslint from 'gulp-eslint';
import exorcist from 'exorcist';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import ifElse from 'gulp-if-else';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import cleanCSS from 'gulp-clean-css';
import nodemon from 'gulp-nodemon';
import mocha from 'gulp-mocha';
import del from 'del';
import rename from 'gulp-rename';

let envfile = process.env.NODE_ENV == 'production' ? 'prodenv.js' : 'devenv.js';

// Input file.
var bundler = browserify(['src/main.js', 'src/navi.js', 'src/env.js'], {
    extensions: ['.js', '.jsx'],
    debug: true
});

gulp.task('test', ['build'],   function () {
  var childProc = nodemon({
    script: 'index.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  });

  childProc.on('quit', function () {
    console.log('event emitted, child process is being killed');
  });

  childProc.on('start', function () {
      return gulp.src('./test/test.js')
        .pipe(mocha())
        .once('end', function () {
          console.log('mocha stuff ended. time to kill processes');
          childProc.emit('quit');
          setTimeout(function () {
            console.log('kill main process');
            process.exit();
          }, 1500);
        });
  });
});

gulp.task('moveenv', () => {
  gulp.src(envfile)
  .pipe(rename('env.js'))
  .pipe(gulp.dest('src'));
});

gulp.task('less', () => {
  return gulp.src('src/stylesheets/*.less')
  .pipe(plumber())
  .pipe(less())
  .pipe(cleanCSS())
  .pipe(gulp.dest('public'));
});

// Babel transform
bundler.transform(babelify.configure({
    sourceMapRelative: 'src',
    presets: ["es2015", "react"]
}));

// On updates recompile
bundler.on('update', bundle);

function bundle() {
    return bundler.bundle()
        .on('error', function (err) {
            console.log("=====");
            console.error(err.toString());
            console.log("=====");
            this.emit("end");
        })
        .pipe(exorcist('.bundle.js.map'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(ifElse(process.env.NODE_ENV == 'production', uglify))
        .pipe(gulp.dest('public'))
    ;
}

gulp.task('default', ['transpile']);

gulp.task('transpile', ['lint', 'moveenv'], () => bundle());

gulp.task('lint', () => {
    return gulp.src([
            'src/**/*.jsx',
            'gulpfile.babel.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
    ;
});

gulp.task('build', ['less', 'transpile']);
