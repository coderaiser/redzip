'use strict';

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const redzip = require('..');

test('redzip: read: directory', async (t) => {
    const {path} = await redzip.read('/bin', {
        root: '/',
    });
    
    const expected = '/bin/';
    
    t.deepEqual(path, expected);
    t.end();
});

test('redzip: remove', async (t) => {
    const [error] = await tryToCatch(redzip.remove, 'xxx');
    
    t.equal(error.message, `ENOENT: no such file or directory, rmdir 'xxx'`);
    t.end();
});

test('redzip: list', async (t) => {
    const [error] = await tryToCatch(redzip.list, '/root');
    
    t.ok(error, error.message);
    t.end();
});

