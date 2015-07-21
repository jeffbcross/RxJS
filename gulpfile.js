/// <reference path="typings/gulp/gulp.d.ts"/>

var tsc = require('gulp-typescript');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('typescript');
var Rx = require('rx');
var RxNode = require('rx-node');

var OUTPUT_ROOT_DIR = 'dist';
var optionsObservable = Rx.Observable.just({
	declarationFiles: true,
	typescript: typescript
});

gulp.task('clean/es6', function(done) {
	del(OUTPUT_ROOT_DIR + '/es6', done);
});

gulp.task('clean/cjs', function(done) {
	del(OUTPUT_ROOT_DIR + '/cjs', done);
});

gulp.task('clean/global', function(done) {
	del(OUTPUT_ROOT_DIR + '/global', done);
});

gulp.task('build/es6', ['clean/es6'], function(done) {
	var observer = new Rx.Observer.create(null, null, done);

	optionsObservable.map(function(opts) {
		opts.target = 'es6';
		opts.module = 'es6';
		return opts;
	})
	.map(getTsStream)
	.flatMap(function(stream) {
		return writeOutputs({
			js: stream.js,
			dts: stream.dts,
			outputDir: OUTPUT_ROOT_DIR + '/es6'
		});
	}).subscribe(observer);
});

gulp.task('build/cjs', ['clean/cjs'], function() {
	var stream = getTsStream('es6');
	var jsStream = stream.js.pipe(babel({modules: 'common'}));
	return writeOutputs(jsStream, stream.dts, getOutputDir('commonjs'));
});

gulp.task('build/global', ['clean/global'], function() {
	var stream = getTsStream('es6');
	var jsStream = stream.js.pipe(babel({modules: 'umd'}));
	return writeOutputs(jsStream, stream.dts, getOutputDir('umd'));
});

function getOutputDir(moduleType) {
	var outputDir;
	switch (moduleType) {
		case 'commonjs':
			outputDir = OUTPUT_ROOT_DIR + '/cjs';
			break;
		case 'amd':
			outputDir = OUTPUT_ROOT_DIR + '/amd';
			break;
		case 'umd':
			outputDir = OUTPUT_ROOT_DIR + '/global';
			break;
		default:
			outputDir = OUTPUT_ROOT_DIR + '/es6'
	}
	return outputDir;
}

function getTsStream(compilerOptions) {
	return gulp.src('src/**/*.ts').
		pipe(sourcemaps.init()).
		pipe(tsc(compilerOptions));
}

function writeOutputs (data) {
	return RxNode.fromStream(merge(
		data.js.pipe(gulp.dest(data.outputDir)),
		data.dts.pipe(gulp.dest(data.outputDir))));
}
