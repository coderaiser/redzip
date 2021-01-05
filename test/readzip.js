'use strict';

const {join, sep} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');

const readzip = require('..');

const {reRequire, stopAll} = mockRequire;
const pullout = require('pullout');

const stringify = (json) => JSON.stringify(json, null, 4);

test('readzip: no path', async (t) => {
    const [e] = await readzip();
    
    t.equal(e.message, 'path should be string!', 'should throw when no path');
    t.end();
});

test('readzip: path without ":"', async (t) => {
    const [e] = await readzip('/');
    
    t.equal(e.message, 'path should conaint ":" separatar beetween paths');
    t.end();
});

test('readzip: wrong type', async (t) => {
    const [e] = await readzip('/1.zip:/', {
        type: 3
    });
    
    t.equal(e.message, 'type should be a string or not to be defined!');
    t.end();
});

test('readzip: wrong sort', async (t) => {
    const [e] = await readzip('/1.zip:/', {
        sort: 3
    });
    
    t.equal(e.message, 'sort should be a string!');
    t.end();
});


test('readzip: wrong order', async (t) => {
    const [e] = await readzip('/1.zip:/', {
        order: 'hello'
    });
    
    t.equal(e.message, 'order can be "asc" or "desc" only!');
    t.end();
});

test('readzip: open error', async (t) => {
    const path = '/:/';
    const error = Error('hello');
    const options = {};
    
    const open = (path, options, fn) => {
        fn(error);
    };
    
    mockRequire('yauzl', {
        open,
    });
    
    const readzip = reRequire('..');
    const [e] = await readzip(path, options);
    
    stopAll();
    
    t.equal(e, error, 'should return error');
    t.end();
});

test('readzip: file', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}hello.txt`;
    const file = 'world\n';
    
    const [, stream] = await readzip(path);
    const result = await pullout(stream, 'string');
    
    t.equal(result, file, 'should equal');
    t.end();
});

test('readzip: directory', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}dir`;
    
    const [, stream] = await readzip(path, {
        type: 'raw',
    });
    
    const result = await pullout(stream, 'string');
    const expected = stringify([{
        name: 'hello.txt',
        size: 6,
        date: '2021-01-04T22:00:00.000Z',
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }]);
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('readzip: directory: nested', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'nested.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}nested`;
    
    const [, stream] = await readzip(path, {
        type: 'raw',
    });
    
    const result = await pullout(stream, 'string');
    const expected = stringify(
        [
            {
                name: 'dir',
                size: 0,
                date: '2021-01-04T22:00:00.000Z',
                owner: 'root',
                mode: 1_107_099_648,
                type: 'directory',
            },
            {
                name: '.zip',
                size: 1142,
                date: '2021-01-04T22:00:00.000Z',
                owner: 'root',
                mode: 2_176_057_344,
                type: 'file',
            },
            {
                name: 'dir.zip',
                size: 232,
                date: '2021-01-04T22:00:00.000Z',
                owner: 'root',
                mode: 2_176_057_344,
                type: 'file',
            },
            {
                name: 'world.txt',
                size: 6,
                date: '2021-01-04T22:00:00.000Z',
                owner: 'root',
                mode: 2_176_057_344,
                type: 'file',
            },
        ],
    );
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('readzip: directory: with slash', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}dir/`;
    
    const [, stream] = await readzip(path);
    
    const result = await pullout(stream, 'string');
    const expected = stringify([{
        name: 'hello.txt',
        size: '6b',
        date: '05.01.2021',
        owner: 'root',
        mode: '--- --- ---',
        type: 'file',
    }]);
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('readzip: file: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}hello.txt`;
    
    const [, stream] = await readzip(path);
    const {type} = stream;
    
    t.equal(type, 'file', 'should equal');
    t.end();
});

test('readzip: directory: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}dir`;
    
    const [, stream] = await readzip(path);
    const {type} = stream;
    
    t.equal(type, 'directory', 'should equal');
    t.end();
});

