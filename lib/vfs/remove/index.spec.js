'use strict';

const {join} = require('path');

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const remove = require('.');
const write = require('../write');
const read = require('../read');

test('redzip: vfs: remove', async (t) => {
    const path = join(__dirname, 'fixture', 'remove-me');
    
    await write(path);
    await remove(path);
    
    const [error] = await tryToCatch(read, path);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: vfs: remove: no path', async (t) => {
    const [error] = await tryToCatch(remove);
    
    t.equal(error.message, `path should be string!`);
    t.end();
});

test('redzip: vfs: remove: error', async (t) => {
    const [error] = await tryToCatch(remove, 'hello');
    
    t.equal(error.message, `ENOENT: no such file or directory, rmdir 'hello'`);
    t.end();
});

test('redzip: vfs: remove: no path', async (t) => {
    const [error] = await tryToCatch(remove);
    
    t.equal(error.message, `path should be string!`);
    t.end();
});

