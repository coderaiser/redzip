'use strict';

const {tmpdir} = require('os');
const {join} = require('path');
const {stat, rmdir, unlink} = require('fs/promises');
const {Readable} = require('stream');
const {createGzip} = require('zlib');
const {createReadStream} = require('fs');

const test = require('supertape');
const {stopAll} = require('mock-require');
const pullout = require('pullout');

const {write} = require('.');

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
    const name = join(tmpdir(), 'redzip-remove-me/');
    const data = 'hello';
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

