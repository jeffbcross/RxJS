/// <reference path="typings/tsd.d.ts"/>
var tsc = require('gulp-typescript');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('typescript');
var RxNode = require('rx-node');

import Rx = require('rx');
import Immutable = require('immutable');

const OUTPUT_ROOT_DIR = 'dist';

const optionsObservable = Rx.Observable.just(Immutable.Map({
	declarationFiles: true,
	typescript: typescript
}));

gulp.task('clean/es6', done => del(OUTPUT_ROOT_DIR + '/es6', done));
gulp.task('clean/cjs', done => del(OUTPUT_ROOT_DIR + '/cjs', done));
gulp.task('clean/global', done => del(OUTPUT_ROOT_DIR + '/global', done));

gulp.task('build/es6',
	['clean/es6'],
	doneOnCompleted(optionsObservable
		.map(opts => opts.merge({
			target: 'es6',
			module: 'es6'
		}))
		.map(getTsStream)
		.flatMap(writeTo(OUTPUT_ROOT_DIR + '/es6'))));

// gulp.task('build/cjs', ['clean/cjs'], function() {
// 	var stream = getTsStream('es6');
// 	var jsStream = stream.js.pipe(babel({modules: 'common'}));
// 	return writeOutputs(jsStream, stream.dts, getOutputDir('commonjs'));
// });

// gulp.task('build/global', ['clean/global'], function() {
// 	var stream = getTsStream('es6');
// 	var jsStream = stream.js.pipe(babel({modules: 'umd'}));
// 	return writeOutputs(jsStream, stream.dts, getOutputDir('umd'));
// });

// function getOutputDir(moduleType) {
// 	var outputDir;
// 	switch (moduleType) {
// 		case 'commonjs':
// 			outputDir = OUTPUT_ROOT_DIR + '/cjs';
// 			break;
// 		case 'amd':
// 			outputDir = OUTPUT_ROOT_DIR + '/amd';
// 			break;
// 		case 'umd':
// 			outputDir = OUTPUT_ROOT_DIR + '/global';
// 			break;
// 		default:
// 			outputDir = OUTPUT_ROOT_DIR + '/es6'
// 	}
// 	return outputDir;
// }

function doneOnCompleted (observable) {
	return function (done) {
		observable.subscribe(Rx.Observer.create(null,null,done));
	}
}

function writeTo (outputDir) {
	return function (stream) {
		return writeOutputs({
			outputDir: outputDir,
			js: stream.js,
			dts: stream.dts
		});
	};
}

function getTsStream(compilerOptions:Immutable.Map<string, any>) {
	return gulp.src('src/**/*.ts').
		pipe(sourcemaps.init()).
		pipe(tsc(compilerOptions.toObject()));
}

function writeOutputs ({js, dts, outputDir}:{
	js:NodeJS.ReadableStream,
	dts: NodeJS.ReadableStream,
	outputDir: string}):Rx.Observable<NodeJS.ReadableStream> {
	return RxNode.fromStream(merge(
		js.pipe(gulp.dest(outputDir)),
		dts.pipe(gulp.dest(outputDir))));
}