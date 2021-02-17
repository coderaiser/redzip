'use strict';

const read = require('./vfs/read');
const readSize = require('./vfs/read-size');
const readStat = require('./vfs/read-stat');
const list = require('./vfs/list');
const write = require('./vfs/write');
const remove = require('./vfs/remove');

module.exports.read = read;
module.exports.readSize = readSize;
module.exports.readStat = readStat;
module.exports.list = list;
module.exports.write = write;
module.exports.remove = remove;
