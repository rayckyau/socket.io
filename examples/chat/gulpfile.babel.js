import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eslint from 'gulp-eslint';
import exorcist from 'exorcist';
import watchify from 'watchify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import ifElse from 'gulp-if-else';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import less from 'gulp-less';

watchify.args.debug = true;

// Input file.
var bundler = browserify('src/main.js', {
    extensions: ['.js', '.jsx'],
    debug: true
});

gulp.task('less', () => {
  return gulp.src('src/stylesheets/*.less')
  .pipe(plumber())
  .pipe(less())
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
        //.pipe(ifElse(process.env.NODE_ENV === 'production', uglify))
        //.pipe(uglify())
        .pipe(gulp.dest('public'))
    ;
}

gulp.task('default', ['transpile']);

gulp.task('transpile', ['lint'], () => bundle());

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
