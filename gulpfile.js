var path = require('path');

var gulp = require('gulp');

var clean = require('gulp-clean');

var sass = require('gulp-sass');
var cssmin = require('gulp-minify-css');

var jscs = require('gulp-jscs');

var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');

var livereload = require('gulp-livereload');

var concat = require('gulp-concat');

var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var paths = {
    css: {
        files: ['src/scss/**/*.scss'],
        src: ['src/scss/framework.scss'],
        all: 'framework.css',
        dest: 'css/',
    },
    js: {
        files: ['gulpfile.js', 'src/js/**/*.js'],
        src: ['src/js/core.js', 'src/js/**/*.js'],
        all: 'framework.js',
        dest: 'js',
    },
    img: {
        src: ['src/img/**/*'],
        dest: 'img',
    }
};

// 注册"clean"任务: 删除文件
gulp.task('clean', function () {
    return gulp.src([paths.css.dest, paths.js.dest, paths.img.dest])
        .pipe(clean());
});

// 注册"sass"任务: 编译sass
gulp.task('sass', function (done) {
    return gulp.src(paths.css.src)
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest(paths.css.dest));
});

// 注册"cssmin"任务: 压缩 css 文件
gulp.task('cssmin', ['sass'], function () {
    return gulp.src(path.join(paths.css.dest, paths.css.all))
        .pipe(cssmin())
        .pipe(rename(function (path) {
            if (path.extname === '.css') {
                path.basename += '.min';
            }
        }))
        .pipe(gulp.dest(paths.css.dest));
});

// 注册"jscs"任务: 检查js code style
gulp.task('jscs', function () {
    return gulp.src(paths.js.files)
        .pipe(jscs())
        .pipe(jscs.reporter());
});

// 注册"jslint"任务: 检查js语法
gulp.task('jslint', function () {
    return gulp.src(paths.js.files)
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish));
});

// 注册"concat"任务: 合并 js 文件
gulp.task('concat', function () {
    return gulp.src(paths.js.src)
        .pipe(concat(paths.js.all))
        .pipe(gulp.dest(paths.js.dest));
});

// 注册"jsmin"任务: 压缩 js 文件
gulp.task('jsmin', ['concat'], function () {
    return gulp.src(path.join(paths.js.dest, paths.js.all))
        .pipe(uglify())
        .pipe(rename(function (path) {
            if (path.extname === '.js') {
                path.basename += '.min';
            }
        }))
        .pipe(gulp.dest(paths.js.dest));
});

// 注册"imgmin"任务: 压缩 js 文件
gulp.task('imgmin', function () {
    return gulp.src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest));
});

// 注册"watch"任务: 监听文件的修改
gulp.task('watch', function () {
    livereload.listen();

    gulp.watch(paths.css.files, ['sass', 'cssmin']);
    gulp.watch(paths.js.files, ['jslint', 'jscs', 'jsmin']);
});

gulp.task('default', ['cssmin', 'jsmin', 'imgmin']);
