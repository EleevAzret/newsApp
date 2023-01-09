const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const gcmq = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const path = require('path');
const browserSync = require('browser-sync').create();

function clean() {
	return del('./docs/*');
}

function html() {
	return gulp.src('./src/**/*.html')
					.pipe(gulp.dest('./docs'));
}

function styles() {
	return gulp.src('./src/styles/main.scss')
					.pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
					.pipe(autoprefixer())
					.pipe(gcmq())
					.pipe(gulp.dest('./docs/styles'))
					.pipe(browserSync.stream());
}

function defaultStyles() {
	return gulp.src('./src/styles/defaults/**/*')
					.pipe(gulp.dest('./docs/styles/default'));
}


function js() {
	return gulp.src('./src/scripts/**/*.js')
					.pipe(gulp.dest('./docs/scripts'));
}

function img() {
	return gulp.src('./src/img/**/*')
					.pipe(gulp.dest('./docs/img'));
}

function watch() {
	browserSync.init({
		server: {
				baseDir: "./docs/"
		}
	});

	gulp.watch('./src/**/*.html', html);
	gulp.watch('./src/scripts/**/*.js', js);
	gulp.watch('./src/styles/**/*.scss', styles);
	gulp.watch('./src/styles/default/**/*', defaultStyles);
	gulp.watch('./src/img/**/*', img);
}

let build = gulp.series(clean, gulp.parallel(html, styles, js, img, defaultStyles), watch);

gulp.task('build', build);