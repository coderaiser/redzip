'use strict';

const {join} = require('path');
const test = require('supertape');

const readStat = require('.');

test('redzip: vfs: read-stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(`${fixture}/nested/readme.md`);
    
    delete result.isDirectory;
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

test('redzip: read-stat: isDirectory', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const {isDirectory} = await readStat(`${fixture}/nested/readme.md`);
    
    t.notOk(isDirectory());
    t.end();
});

