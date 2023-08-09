'use strict';

const {stub, test} = require('supertape');

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

const pullout = require('pullout');
const wait = require('@iocmd/wait');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');

const {
    write,
    read,
    readStat,
    remove,
    list,
} = require('.');

const {stopAll, reRequire} = mockRequire;
const promiseAll = Promise.all.bind(Promise);
const {isArray} = Array;

const {assign} = Object;

test('redzip: local: write', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me.txt');
    const data = 'hello';
    const innerPath = '';
    
    await write(name, innerPath, Readable.from(data));
    const result = await pullout(createReadStream(name));
    
    await unlink(name);
    
    t.equal(result, data);
    t.end();
});

test('redzip: local: write: directory', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me');
    const innerPath = '';
    
    await write(name, innerPath);
    const result = await stat(name);
    
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

test('redzip: local: write: file: mode', async (t) => {
    const outerPath = join(tmpdir(), 'redzip-remove-me.txt');
    const innerPath = '';
    
    await write(outerPath, innerPath, Readable.from('hello'), {
        mode: 0o777,
    });
    
    const {mode} = await stat(outerPath);
    await unlink(outerPath);
    
    t.equal(mode, 33_261, 'should create file with mode');
    t.end();
});

test('redzip: local: write: unzip', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me.txt');
    const data = 'hello';
    const innerPath = '';
    
    const readableStream = Readable
        .from(data)
        .pipe(createGzip());
    
    await write(name, innerPath, readableStream, {
        unzip: true,
    });
    
    const result = await pullout(createReadStream(name));
    
    await unlink(name);
    
    t.equal(result, data);
    t.end();
});

test('redzip: local: write: unzip: error', async (t) => {
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
    const [error] = await tryToCatch(remove, '/xxx/xxx', '');
    
    t.ok(error, error.message);
    t.end();
});

test('redzip: local: remove: file: rmdir throws ENOENT on windwos', async (t) => {
    const removeError = assign(Error('cannot remove on windows'), {
        code: 'ENOENT',
    });
    
    const rmdir = stub().throws(removeError);
    const unlink = stub();
    
    mockRequire('fs/promises', {
        rmdir,
        unlink,
    });
    
    const {remove} = reRequire('./index.js');
    await remove('/xxx/xxx/');
    
    stopAll();
    const expected = '/xxx/xxx/';
    
    t.calledWith(unlink, [expected]);
    t.end();
});

test('redzip: local: remove: file: rmdir throws: unexpected', async (t) => {
    const removeError = assign(Error('cannot remove on windows'), {
        code: 'UNEXPECTED',
    });
    
    const rmdir = stub().throws(removeError);
    const unlink = stub();
    
    mockRequire('fs/promises', {
        rmdir,
        unlink,
    });
    
    const {remove} = reRequire('./index.js');
    const [error] = await tryToCatch(remove, '/xxx/xxx/');
    
    stopAll();
    
    t.equal(error.code, 'UNEXPECTED');
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

test('redzip: local: read: contentLength', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'hello.txt');
    const innerPath = '';
    
    const {contentLength} = await read(outerPath, innerPath);
    
    t.equal(contentLength, 6);
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
    
    t.ok(isArray(names));
    t.end();
});

test('redzip: local: list: file', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'list', 'list-file2.js');
    const innerPath = '';
    
    const names = await list(outerPath, innerPath);
    
    const expected = [outerPath];
    
    t.deepEqual(names, expected);
    t.end();
});

test('redzip: local: readStat: file', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'list', 'list-file2.js');
    const innerPath = '';
    
    const names = await readStat(outerPath, innerPath);
    
    delete names.date;
    delete names.owner;
    
    const expected = {
        mode: 33_188,
        name: 'list-file2.js',
        size: 0,
        type: 'file',
    };
    
    t.deepEqual(names, expected);
    t.end();
});

test('redzip: local: readStat: directory', async (t) => {
    const outerPath = join(__dirname, 'fixture', 'list');
    const innerPath = '';
    
    const names = await readStat(outerPath, innerPath);
    
    delete names.date;
    delete names.owner;
    
    const expected = {
        name: 'list',
        mode: 16_877,
        size: 0,
        type: 'dir',
    };
    
    t.deepEqual(names, expected);
    t.end();
});
