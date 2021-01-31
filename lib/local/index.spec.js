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

const test = require('supertape');
const pullout = require('pullout');
const wait = require('@iocmd/wait');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');

const {write, read} = require('.');
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

