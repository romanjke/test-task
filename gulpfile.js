"use strict";

var gulp = require('gulp'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	prefix = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	browserSync = require('browser-sync').create();

var useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	cssmin = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	rimraf = require('rimraf'),
	notify = require('gulp-notify'),
	rename = require('gulp-rename'),
	spritesmith = require('gulp.spritesmith');

var paths = {
	blocks: 'src/blocks/',
	fonts: 'src/fonts/**/*.*',
	img: 'src/img/**/*.*',
	icons: 'src/icons/**/*.*',
	vendor: 'src/vendor/',
	outputDir: 'dist/'
};

//pug compile
gulp.task('pug', function() {
	return gulp.src([paths.blocks + '*.pug', '!' + paths.blocks + 'template.pug' ])
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(paths.outputDir))
		.pipe(browserSync.stream())
});

//sass compile
gulp.task('sass', function() {
	return gulp.src(paths.blocks + '*.scss')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix({
			browsers: ['last 10 versions'],
			cascade: true
		}))
		.pipe(gulp.dest(paths.outputDir + 'css/'))
		.pipe(browserSync.stream());
});

//js compile
gulp.task('scripts', function() {
	return gulp.src(paths.blocks + '**/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.outputDir + 'js/'))
		.pipe(browserSync.stream());
});

//copy vedor css to outputDir
gulp.task('vendor:css', function() {
	return gulp.src(paths.vendor + 'css/*.css')
		.pipe(gulp.dest(paths.outputDir + 'css/'));
});

//copy vedor js to outputDir
gulp.task('vendor:js', function() {
	return gulp.src(paths.vendor + 'js/*.js')
		.pipe(gulp.dest(paths.outputDir + 'js/'));
});

gulp.task('sprite', function(cb) {
	var spriteData = gulp.src('src/icons/*.png')
		.pipe(spritesmith({
			imgName: 'sprite.png',
			imgPath: '../img/sprite.png',
			cssName: 'sprite.scss'
		}));

	spriteData.img.pipe(gulp.dest('dist/img/'));
	spriteData.css.pipe(gulp.dest('src/blocks/_base/'));
  	cb();
});

//watch
gulp.task('watch', function() {
	gulp.watch(paths.blocks + '**/*.pug', gulp.series('pug'));
	gulp.watch(paths.blocks + '**/*.scss', gulp.series('sass'));
	gulp.watch(paths.blocks + '**/*.js', gulp.series('scripts'));
	gulp.watch(paths.img, gulp.series('imgBuild'));
	gulp.watch(paths.fonts, gulp.series('fontsBuild'));
	gulp.watch(paths.vendor + 'css/*.css', gulp.series('vendor:css'));
	gulp.watch(paths.vendor + 'js/*.js', gulp.series('vendor:js'));
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.outputDir
		}
	});
});


//clean
gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});

//css + js
gulp.task('useref', function() {
	return gulp.src(paths.outputDir + '*.html')
		.pipe( useref() )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
	}
);

//copy images to outputDir
gulp.task('imgBuild', function() {
	return gulp.src(paths.img)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.outputDir + 'img/'));
	}
);

//copy fonts to outputDir
gulp.task('fontsBuild', function() {
	return gulp.src(paths.fonts)
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
	}
);


//default
gulp.task('default', gulp.series(
		gulp.parallel('pug', 'sass', 'scripts', 'imgBuild', 'fontsBuild', 'vendor:css', 'vendor:js'),
		gulp.parallel('browser-sync', 'watch')
	)
);

//production
gulp.task('prod', gulp.series(
		'clean',
		gulp.parallel('pug', 'sass', 'scripts', 'imgBuild', 'fontsBuild', 'vendor:css', 'vendor:js'),
		'useref'
	)
);