'use strict';

const {join, win32} = require('path');
const {Readable} = require('stream');

const {stub, test} = require('supertape');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');
const pullout = require('pullout');
const read = require('../read');

const {stopAll, reRequire} = mockRequire;
const {assign} = Object;

test('redzip: zip: write: windows: no error', async (t) => {
    mockRequire('path', win32);
    
    const write = reRequire('.');
    
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world.txt';
    const [error] = await tryToCatch(write, outerPath, innerPath, Readable.from('hello'));
    
    stopAll();
    
    t.notOk(error);
    t.end();
});

test('redzip: zip: write: windows: no error', async (t) => {
    const write = reRequire('.');
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world.txt';
    
    await write(outerPath, innerPath, Readable.from('hello'));
    const stream = await read(outerPath, innerPath);
    const result = await pullout(stream);
    
    t.equal(result, 'hello');
    t.end();
});

test('redzip: zip: write: remove', async (t) => {
    const write = reRequire('.');
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world.txt';
    
    await write(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: zip: write: directory', async (t) => {
    const write = reRequire('.');
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world/';
    
    await write(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.notOk(error);
    t.end();
});

test('redzip: zip: write: rename', async (t) => {
    const fs = require('fs/promises');
    const rename = stub(fs.rename);
    
    mockRequire('fs/promises', {
        ...fs,
        rename,
    });
    const write = reRequire('.');
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world/';
    
    await write(outerPath, innerPath);
    const [args] = rename.args;
    
    t.ok(args.length, 2, 'should call rename with 2 args');
    t.end();
});

test('redzip: zip: write: rename: error', async (t) => {
    const error = new Error('hello');
    
    assign(error, {
        code: 'ENOENT',
    });
    
    const rename = stub().throws(error);
    
    const fs = require('fs/promises');
    mockRequire('fs/promises', {
        ...fs,
        rename,
    });
    const write = reRequire('.');
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world/';
    
    const [newError] = await tryToCatch(write, outerPath, innerPath);
    
    t.equal(newError, error);
    t.end();
});

