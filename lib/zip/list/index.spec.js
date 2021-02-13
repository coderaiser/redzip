'use strict';

const {join} = require('path');
const test = require('supertape');
const list = require('.');

test('redzip: zip: list', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/');
    
    const expected = [
        '/words/hello.txt',
        '/words/world.txt',
        '/words/',
    ];
    
    t.deepEqual(names, expected);
    t.end();
});

