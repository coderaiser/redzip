'use strict';

const {join, sep} = require('path');
const {readFile} = require('fs/promises');

const {test, stub} = require('supertape');
const tryToCatch = require('try-to-catch');
const mockRequire = require('mock-require');
const pullout = require('pullout');

const redzip = require('..');

const {reRequire, stopAll} = mockRequire;

test('redzip: no path', async (t) => {
    const [e] = await tryToCatch(redzip.read);
    
    t.equal(e.message, 'path should be string!', 'should throw when no path');
    t.end();
});

test('redzip: wrong type', async (t) => {
    const [e] = await tryToCatch(redzip.read, '/1.zip/', {
        type: 3,
    });
    
    t.equal(e.message, 'type should be a string or not to be defined!');
    t.end();
});

test('redzip: wrong sort', async (t) => {
    const [e] = await tryToCatch(redzip.read, '/1.zip/', {
        sort: 3,
    });
    
    t.equal(e.message, 'sort should be a string!');
    t.end();
});

test('redzip: wrong order', async (t) => {
    const [e] = await tryToCatch(redzip.read, '/1.zip/', {
        order: 'hello',
    });
    
    t.equal(e.message, 'order can be "asc" or "desc" only!');
    t.end();
});

test('redzip: open error', async (t) => {
    const path = '/hello/';
    const options = {};
    
    reRequire('../lib/readzip');
    const redzip = reRequire('..');
    const [e] = await tryToCatch(redzip.read, path, options);
    
    stopAll();
    
    t.equal(e.message, `ENOENT: no such file or directory, scandir '/hello/'`);
    t.end();
});

test('redzip: file', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const redzip = reRequire('..');
    const path = `${zipPath}${sep}hello.txt`;
    const file = 'world\n';
    
    const stream = await redzip.read(path);
    const result = await pullout(stream, 'string');
    
    t.equal(result, file, 'should equal');
    t.end();
});

test('redzip: directory', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const redzip = reRequire('..');
    const path = `${zipPath}${sep}dir`;
    
    const {files} = await redzip.read(path, {
        type: 'raw',
    });
    const expected = [{
        name: 'hello.txt',
        size: 6,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }];
    
    t.deepEqual(files, expected);
    t.end();
});

test('redzip: directory: nested', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'nested.zip');
    
    const redzip = reRequire('..');
    const path = `${zipPath}${sep}nested`;
    
    const {files} = await redzip.read(path, {
        type: 'raw',
    });
    
    const expected = [{
        name: 'dir',
        size: 0,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 1_107_099_648,
        type: 'directory',
    }, {
        name: '.zip',
        size: 1142,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }, {
        name: 'dir.zip',
        size: 232,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }, {
        name: 'world.txt',
        size: 6,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }];
    
    t.deepEqual(files, expected, 'should equal');
    t.end();
});

test('redzip: directory: with slash', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const redzip = reRequire('..');
    const path = `${zipPath}${sep}dir/`;
    
    const {files} = await redzip.read(path);
    
    const expected = [{
        name: 'hello.txt',
        size: '6b',
        date: '05.01.2021',
        owner: 'root',
        mode: '--- --- ---',
        type: 'file',
    }];
    
    t.deepEqual(files, expected, 'should equal');
    t.end();
});

test('redzip: file: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const redzip = reRequire('..');
    const path = `${zipPath}${sep}hello.txt`;
    
    const {type} = await redzip.read(path);
    
    t.equal(type, 'file', 'should equal');
    t.end();
});

test('redzip: directory: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const redzip = reRequire('..');
    const path = `${zipPath}${sep}dir`;
    
    const {type} = await redzip.read(path);
    
    t.equal(type, 'directory', 'should equal');
    t.end();
});

test('redzip: directory: local', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    
    const files = [];
    const readify = stub().returns({
        files,
    });
    
    mockRequire('readify', readify);
    const redzip = reRequire('..');
    const stream = await redzip.read(dirPath);
    
    stopAll();
    
    t.equal(stream.files, files);
    t.end();
});

test('redzip: file: local', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const redzip = reRequire('..');
    const stream = await redzip.read(zipPath);
    
    const file = await pullout(stream, 'buffer');
    const expected = await readFile(zipPath);
    
    t.deepEqual(file, expected);
    t.end();
});

test('redzip: file: local: real path error', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const realpath = stub().throws(Error('hello'));
    
    const fs = require('fs/promises');
    mockRequire('fs/promises', {
        ...fs,
        realpath,
    });
    
    const redzip = reRequire('..');
    const stream = await redzip.read(zipPath);
    
    const file = await pullout(stream, 'buffer');
    const expected = await readFile(zipPath);
    stopAll();
    
    t.deepEqual(file, expected);
    t.end();
});
