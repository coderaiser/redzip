'use strict';

const {EventEmitter} = require('events');
const {tmpdir} = require('os');
const {join} = require('path');
const {
    stat,
    rmdir,
    unlink,
} = require('fs/promises');
const {Readable} = require('stream');
const {createGzip} = require('zlib');
const {createReadStream} = require('fs');

const {test} = require('supertape');
const pullout = require('pullout');
const wait = require('@iocmd/wait');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');

const {
    write,
    read,
    remove,
} = require('.');

const {stopAll} = mockRequire;
const promiseAll = Promise.all.bind(Promise);

test('redzip: local: write', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me.txt');
    const data = 'hello';
    const innerPath = '';
    
    await write(name, innerPath, Readable.from(data));
    const result = await pullout(createReadStream(name));
    
    stopAll();
    await unlink(name);
    
    t.equal(result, data);
    t.end();
});

test('redzip: local: write: directory', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me');
    const innerPath = '';
    
    await write(name, innerPath);
    const result = await stat(name);
    
    stopAll();
    await rmdir(name);
    
    t.ok(result.isDirectory(), 'should create directory');
    t.end();
});

test('redzip: local: write: directory: mode', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me');
    const innerPath = '';
    
    await write(name, innerPath, null, {
        mode: 777,
    });
    
    const {mode} = await stat(name);
    await rmdir(name);
    
    t.equal(mode, 16_649, 'should create directory with mode');
    t.end();
});

test('redzip: local: write: unzip', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me.txt');
    const data = 'hello';
    const innerPath = '';
    
    const readableStream = Readable.from(data).pipe(createGzip());
    await write(name, innerPath, readableStream, {
        unzip: true,
    });
    
    const result = await pullout(createReadStream(name));
    
    stopAll();
    await unlink(name);
    
    t.equal(result, data);
    t.end();
});

test('redzip: local: write: unzip', async (t) => {
    const innerPath = '';
    const emitter = new EventEmitter();
    const createReadStream = () => emitter;
    
    const fs = require('fs');
    mockRequire('fs', {
        ...fs,
        createReadStream,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    const expectedError = Error('cannot open');
    
    const [error] = await tryToCatch(promiseAll, [
        read(__filename, innerPath),
        wait(emit, 'error', expectedError),
    ]);
    
    stopAll();
    
    t.equal(error, expectedError);
    t.end();
});

test('redzip: local: remove: error', async (t) => {
    const [error] = await tryToCatch(remove, '/root/xxx', '');
    
    t.equal(error.message, `ENOENT: no such file or directory, rmdir '/root/xxx'`);
    t.end();
});

test('redzip: local: remove: file', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'remove-me.txt');
    const innerPath = '';
    
    await write(outerPath, innerPath, Readable.from('hello'));
    const [error] = await tryToCatch(remove, outerPath);
    
    t.notOk(error);
    t.end();
});

test('redzip: local: remove: directory', async (t) => {
    const innerPath = '';
    const outerPath = join(__dirname, 'fixture', 'remove-me');
    
    await write(outerPath, innerPath);
    const [error] = await tryToCatch(remove, outerPath);
    
    t.notOk(error);
    t.end();
});

test('redzip: local: read: size', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'hello.txt');
    const innerPath = '';
    
    const {size} = await read(outerPath, innerPath);
    
    t.equal(size, 6);
    t.end();
});

test('redzip: local: read: size: error', async (t) => {
    const outerPath = '/root/hello';
    const innerPath = '';
    
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.ok(error);
    t.end();
});

