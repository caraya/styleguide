/*jslint node: true */

'use strict';
// Require Gulp first
const gulp = require('gulp');
//  packageJson = require('./package.json'),
// Load plugins
const   $ = require('gulp-load-plugins')({lazy: true});
// Static Web Server stuff
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const historyApiFallback = require('connect-history-api-fallback');
// postcss
const postcss = require('gulp-postcss');
// Autoprefixer
const autoprefixer = require('autoprefixer');
// SASS
const sass = require('gulp-ruby-sass');
// SASSDoc
const sassdoc = require('sassdoc');
// scss lint
const scsslint = require('gulp-scss-lint');
// Critical CSS
const critical = require('critical');
// Imagemin and Plugins
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const webp = require('imagemin-webp');
// Utilities
const runSequence = require('run-sequence');
const del = require('del');
// Act only on newer files
const newer = require('gulp-newer');
// explicitly require eslint
const eslint = require('gulp-eslint');
// accessibility testing
const axe = require('gulp-axe-webdriver');
// security audit
const snyk = require('gulp-snyk')
;

//var key = '';
const SITE = '';

// List of browser versions we'll autoprefix for.
// Taken from the Polymer Starter Kit gulpfile
const AUTOPREFIXER_BROWSERS = [
  'ie >= 12',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// SCSS conversion and CSS processing
/**
 * @name sass
 * @description SASS conversion task to produce development css with expanded syntax.
 *
 * We run this task agains Ruby SASS, not lib SASS. As such it requires the SASS Gem to be installed
 *
 * @see {@link http://sass-lang.com|SASS}
 * @see {@link http://sass-compatibility.github.io/|SASS Feature Compatibility}
 */
gulp.task('sass', () =>{
  return sass('src/scss/**/*.scss', {
    sourcemap: true,
    style: 'expanded',
    lineNumbers: true,
    lineComments: true
  })
  .pipe(gulp.dest('src/css'))
  .pipe($.size({
    pretty: true,
    title: 'SASS'
  }));
});

/**
 * @name scss-lint
 * @description Runs scss-lint against your SCSS files (will not work on files written with the original SASS syntax) to provide style checks.
 *
 * This task depends on the scss-lint Ruby gem
 *
 * @see {@link https://github.com/brigade/scss-lint|scss-lint}
 */
gulp.task('scss-lint', ['sass'], () =>{
  return gulp.src([
    'src/scss/**/*.scss',
    '!src/scss/normalize/**/.*',
    '!src/scss/modular-scale/**/*',
    '!src/scss/partials/_prism.scss',
    '!src/scss/utility-opentype.scss'
  ], {base:"."})
  .pipe(scsslint({
    'reporterOutputFormat': 'Checkstyle'
  }));
});

/**
 * @name sassdoc
 * @description generate documentation from your SASS stylesheets
 *
 * @see {@link http://sassdoc.com/|SASSDoc}
 * @see {@link http://sassdoc.com/getting-started/|SASSDoc documentation}
 */
gulp.task('sassdoc', ['scss-lint'] , () =>{
  return gulp.src('src/sass/**/*.scss')
  .pipe(sassdoc({
    dest: 'src/sassdocs',
    verbose: true,
    display: {
      access: ['public', 'private'],
      alias: true
    }
  }));
});

/**
 * @name processCSS
 *
 * @description Run autoprefixer and cleanCSS on the CSS files under src/css
 *
 * Moved from gulp-autoprefixer to postcss. It may open other options in the future
 * like cssnano to compress the files
 *
 * @see {@link https://github.com/postcss/autoprefixer|autoprefixer}
 */
gulp.task('processCSS', ['sassdoc'], () =>{
  return gulp.src('src/css/**/*.css')
  .pipe($.sourcemaps.init())
  .pipe($.postcss([
    autoprefixer({ browsers: AUTOPREFIXER_BROWSERS })
  ]))
  // .pipe($.cssnano())
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('src/css'))
  .pipe($.size({
    pretty: true,
    title: 'processCSS'
  }));
});

/**
 * @name uncss
 * @description Taking a css and an html file, UNCC will strip all CSS selectors not used in the page
 *
 * @see {@link https://github.com/giakki/uncss|uncss}
 */
gulp.task('uncss', () =>{
  return gulp.src('src/css/**/*.css')
  .pipe($.concat('main.css'))
  .pipe($.uncss({
    html: ['index.html']
  }))
  .pipe(gulp.dest('css/main.css'))
  .pipe($.size({
    pretty: true,
    title: 'Uncss'
  }));
});

// Generate & Inline Critical-path CSS
gulp.task('critical', () =>{
  return gulp.src('src/*.html')
  .pipe(critical({
    base: 'src/',
    inline: true,
    css: ['src/css/main.css'],
    minify: true,
    extract: false,
    ignore: ['font-face'],
    dimensions: [{
      width: 320,
      height: 480
    }, {
      width: 768,
      height: 1024
    }, {
      width: 1280,
      height: 960
    }]
  }))
  .pipe($.size({
    pretty: true,
    title: 'Critical'
  }))
  .pipe(gulp.dest('dist'));
});

/**
 * @name babel
 * @description Transpiles ES6 to ES5 using Babel. As Node and browsers support more of the spec natively this will move to supporting ES2016 and later transpilation
 *
 * It requires the `babel`, `babel-preset-es2015`, `babel-preset-es2016` and `babel-preset-es2017` plugins
 *
 * @see {@link http://babeljs.io/|Babel}
 * @see {@link http://babeljs.io/docs/learn-es2015/|Learn ES2015}
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/|ECMAScript 2015 specification}
 */
gulp.task('babel', () =>{
  return gulp.src('src/es6/**/*.js')
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: ['es2015', 'es2016', 'es2017']
  }))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('src/js/'))
  .pipe($.size({
    pretty: true,
    title: 'Babel'
  }));
});

/**
 * @name eslint
 * @description Runs eslint on all javascript files
 */
gulp.task('eslint', () =>{
  return gulp.src([
    'scr/scripts/**/*.js',
    '!src/scripts/vendor'
  ])
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.eslint.failAfterError());
});


/**
 * @name jsdoc
 * @description runs jsdoc on the gulpfile and README.md to genereate documentation
 *
 * @see {@link https://github.com/jsdoc3/jsdoc|JSDOC}
 */
gulp.task('jsdoc', () =>{
  return gulp.src(['README.md', 'gulpfile.js'])
  .pipe($.jsdoc3());
});

/**
 * @name imagemin
 * @description Reduces image file sizes. Doubly important if we'll choose to play with responsive images.
 *
 * Imagemin will compress jpg (using mozilla's mozjpeg), SVG (using SVGO) GIF and PNG images but WILL NOT create multiple versions for use with responsive images
 *
 * @see {@link https://github.com/postcss/autoprefixer|Autoprefixer}
 * @see {@link processImages}
 */
gulp.task('imagemin', () =>{
  return gulp.src('src/images/originals/**/*.{gif,jpg,png,svg}')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [
      {removeViewBox: false},
      {cleanupIDs: false}
    ],
    use: [mozjpeg()]
  }))
  .pipe(gulp.dest('css/images'))
  .pipe($.size({
    pretty: true,
    title: 'imagemin'
  }));
});

/**
 * @name processImages
 * @description processImages creates a set of responsive images for each of the PNG and JPG images in the images
 * directory
 *
 * @see {@link http://sharp.dimens.io/en/stable/install/|Sharp}
 * @see {@link https://github.com/jcupitt/libvips|LibVIPS dependency for Mac}
 * @see {@link https://www.npmjs.com/package/gulp-responsive|gulp-responsive}
 * @see {@link imagemin}
 *
 */
gulp.task('processImages', () =>{
  return gulp.src(['src/images/**/*.{jpg,png}', '!src/images/touch/*.png'])
  .pipe($.responsive({
    '*': [{
      // image-small.jpg is 200 pixels wide
      width: 200,
      rename: {
        suffix: '-small',
        extname: '.jpg'
      }
    }, {
      // image-small@2x.jpg is 400 pixels wide
      width: 200 * 2,
      rename: {
        suffix: '-small@2x',
        extname: '.jpg'
      }
    }, {
      // image-large.jpg is 480 pixels wide
      width: 480,
      rename: {
        suffix: '-large',
        extname: '.jpg'
      }
    }, {
      // image-large@2x.jpg is 960 pixels wide
      width: 480 * 2,
      rename: {
        suffix: '-large@2x',
        extname: '.jpg'
      }
    }, {
      // image-extralarge.jpg is 1280 pixels wide
      width: 1280,
      rename: {
        suffix: '-extralarge',
        extname: '.jpg'
      }
    }, {
      // image-extralarge@2x.jpg is 2560 pixels wide
      width: 1280 * 2,
      rename: {
        suffix: '-extralarge@2x',
        extname: '.jpg'
      }
    }, {
      // image-small.webp is 200 pixels wide
      width: 200,
      rename: {
        suffix: '-small',
        extname: '.webp'
      }
    }, {
      // image-small@2x.webp is 400 pixels wide
      width: 200 * 2,
      rename: {
        suffix: '-small@2x',
        extname: '.webp'
      }
    }, {
      // image-large.webp is 480 pixels wide
      width: 480,
      rename: {
        suffix: '-large',
        extname: '.webp'
      }
    }, {
      // image-large@2x.webp is 960 pixels wide
      width: 480 * 2,
      rename: {
        suffix: '-large@2x',
        extname: '.webp'
      }
    }, {
      // image-extralarge.webp is 1280 pixels wide
      width: 1280,
      rename: {
        suffix: '-extralarge',
        extname: '.webp'
      }
    }, {
      // image-extralarge@2x.webp is 2560 pixels wide
      width: 1280 * 2,
      rename: {
        suffix: '-extralarge@2x',
        extname: '.webp'
      }
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 80,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Skip enalrgement warnings
      skipOnEnlargement: false,
      // Strip all metadata
      withMetadata: true
    }]
  })
  .pipe(gulp.dest('dist/images')));
});

/**
 * @name clean
 * @description deletes specified files
 */
gulp.task('clean', () =>{
  return del.sync([
    'public/scripts/*.js',
    'public/images/**/*',
    'public/styles/**/*'
  ]);
});

// Copy Resrouces
gulp.task('copyResources', () => {
  gulp.src([
    'src/css/',
    'src/images/',
    'src/scripts/',
    'src/fonts/'
  ])
  .pipe(gulp.dest('public'))
});

// AXE CORE A11Y Tests
gulp.task('axe', done => {
  var options = {
    saveOutputIn: './a11yReport.json',
    browser: 'phantomjs',
    urls: ['build/**/*.html']
  };
  return axe(options, done);
});

// Node security to update modules
gulp.task('snyk-auth', done =>{
  return snyk({
    command: 'auth',
    options: {
  
      debug: true,
      dev: true
    }
  }, done)
});

gulp.task('protect', ['snyk-auth'], done => {
  return snyk({
    command: 'protect',
    options: {
      
      debug: true,
      dev: true
    }
  }, done)
  
});

gulp.task('test', ['snyk-auth'], done => {
  return snyk({
    command: 'test',
    
    options: {
      debug: true,
      dev: true
    }, done})
});
