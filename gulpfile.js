'use strict'

var gulp = require( 'gulp' )
const path = require( 'path' )

/* watchify workflow */
var webpack = require( 'webpack' )
var browserify = require ( 'browserify' )
var babelify = require( 'babelify' )
var watchify = require( 'watchify' )

var source = require( 'vinyl-source-stream' )
var buffer = require( 'vinyl-buffer' )
var merge = require( 'utils-merge' )

var uglify = require( 'gulp-uglify' )
var rename = require( 'gulp-rename' )
var sourcemaps = require( 'gulp-sourcemaps' )

/* sass workflow */
var sass = require( 'gulp-sass' )

/* nicer browserify errors */
var gutil = require( 'gulp-util' )
var chalk = require( 'chalk' )
const isProduction = gutil.env.production;

function map_error(err) {
  if (err.fileName) {
	// regular error
	gutil.log(chalk.red(err.name)
		+ ': '
		+ chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
		+ ': '
		+ 'Line '
		+ chalk.magenta(err.lineNumber)
		+ ' & '
		+ 'Column '
		+ chalk.magenta(err.columnNumber || err.column)
		+ ': '
		+ chalk.blue(err.description))
  } else {
	// browserify error..
	gutil.log(chalk.red(err.name)
		+ ': '
		+ chalk.yellow(err.message)
		+ '- '
		+ chalk.yellow(err))
  }

 this.emit('end')
}

function build (watch, callback) {
    var plugins = [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
        })
    ];

    if (isProduction) {
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    webpack({
        plugins: plugins,
        cache: true,
        watch: watch,
        resolve: {
		    extensions: [ '', '.js', '.jsx', '.scss', '.json', '.node' ]
		},
        module: {
            loaders: [
                { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
                {
			        test: /\.css$/, // Only .css files
			        loader: 'style!css' // Run both loaders
			    },
                { test: /\.css$/, loader: 'style-loader!css-loader'}
            ]
        },
        devtool: "#source-map",
        entry: path.resolve(__dirname, 'admin/js/App/main.js'),
        output: {
            filename: 'collective.js',
            path: path.resolve(__dirname, 'admin/js/App/')
        }
    }, function (err, stats) {
        if (callback) callback();
    });
}

gulp.task('watchify', function () {
  var args = merge(watchify.args, { debug: true })
  var bundler = watchify(browserify('admin/js/App/main.js', args)).transform(babelify, { /* opts */ })
  bundle_js(bundler)

  bundler.on('update', function () {
	bundle_js(bundler)
  })
})

function bundle_js(bundler) {
  return bundler.bundle()
	.on('error', map_error)
	.pipe(source('collective.js'))
	.pipe(buffer())
	.pipe(gulp.dest('admin/js/App'))
	.pipe(rename('collective.js'))
	.pipe(sourcemaps.init({ loadMaps: true }))
		// capture sourcemaps from transforms
		// .pipe(uglify())
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('admin/js/App'))
}

gulp.task('sass', function() {
	return gulp
		.src('admin/assets/sass/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('admin/assets/css'))
})

// Without watchify
gulp.task('browserify', function () {
  var bundler = browserify('admin/js/App/main.js', { debug: true })
  				.transform(babelify, {/* options */ })
  				.transform('browserify-css', {global: true})

  return bundle_js(bundler)
})

gulp.task('watch', function () {
    build(true);
});

gulp.task('js', function (callback) {
    build(false, callback);
});

// Without sourcemaps
gulp.task('browserify-production', function () {
  var bundler = browserify('./src/js/app.js').transform(babelify, {/* options */ })

  return bundler.bundle()
	.on('error', map_error)
	.pipe(source('main.js'))
	.pipe(buffer())
	.pipe(rename('collective.js'))
	.pipe(uglify())
	.pipe(gulp.dest('admin/js/App'))
})

gulp.task('build', ['js']);
gulp.task( 'default', [ 'browserify' ] );
gulp.task('dev', ['build', 'watch']);