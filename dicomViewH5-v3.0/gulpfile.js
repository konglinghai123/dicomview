const clean = require('gulp-clean');
const gulp = require('gulp');
const stylus = require('gulp-stylus');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const px2rem = require('gulp-px3rem');
const browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
/*
 * px2rem 的相关配置
 */
function tranpx() {
  return px2rem({
    baseDpr: 2,             // base device pixel ratio (default: 2)
    threeVersion: false,    // whether to generate @1x, @2x and @3x version (default: false)
    remVersion: true,       // whether to generate rem version (default: true)
    remUnit: 75,            // rem unit value (default: 75)
    remPrecision: 6         // rem precision (default: 6)
  })
}

gulp.task('serve', ['stylus','uglify','copy'], function() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
});

gulp.task('stylus', function() {
    gulp.src('./csslib/*.css')
      .pipe(concat('all.css'))
    //   .pipe(tranpx())
      .pipe(cssmin()) 
      .pipe(rename(function (path) {
        path.basename = path.basename.split(".")[0];
      }))
      .pipe(gulp.dest('./build/csslib'))
});

gulp.task('uglify', function() {
  gulp.src([
            './jslib/modernizr/modernizr.js',
            './jslib/i18next/i18next.js',
            './jslib/i18next/i18nextXHRBackend.js',
            './jslib/i18next/i18nextBrowserLanguageDetector.js',
            './jslib/konva-1.6.0.min.js',

            './jslib/jquery/jquery-2.1.4.min.js',
            './jslib/jquery-ui/jquery-ui-1.12.0.min.js',
            './jslib/flot/jquery.flot.min.js',
            './jslib/bootstrap.min.js',
            './jslib/qrcode.min.js',
            './jslib/flexible.js',

            './jslib/dwv/**/*.js',

            './bin/publicFn.js',
            './bin/initFn.js',
            './bin/dwvContainer.js',
            './bin/viewCreate.js',
            './bin/appgui.js',
            './bin/applauncher.js',
            './bin/3dutil.js',
            './bin/3dbuilder.js',
      ])
      .pipe(concat('main.js'))
      .pipe(uglify())  
      .pipe(gulp.dest('./build/js'))
})

gulp.task('copy',function(){
    gulp.src('./locales/**/*.json')
        .pipe(gulp.dest('./build/locales'));
    gulp.src('./csslib/fonts/*')
        .pipe(gulp.dest('./build/csslib/fonts'));
    gulp.src('./index-product.html')
        .pipe(rename(function (path) {
            path.basename = 'index'
        }))
        .pipe(gulp.dest('./build/'));
    gulp.src('./favicon.ico')
        .pipe(gulp.dest('./build/'));
    gulp.src('./imageCache.html')
        .pipe(gulp.dest('./build/'));
});

gulp.task('clean', function() {
    return gulp.src('./build/')
         .pipe(clean());
});

gulp.task('default', ['stylus', 'uglify' ,'copy']);