/// <reference path="typings/tsd.d.ts"/>

var tsc = require('gulp-typescript');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('typescript');
var RxNode = require('rx-node');
var insert = require('gulp-insert');

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
gulp.task('clean/amd', done => del(OUTPUT_ROOT_DIR + '/amd', done));

gulp.task('build/es6',
	['clean/es6'],
	doneOnCompleted(optionsObservable
		.map(opts => opts.merge({
			target: 'es6',
			module: 'es6'
		}))
		.map(getTsStream)
		.flatMap(writeToDir(`${OUTPUT_ROOT_DIR}/es6`))));

gulp.task('build/cjs',
	['clean/cjs'],
	doneOnCompleted(optionsObservable
		.map(opts => opts.merge({target: 'es5', module: 'commonjs'}))
		.map(getTsStream)
		.map((dualStream) => {
			dualStream.js = dualStream.js.pipe(insert.prepend(
`'use strict';

exports.__esModule = true;
`)).pipe(insert.append(
`
module.exports = exports.default;
`));
			return dualStream;
		})
		.flatMap(writeToDir(`${OUTPUT_ROOT_DIR}/cjs`))));

gulp.task('build/global',
	['clean/global'],
	doneOnCompleted(optionsObservable
		.map(opts => opts.merge({target: 'es5', module: 'umd'}))
		.map(getTsStream)
		.flatMap(writeToDir(`${OUTPUT_ROOT_DIR}/global`))));

gulp.task('build/amd',
	['clean/amd'],
	doneOnCompleted(optionsObservable
		.map(opts => opts.merge({target: 'es5', module: 'amd'}))
		.map(getTsStream)
		.flatMap(writeToDir(`${OUTPUT_ROOT_DIR}/amd`))));

function doneOnCompleted (observable) {
	return done => observable.subscribe(Rx.Observer.create(null,null,done));
}

function writeToDir (outputDir) {
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
