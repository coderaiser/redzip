'use strict';

const {join} = require('node:path');
const {test} = require('supertape');
const {tryToCatch} = require('try-to-catch');

const readStat = require('.');

test('redzip: zip: read-stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(fixture, '/nested');
    
    delete result.date;
    delete result.owner;
    
    const expected = {
        mode: 438,
        name: 'nested',
        size: 0,
        type: 'dir',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: read-stat: not found', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const [error] = await tryToCatch(readStat, fixture, '/nested/words/not-found');
    
    t.ok(error);
    t.end();
});

test('redzip: zip: read-stat: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(fixture, '/nested/readme.md');
    
    delete result.date;
    delete result.owner;
    
    const expected = {
        mode: 438,
        name: 'readme.md',
        size: 15,
        type: 'file',
    };
    
    t.deepEqual(result, expected);
    t.end();
});
