'use strict';

const {join} = require('path');
const test = require('supertape');

const readStat = require('.');

const createDate = (a) => new Date(Date.parse(a));

test('redzip: read-stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(`${fixture}/nested/readme.md`);
    
    delete result.isDirectory;
    
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

test('redzip: read-stat: isDirectory', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const {isDirectory} = await readStat(`${fixture}/nested/readme.md`);
    
    t.notOk(isDirectory());
    t.end();
});

