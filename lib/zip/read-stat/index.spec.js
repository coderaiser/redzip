'use strict';

const {join} = require('path');
const test = require('supertape');
const tryToCatch = require('try-to-catch');

const readStat = require('.');

const createDate = (a) => new Date(Date.parse(a));

test('redzip: zip: read-stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(fixture, '/nested');
    const expected = {
        date: createDate('2021-01-18T22:00:00.000Z'),
        mode: 1_107_099_648,
        name: 'nested',
        owner: 0,
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
    const expected = {
        date: createDate('2021-01-18T22:00:00.000Z'),
        mode: 2_176_057_344,
        name: 'readme.md',
        owner: 0,
        size: 15,
        type: 'file',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

