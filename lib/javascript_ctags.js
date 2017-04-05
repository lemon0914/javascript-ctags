"use strict";

var glob = require('glob');
var nopt = require('nopt');
var fs = require('fs');
var _ = require('underscore');
var Parser = require('./parser');
var generate = require('./generate');

function parseAndGenerate(pattern, tagfile) {
  var fileDefs = parse(files1(pattern));
  var tags = generate(fileDefs);
  writeFile(tagfile, tags);
}

function files(pattern) {
  return glob.sync(pattern);
}

function isDir(path) {
  var stat = fs.statSync(path);
  return stat.isDirectory();
}

function files1(path) {
  if (!isDir(path)) {
    return []; 
  }
  var result = [];
  var files = fs.readdirSync(path);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file == '.' || file == '..') {
      continue; 
    }
    var filepath = path + "/" + file;
    var extname = require('path').extname(filepath);
    if (extname == '.js') {
      result.push(filepath); 
    }
    var a = files1(filepath);
    result = result.concat(a);
  }
  return result;
}

function parse(files) {
  var parser = new Parser();
  return _.map(files, function(file) {
    var contents = fs.readFileSync(file, 'utf-8');
    try {
      var entries = parser.parse(contents);
      console.log('parse ' + file + ' OK');
    } catch (e) {
      console.log('parse ' + file + ' FAIL');
    }
    return {filename: file, entries: entries};
  });
}

function writeFile(filename, tags) {
  fs.writeFileSync(filename, tags.join('\n'));
}

module.exports = parseAndGenerate;
module.exports.files = files;
