'use strict';

const {join, sep} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');

const readzip = require('..');

const {reRequire, stopAll} = mockRequire;
const pullout = require('pullout');

const stringify = (json) => JSON.stringify(json, null, 4);

test('readzipzip: no path', async (t) => {
    const [e] = await readzip();
    
    t.equal(e.message, 'path should be string!', 'should throw when no path');
    t.end();
});

test('readzipzip: readzip: open error', async (t) => {
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

test('readzipzip: readzip: file', async (t) => {
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

test('readzipzip: readzip: directory', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}dir`;
    
    const [, stream] = await readzip(path);
    
    const result = await pullout(stream, 'string');
    const expected = stringify([{
        name: 'hello.txt',
        size: 6,
        date: 21_029,
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }]);
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('readzipzip: readzip: directory: nested', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'nested.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}nested`;
    
    const [, stream] = await readzip(path);
    
    const result = await pullout(stream, 'string');
    const expected = stringify(
        [
            {
                name: '.zip',
                size: 1142,
                date: 21_029,
                owner: 'root',
                mode: 2_176_057_344,
                type: 'file',
            },
            {
                name: 'dir.zip',
                size: 232,
                date: 21_029,
                owner: 'root',
                mode: 2_176_057_344,
                type: 'file',
            },
            {
                name: 'world.txt',
                size: 6,
                date: 21_029,
                owner: 'root',
                mode: 2_176_057_344,
                type: 'file',
            },
            {
                name: 'dir',
                size: 0,
                date: 21_029,
                owner: 'root',
                mode: 1_107_099_648,
                type: 'directory',
            },
        ],
    );
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('readzipzip: readzip: directory: with slash', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}dir/`;
    
    const [, stream] = await readzip(path);
    
    const result = await pullout(stream, 'string');
    const expected = stringify([{
        name: 'hello.txt',
        size: 6,
        date: 21_029,
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }]);
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('readzipzip: readzip: file: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'file.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}hello.txt`;
    
    const [, stream] = await readzip(path);
    const {type} = stream;
    
    t.equal(type, 'file', 'should equal');
    t.end();
});

test('readzipzip: readzip: directory: type', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    const readzip = reRequire('..');
    const path = `${zipPath}:${sep}dir`;
    
    const [, stream] = await readzip(path);
    const {type} = stream;
    
    t.equal(type, 'directory', 'should equal');
    t.end();
});

