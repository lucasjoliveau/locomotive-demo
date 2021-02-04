const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const newer = require('gulp-newer');                  // https://www.npmjs.com/package/gulp-newer
const imagemin = require('gulp-imagemin');            // https://www.npmjs.com/package/gulp-imagemin
const htmlclean = require('gulp-htmlclean');          // https://www.npmjs.com/package/gulp-htmlclean
const stripdebug = require('gulp-strip-debug');       // https://www.npmjs.com/package/gulp-strip-debug
const uglify = require('gulp-uglify');                // https://www.npmjs.com/package/gulp-uglify
const sourcemaps = require('gulp-sourcemaps');        // https://www.npmjs.com/package/gulp-sourcemaps
const sass = require('gulp-sass');                    // https://www.npmjs.com/package/gulp-sass
const postcss = require('gulp-postcss');              // https://github.com/postcss/gulp-postcss
const autoprefixer = require('autoprefixer');         //https://www.npmjs.com/package/autoprefixer
const cssnano = require('cssnano');                   // https://www.npmjs.com/package/cssnano

const folder = {
    src: 'src/',
    dist: 'dist/'
};

const copier_normalize = function(){
    return gulp.src('node_modules/normalize.css/normalize.css')
        .pipe(gulp.dest(folder.dist +'/css'))
};

const optimiser_images = function() {
    var out = folder.dist + 'images/';

    return gulp.src(folder.src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin({ optimizationLevel: 7 }))
        .pipe(gulp.dest(out));
};

const optimiser_html = function() {
    var out = folder.dist;

    return gulp.src(folder.src + '/**/*.html')
        .pipe(newer(out))
        .pipe(htmlclean())
        .pipe(gulp.dest(out));


};

const optimiser_css = function() {

    var postCssOpts = [
        autoprefixer({ overrideBrowserslist: ['last 2 versions', '> 2%'] })
        //,cssnano
    ];

    return gulp.src(folder.src + 'scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            imagePath: 'images/',
            precision: 4,
            errLogToConsole: true
        }))
        .pipe(postcss(postCssOpts))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(folder.dist + 'css/'));

};

const optimiser_js = function() {
    var out = folder.dist;

    return gulp.src(folder.src + 'js/**/*')
        .pipe(sourcemaps.init())
        //.pipe(stripdebug())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(out + 'js/'));
};

const watch = function() {

    gulp.watch(folder.src + 'images/**/*', gulp.parallel(optimiser_images));
    gulp.watch(folder.src + '**/*', gulp.parallel(optimiser_html));
    gulp.watch(folder.src + 'js/**/*', gulp.parallel(optimiser_js));
    gulp.watch(folder.src + 'scss/**/*', gulp.parallel(optimiser_css));

};

const serveur = function () {

    browserSync.init({
        port: 3000,
        server: "./dist/",
        ghostMode: false,
        notify: false,
        //browser: ["firefox"]
        browser: ["chrome"]
        //browser: ["firefox", "google chrome"]
    });
    gulp.watch('**/*.css').on('change', browserSync.reload);
    gulp.watch('**/*.html').on('change', browserSync.reload);
    gulp.watch('**/*.js').on('change', browserSync.reload);

};


gulp.task('copier_normalize', copier_normalize);
gulp.task('optimiser_images', optimiser_images);
gulp.task('optimiser_html', gulp.series('optimiser_images', optimiser_html));
gulp.task('optimiser_css', gulp.series('optimiser_images', optimiser_css));
gulp.task('optimiser_js', optimiser_js);
gulp.task('watch', watch);
gulp.task('serveur', serveur);


gulp.task('execution', gulp.parallel('optimiser_html', 'optimiser_css', 'optimiser_js', 'copier_normalize'));


gulp.task('default', gulp.series( 'execution', gulp.parallel('watch', 'serveur')));