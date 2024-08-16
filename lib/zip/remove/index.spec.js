'use strict';

const {join} = require('node:path');
const {Readable} = require('node:stream');
const {readFile} = require('node:fs/promises');

const {test} = require('supertape');
const tryToCatch = require('try-to-catch');
const mockFs = require('mock-fs');
const remove = require('.');
const {read, write} = require('..');

test('redzip: zip: remove: ENOENT', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world.txt';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath, Readable.from('hello'));
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/world.txt'`);
    t.end();
});

test('redzip: zip: remove: directory', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/dir.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/xxx';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath);
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/xxx'`);
    t.end();
});

test('redzip: zip: remove: one directory', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/one-dir.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/one-dir';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(remove, outerPath, innerPath);
    await read(outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `Can't remove latest entry`);
    t.end();
});

test('redzip: zip: remove: one directory: error', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/one-file.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/one-file.txt';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(remove, outerPath, innerPath);
    await read(outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `Can't remove latest entry`);
    t.end();
});

async function mockFile(path) {
    mockFs({
        '/fixture': {
            'hello.zip': await readFile(path),
        },
    });
    
    return mockFs.restore;
}
