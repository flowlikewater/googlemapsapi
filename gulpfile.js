var gulp = require('gulp');
// command: $ npm install gulp --save-dev
// global command: $ npm install gulp -g
// Gulp is in charge of optimizing our code and packaging it up in a format that the browser can understand.
// Gulp contains a bunch of packages that will help package the code
var browserify = require('browserify');
// command: $ npm install browserify --save-dev
// browserify package is responsible for translating code into JavaScript our browser does understand.
var source = require('vinyl-source-stream');
//$ command: npm install vinyl-source-stream --save-dev
//An npm package used for placing browserified source code into a new file.
var concat = require('gulp-concat');
//command: $ npm install gulp-concat --save-dev
//copying all JavaScript files into one file to be used in the browser, decrease load time
var uglify = require('gulp-uglify');
//command: $ npm install gulp-uglify --save-dev
//removing all unnecessary characters in JS files to optimize JavaScript execution.
var utilities = require('gulp-util');
// command: $ npm install gulp-util --save-dev
// manages multiple utilities, including environmental variables.
// *** not quite sure still what this does ***
var buildProduction = utilities.env.production;
// we now can decide what environment to enter by logging into your command the following
// $ gulp build --production   <--- this choses a production environment
// $ gulp build  <--- this chooses a development envirionment
var del = require('del');
// command: $ npm install del --save-dev
// allows you to delete files
var jshint = require('gulp-jshint')
// command: $ npm install jshint --save-dev
// command: $ npm install gulp-jshint --save-dev
// jshint is a LINTER tool - a LINTER tool analyzes your code and warns you about bugs
//var lib = require('bower-files')();
// after install the bower components --> bootstrap jquery and moment
// command: $ npm install bower-files --save-dev
var lib = require('bower-files')({
  "overrides":{
    "bootstrap" : {
      "main": [
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
});
// tell the bower-files package where to find the Bootstrap files that we are interested in.
var browserSync = require('browser-sync').create();
// command:  implement our development server with live reloading
var sass = require('gulp-sass');
// command: $ npm install gulp-sass gulp-sourcemaps --save-dev
var sourcemaps = require('gulp-sourcemaps');
// the sourcemaps package adds some code which allows us to see which Sass files are responsible for each CSS rule that we see in the browser



gulp.task('myTask',function(){
  console.log('hope this will help you all digest materials from day1 day2 better ~ kevin')
})

gulp.task('concatInterface', function() {
  return gulp.src(['./js/*-interface.js'])
  //*-interface.js --> Globbing pattern: looks for all the files that end with 'interface.js'
    .pipe(concat('allConcat.js'))
    .pipe(gulp.dest('./tmp'));
    //tmp, stands for temporary, coz allConcat.js will not be used in the browser, needs to be browserified
});

gulp.task('jsBrowserify', ['concatInterface'], function() {
// whatever's inside the [squared bracket] is a depency
  return browserify({ entries: ['./tmp/allConcat.js'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
    // separate the production version of a project inside a build directory.
    // There are 2 Environment Variables - Production & Development
    // js folder is for development files
});

gulp.task("minifyScripts", ["jsBrowserify"], function(){
  return gulp.src("./build/js/app.js")
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"));
});

gulp.task("clean", function(){
  return del(['build', 'tmp']);
  // deletes all the files on Build and Tmp
});

gulp.task("build", function(){
  // runs clean first because there are old minified files in build or old
  if (buildProduction) {
    gulp.start('minifyScripts');
    // this choses a production environment ->  saves things in a BUILD folder
    // start basically means run the task 'minifyScripts'
  } else {
    gulp.start('jsBrowserify');
    // this chooses a development envirionment -> saves things in the JS folder - which is for development files
  }
  gulp.start('bower');
});

gulp.task('jshint', function(){
  return gulp.src(['js/*.js'])
  // looks for all the *js files in the js folder
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('bowerJS', function () {
  // immediately run by placing an empty set of parenthesis ()
  // run gulp bowerJS every time we add a new JavaScript front-end dependency -- e.g. moment / bootstrap
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.min.js'))
    // Add the following into the index.html file, which replaces the all the links to bootstrap, moment, jquery, etc
    //<script src="build/js/vendor.min.js"></script>
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('bowerCSS', function () {
  return gulp.src(lib.ext('css').files)
  // same thing as bowerJS but for bowerCSS
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('bower', ['bowerJS', 'bowerCSS']);

gulp.task('serve', function() {
  browserSync.init({
    //launch or initialize the local server from the directory that we are currently in (baseDir: "./",)
    server: {
      baseDir: "./",
      //run gulp serve from the top level of our project directory to launch our server and run the app
      index: "index.html"
    }
  });
  gulp.watch(['js/*.js'], ['jsBuild']);
  //watch all of the files inside of our development js folder and whenever one of the files changes, run the task jsBuild
  gulp.watch(['bower.json'], ['bowerBuild']);
  gulp.watch(['*.html'], ['htmlBuild']);
  gulp.watch(["scss/*.scss"], ['cssBuild']);
});

gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function(){
  //  The linter can be run at the same time as we concatenate and browserify our js files
  browserSync.reload();
});

gulp.task('bowerBuild', ['bower'], function(){
  browserSync.reload();
});

gulp.task('htmlBuild', function() {
  browserSync.reload();
});

gulp.task('cssBuild', function() {
  return gulp.src(['scss/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});
