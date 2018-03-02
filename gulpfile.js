'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    pug = require('gulp-pug'),
    imagemin = require('gulp-imagemin'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    path = require('path'),
    cssmin = require('gulp-minify-css'),
    cached = require('gulp-cached'),
    webp = require('gulp-webp'),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/image/',
        fonts: 'build/fonts/',
        vendors: 'build/vendors/',
        webp: 'build/img/banners/'
    },
    src: {
        html: 'src/*.pug',
        js: 'src/js/**/*.js',
        style: 'src/style/main.scss',
        img: 'src/image/**/*.*',
        fonts: 'src/fonts/**/*.*',
        mail: 'src/mail/**/*.*',
        vendors: 'src/vendors/node_modules/',
        webp: 'src/img/banners/'
    },
    watch: {
        html: 'src/**/*.pug',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/image/**/*.*',
        mail: 'src/mail/**/*.*',
        fonts: 'src/fonts/**/*.*',
        vendors: 'src/vendors/**/*.*',
        webp: 'src/img/banners/'
    },
    clean: './build'
};

var configLocal = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "SuperStaff"
};

var onError = function(err) {
    console.log(err);
};

gulp.task('webserver', function() {
    browserSync(configLocal);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(pug())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(rigger())
        .pipe(sourcemaps.init())
        //.pipe(uglify())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
});


gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'nested',
            sourceMap: true,
            errLogToConsole: true,
            includePaths: require('node-normalize-scss').includePaths
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .pipe(plumber())
        .pipe(imagemin([
            imagemin.jpegtran({ progressive: true })
            // imagemin.optipng({ optimizationLevel: 5 })
        ]))
        .pipe(gulp.dest(path.build.img))
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('vendors:build', function() {
    // jQuery
    gulp.src(path.src.vendors + 'jquery/dist/**/*.*')
        .pipe(gulp.dest(path.build.vendors + 'jquery/'));

    // magnific-popup
    gulp.src(path.src.vendors + 'magnific-popup/dist/**/*.*')
        .pipe(gulp.dest(path.build.vendors + 'magnific-popup/'));

    // jquery-form-styler
    gulp.src(path.src.vendors + 'jquery-form-styler/dist/**/*.*')
        .pipe(gulp.dest(path.build.vendors + 'jquery-form-styler/'));

    // select2
    gulp.src(path.src.vendors + 'select2/dist/**/*.*')
        .pipe(gulp.dest(path.build.vendors + 'select2/'));
    
});

gulp.task('webp:build', ['image:build'], function() {
    return gulp.src(['build/img/banners/**/*.jpg', 'build/img/banners/**/*.png'])
        .pipe(cached('build/img/banners'))
        .pipe(webp({
            quality: 85
        }))
        .pipe(gulp.dest(path.build.webp))
        .pipe(browserSync.stream({
            once: true
        }));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'vendors:build',
    'webp:build'
]);

gulp.task('webserver', function() {
    browserSync(configLocal);
});

gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('webp:build');
    });
    watch([path.watch.vendors], function(event, cb) {
        gulp.start('vendors:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);
