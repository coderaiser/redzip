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
    list,
} = require('.');

const {stopAll} = mockRequire;
const promiseAll = Promise.all.bind(Promise);
const createDate = (a) => new Date(Date.parse(a));

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
        mode: 0o777,
    });
    
    const {mode} = await stat(name);
    await rmdir(name);
    
    t.equal(mode, 16_877, 'should create directory with mode');
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
    
    t.ok(error, error.message);
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

test('redzip: local: list', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'list');
    const innerPath = '';
    
    const names = await list(outerPath, innerPath);
    
    const file1 = [
        join(outerPath, 'list-file2.js'), {
            date: createDate('2021-02-13T11:07:48.632Z'),
            mode: 33_188,
            name: 'list-file2.js',
            size: 0,
        }];
    
    const dir = [
        '/Users/coderaiser/redzip/lib/local/fixture/list/list-nested',
        {
            date: createDate('2021-02-13T16:21:01.410Z'),
            mode: 16_877,
            name: 'list-nested',
            size: 64,
        },
    ];
    const file2 = [
        join(outerPath, 'list-file1.js'), {
            date: createDate('2021-02-13T11:07:46.480Z'),
            mode: 33_188,
            name: 'list-file1.js',
            size: 0,
        }];
    
    const expected = [file1, dir, file2];
    
    t.deepEqual(names, expected);
    t.end();
});

test('redzip: local: list: file', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'list', 'list-file2.js');
    const innerPath = '';
    
    const names = await list(outerPath, innerPath);
    
    const file = [
        outerPath, {
            date: createDate('2021-02-13T11:07:48.632Z'),
            mode: 33_188,
            name: 'list-file2.js',
            size: 0,
        }];
    
    const expected = [file];
    
    t.deepEqual(names, expected);
    t.end();
});

