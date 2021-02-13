'use strict';

const {join} = require('path');
const test = require('supertape');
const list = require('.');

const createDate = (a) => new Date(Date.parse(a));
const shift = ([a]) => a;

test('redzip: zip: list', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/');
    
    const expected = [
        '/words/hello.txt',
        '/words/world.txt',
        '/words/',
    ];
    
    const result = names.map(shift);
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: list', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/words', {
        stat: true,
    });
    
    const expected = [
        [
            '/words/hello.txt',
            {
                date: createDate('2021-01-18T22:00:00.000Z'),
                mode: 2_176_057_344,
                name: 'hello.txt',
                size: 6,
            },
        ],
        [
            '/words/world.txt',
            {
                date: createDate('2021-01-18T22:00:00.000Z'),
                mode: 2_176_057_344,
                name: 'world.txt',
                size: 6,
            },
        ],
    ];
    
    t.deepEqual(names, expected);
    t.end();
});

