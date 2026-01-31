'use strict';

const {join} = require('node:path');
const {Readable} = require('node:stream');
const {createGzip} = require('node:zlib');
const {readFile} = require('node:fs/promises');

const {stub, test} = require('supertape');
const {tryToCatch} = require('try-to-catch');
const pullout = require('pullout');
const mockFs = require('mock-fs');
const read = require('../read');
const write = require('.');

const {assign} = Object;

test('redzip: zip: write: windows: no error', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world.txt';
    const restoreFs = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(write, outerPath, innerPath, Readable.from('hello'));
    
    restoreFs();
    
    t.notOk(error);
    t.end();
});

test('redzip: zip: write: windows: result', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world.txt';
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath, Readable.from('hello'));
    const stream = await read(outerPath, innerPath);
    const result = await pullout(stream);
    
    restoreFs();
    
    t.equal(result, 'hello');
    t.end();
});

test('redzip: zip: write: directory', async (t) => {
    const write = require('.');
    
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world/';
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.notOk(error);
    t.end();
});

test('redzip: zip: write: rename', async (t) => {
    const fs = require('node:fs/promises');
    const rename = stub(fs.rename);
    
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world/';
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath, null, {
        rename,
    });
    const [args] = rename.args;
    
    restoreFs();
    
    t.ok(args.length, 2, 'should call rename with 2 args');
    t.end();
});

test('redzip: zip: write: rename: error', async (t) => {
    const error = Error('hello');
    
    assign(error, {
        code: 'ENOENT',
    });
    
    const rename = stub().rejects(error);
    
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world/';
    const restoreFs = await mockFile(originalOuterPath);
    
    const [newError] = await tryToCatch(write, outerPath, innerPath, null, {
        rename,
    });
    
    restoreFs();
    
    t.equal(newError, error);
    t.end();
});

test('redzip: zip: write: unzip: error', async (t) => {
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world';
    
    const [error] = await tryToCatch(write, outerPath, innerPath, Readable.from('hello'), {
        unzip: true,
    });
    
    t.equal(error.message, 'incorrect header check');
    t.end();
});

test('redzip: zip: write: unzip', async (t) => {
    const write = require('.');
    
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world';
    const restoreFs = await mockFile(originalOuterPath);
    
    const stream = Readable
        .from('hello')
        .pipe(createGzip());
    
    await write(outerPath, innerPath, stream, {
        unzip: true,
    });
    
    const readStream = await read(outerPath, innerPath);
    const line = await pullout(readStream);
    
    restoreFs();
    
    t.equal(line, 'hello');
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
