'use strict';

const {join, sep} = require('path');
const {readFile} = require('fs/promises');

const {test, stub} = require('supertape');
const tryToCatch = require('try-to-catch');
const mockRequire = require('mock-require');
const pullout = require('pullout');

const read = require('.');

const {reRequire, stopAll} = mockRequire;
const rmDate = (a) => {
    delete a.date;
    return a;
}

test('redzip: vfs: read: read: no path', async (t) => {
    const [e] = await tryToCatch(read);
    
    t.equal(e.message, 'path should be string!', 'should throw when no path');
    t.end();
});

test('redzip: vfs: read: wrong type', async (t) => {
    const [e] = await tryToCatch(read, '/1.zip/', {
        type: 3,
    });
    
    t.equal(e.message, 'type should be a string or not to be defined!');
    t.end();
});

test('redzip: vfs: read: wrong sort', async (t) => {
    const [e] = await tryToCatch(read, '/1.zip/', {
        sort: 3,
    });
    
    t.equal(e.message, 'sort should be a string!');
    t.end();
});

test('redzip: vfs: read: wrong order', async (t) => {
    const [e] = await tryToCatch(read, '/1.zip/', {
        order: 'hello',
    });
    
    t.equal(e.message, 'order can be "asc" or "desc" only!');
    t.end();
});

test('redzip: vfs: read: open error', async (t) => {
    const path = '/hello/';
    const options = {};
    
    const read = reRequire('.');
    const [e] = await tryToCatch(read, path, options);
    
    stopAll();
    
    t.equal(e.message, `ENOENT: no such file or directory, scandir '/hello/'`);
    t.end();
});

test('redzip: vfs: read: file', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const read = reRequire('.');
    const path = `${zipPath}${sep}hello.txt`;
    const file = 'world\n';
    
    const stream = await read(path);
    const result = await pullout(stream, 'string');
    
    t.equal(result, file, 'should equal');
    t.end();
});

test('redzip: vfs: read: directory', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const read = reRequire('.');
    const path = `${zipPath}${sep}dir`;
    
    const {files} = await read(path, {
        type: 'raw',
    });
    
    delete files[0].date;
    const expected = [{
        name: 'hello.txt',
        size: 6,
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }];
    
    t.deepEqual(files, expected);
    t.end();
});

test('redzip: vfs: read: directory: nested', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'nested.zip');
    
    const read = reRequire('.');
    const path = `${zipPath}${sep}nested`;
    
    const {files} = await read(path, {
        type: 'raw',
    });
    
    const result = files.map(rmDate);
    
    const expected = [{
        name: 'dir',
        size: 0,
        owner: 'root',
        mode: 1_107_099_648,
        type: 'directory',
    }, {
        name: '.zip',
        size: 1142,
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }, {
        name: 'dir.zip',
        size: 232,
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }, {
        name: 'world.txt',
        size: 6,
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }];
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('redzip: vfs: read: directory: with slash', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const read = reRequire('.');
    const path = `${zipPath}${sep}dir/`;
    
    const {files} = await read(path);
    
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

test('redzip: vfs: read: file: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const read = reRequire('.');
    const path = `${zipPath}${sep}hello.txt`;
    
    const {type} = await read(path);
    
    t.equal(type, 'file', 'should equal');
    t.end();
});

test('redzip: vfs: read: directory: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const read = reRequire('.');
    const path = `${zipPath}${sep}dir`;
    
    const {type} = await read(path);
    
    t.equal(type, 'directory', 'should equal');
    t.end();
});

test('redzip: vfs: read: directory: local', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    
    const files = [];
    const readify = stub().returns({
        files,
    });
    
    mockRequire('readify', readify);
    reRequire('../../local/index.js');
    const read = reRequire('.');
    
    const stream = await read(dirPath);
    const result = stream.files.map(rmDate);
    
    const expected = [{
        mode: 'rw- rw- r--',
        name: 'dir.zip',
        owner: 'coderaiser',
        size: '232b',
        type: 'file',
    }, {
        mode: 'rw- rw- r--',
        name: 'file.zip',
        owner: 'coderaiser',
        size: '140b',
        type: 'file',
    },
    {
        mode: 'rw- rw- r--',
        name: 'nested.zip',
        owner: 'coderaiser',
        size: '1.46kb',
        type: 'file',
    }];
    
    stopAll();
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: vfs: read: file: local', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const read = reRequire('.');
    const stream = await read(zipPath);
    
    const file = await pullout(stream, 'buffer');
    const expected = await readFile(zipPath);
    
    t.deepEqual(file, expected);
    t.end();
});

test('redzip: vfs: read: file: local: real path error', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const realpath = stub().throws(Error('hello'));
    
    const fs = require('fs/promises');
    mockRequire('fs/promises', {
        ...fs,
        realpath,
    });
    reRequire('../../local/index');
    reRequire('../../redfs');
    
    const read = reRequire('.');
    const stream = await read(zipPath);
    
    const file = await pullout(stream, 'buffer');
    const expected = await readFile(zipPath);
    stopAll();
    
    t.deepEqual(file, expected);
    t.end();
});

test('redzip: vfs: read: directory: root', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const read = reRequire('.');
    const {path} = await read(`${zipPath}${sep}`, {
        root: dirPath,
    });
    
    const expected = '/dir.zip/';
    
    t.deepEqual(path, expected);
    t.end();
});

test('redzip: vfs: read: directory: root', async (t) => {
    const read = reRequire('.');
    const {path} = await read('/', {
        root: '/',
    });
    
    const expected = '/';
    
    t.deepEqual(path, expected);
    t.end();
});

test('redzip: vfs: read: directory: long path', async (t) => {
    const read = reRequire('.');
    const {path} = await read('/bin', {
        root: '/',
    });
    
    const expected = '/bin/';
    
    t.deepEqual(path, expected);
    t.end();
});

test('redzip: vfs: read: file', async (t) => {
    const read = reRequire('.');
    const {type} = await read(__filename, {
        root: '/',
    });
    
    t.equal(type, 'file');
    t.end();
});

