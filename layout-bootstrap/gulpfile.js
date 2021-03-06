'use strict';
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-clean-css'),
    rimraf = require('rimraf'),
    wait = require('gulp-wait'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        styles: 'build/styles/',
        js: 'build/js'
    },
    src: {
        html: 'src/*.html',
        styles: ['src/styles/style.scss', 'src/styles/bootstrap.scss'],
        js: 'src/js/main.js'
    },
    watch: {
        html: 'src/**/*.html',
        styles: 'src/styles/**/*.scss',
        js: 'src/js/**/*.js'
    },
    clean: './build'
};

var isBootstrap = function(file) {
    return file.relative === 'bootstrap.css';
}

gulp.task('webserver', function() {
    browserSync({
        server: {
            baseDir: './build',
        },
        host: 'localhost',
        port: 3000,
        tunnel: true
    });
});

gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('styles:build', function() {
    return gulp.src(path.src.styles)
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(prefixer())
        // .pipe(cssmin())
        .pipe(gulpif(isBootstrap, cssmin()))
        .pipe(gulp.dest(path.build.styles))
        .pipe(reload({stream:true}));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'styles:build',
]);

gulp.task('watch', function() {
    // gulp.watch('build/*.html').on('change', browserSync.reload);
    watch([path.watch.js], function(ev, callback) {
        gulp.start('js:build');
    });
    watch([path.watch.html], function(ev, callback) {
        gulp.start('html:build');
    });
    watch([path.watch.styles], function(ev, callback) {
        gulp.start('styles:build');
    });
});

gulp.task('clean', function() {
    rimraf(path.clean, callback);
})

gulp.task('default', ['build', 'webserver', 'watch'])
