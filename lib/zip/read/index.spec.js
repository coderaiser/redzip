'use strict';

const {join, win32} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');
const read = require('.');

const {stopAll, reRequire} = mockRequire;

test('redzip: zip: read: windows', async (t) => {
    mockRequire('path', win32);
    
    const read = reRequire('.');
    
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/';
    const files = await read(outerPath, innerPath);
    
    stopAll();
    
    const expected = [{
        date: '05.01.2021',
        mode: '--- --- ---',
        name: 'dir',
        owner: 'root',
        size: '0b',
        type: 'directory',
    }];
    
    t.deepEqual(files, expected);
    t.end();
});

test('redzip: zip: read: raw', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/';
    const result = await read(outerPath, innerPath, {
        type: 'raw',
    });
    
    delete result[0].date;
    
    const expected = [{
        mode: 1_107_099_648,
        name: 'dir',
        owner: 'root',
        size: 0,
        type: 'directory',
    }];
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: read: no file found', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/abcd';
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: zip: read: no directory found', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/abcd/';
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: zip: read: file: size', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/file.zip');
    const innerPath = '/hello.txt';
    const {size} = await read(outerPath, innerPath);
    
    t.equal(size, 6);
    t.end();
});
