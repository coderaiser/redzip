'use strict';

const {join} = require('path');

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const redzip = require('..');

const createDate = (a) => new Date(Date.parse(a));

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

test('redzip: readStat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'read-stat');
    const result = await redzip.readStat(fixture);
    
    delete result.isDirectory;
    
    const expected = {
        date: createDate('2021-02-17T12:47:43.360Z'),
        mode: 33_188,
        name: 'read-stat',
        owner: 501,
        size: 6,
        type: 'file',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

