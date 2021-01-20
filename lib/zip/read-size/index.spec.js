'use strict';

const {join} = require('path');
const test = require('supertape');
const readSize = require('.');

test('redzip: zip: read-size', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const size = await readSize(fixture, '/');
    
    t.equal(size, '12b', '"hello" and "world" with line endings');
    t.end();
});

test('redzip: zip: read-size: nested', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const size = await readSize(fixture, '/nested/words');
    
    t.equal(size, '12b', '"hello" and "world" with line endings');
    t.end();
});

test('redzip: zip: read-size: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const size = await readSize(fixture, '/nested/readme.md');
    
    t.equal(size, '15b');
    t.end();
});

test('redzip: zip: read-size: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const size = await readSize(fixture, '/nested/readme.md', {
        type: 'raw',
    });
    
    t.equal(size, 15);
    t.end();
});

