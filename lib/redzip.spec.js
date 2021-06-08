'use strict';

const {join} = require('path');

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
    
    t.notOk(error);
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
    delete result.date;
    delete result.owner;
    
    const expected = {
        mode: 33_188,
        name: 'read-stat',
        size: 6,
        type: 'file',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

