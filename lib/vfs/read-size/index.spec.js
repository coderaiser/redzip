'use strict';

const {join} = require('path');
const test = require('supertape');
const pullout = require('pullout');
const tryToCatch = require('try-to-catch');

const readSize = require('.');

test('redzip: read-size', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const stream = await readSize(`${fixture}/`);
    const size = await pullout(stream);
    
    t.equal(size, '12b', '"hello" and "world" with line endings');
    t.end();
});

test('redzip: read-size: nested', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(`${fixture}/nested/words`);
    const size = await pullout(stream);
    
    t.equal(size, '12b', '"hello" and "world" with line endings');
    t.end();
});

test('redzip: read-size: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(`${fixture}/nested/readme.md`);
    const size = await pullout(stream);
    
    t.equal(size, '15b');
    t.end();
});

test('redzip: read-size: file: raw', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(`${fixture}/nested/readme.md`, {
        type: 'raw',
    });
    
    const size = await pullout(stream);
    
    t.equal(size, '15');
    t.end();
});

test('redzip: read-size: wrong type', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const [error] = await tryToCatch(readSize, `${fixture}/nested/readme.md`, {
        type: 'hello',
    });
    
    t.equal(error.message, 'type should be "raw" or not to be defined!');
    t.end();
});

test('redzip: read-size: local', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(fixture);
    const size = await pullout(stream);
    
    t.equal(size, '641b');
    t.end();
});

