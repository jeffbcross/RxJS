/// <reference path="typings/gulp/gulp.d.ts"/>

var tsc = require('gulp-typescript');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var babel = require('gulp-babel');

var OUTPUT_ROOT_DIR = 'dist';

gulp.task('clean/es6', function(done) {
	del(OUTPUT_ROOT_DIR+'/es6', done);
});

gulp.task('clean/cjs', function(done) {
	del(OUTPUT_ROOT_DIR+'/es5', done);
});

gulp.task('build/es6', ['clean/es6'], function(done) {
	return compileTarget('es6');
});

gulp.task('build/cjs', ['clean/cjs'], function(done) {
	var stream = getTsStream('es6');
	var jsStream = stream.js.pipe(babel());
	return writeOutputs(jsStream, stream.dts, OUTPUT_ROOT_DIR + '/cjs');
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
			outputDir = 'dist/es6'
	}
	return outputDir;
}

function getTsStream(outputTarget, moduleType) {
	var compilerOptions = {
		target: outputTarget,
		declarationFiles: true,
		typescript: require('typescript')
	};
	if (moduleType) {
		compilerOptions.module = moduleType;
	}
	return gulp.src('src/**/*.ts').
		pipe(tsc(compilerOptions));
}

function writeOutputs (jsStream, dtsStream, outputDir) {
	return merge(
		jsStream.pipe(gulp.dest(outputDir)),
		dtsStream.pipe(gulp.dest(outputDir)));
}

function compileTarget(outputTarget, moduleType) {
	var outputDir = getOutputDir(moduleType);
	var dualStream = getTsStream(outputTarget, moduleType);
	return writeOutputs(dualStream.js, dualStream.dts, outputDir);
}