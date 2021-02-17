'use strict';

const {join} = require('path');
const test = require('supertape');
const list = require('.');

test('redzip: zip: list', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const result = await list(fixture, '/');
    
    const expected = [
        join(fixture, '/words/hello.txt'),
        join(fixture, '/words/world.txt'),
        join(fixture, '/words/'),
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: list', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/words', {
        stat: true,
    });
    
    const expected = [
        join(fixture, '/words/hello.txt'),
        join(fixture, '/words/world.txt'),
    ];
    
    t.deepEqual(names, expected);
    t.end();
});

test('redzip: zip: list: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/words/hello.txt', {
        stat: true,
    });
    
    const expected = [
        join(fixture, '/words/hello.txt'),
    ];
    
    t.deepEqual(names, expected);
    t.end();
});

