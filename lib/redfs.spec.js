'use strict';

const path = require('node:path');

const {test} = require('supertape');
const redfs = require('./redfs');

test('redzip: redfs', (t) => {
    const {sep} = path.win32;
    const [, outerPath] = redfs('c:\\windows', {
        sep,
    });
    
    const expected = 'c:\\windows';
    
    t.equal(outerPath, expected);
    t.end();
});

test('redzip: redfs: outer', (t) => {
    const {sep} = path.win32;
    const [, outerPath] = redfs('c:\\windows\\hello.zip\\readme.txt', {
        sep,
    });
    
    const expected = 'c:\\windows\\hello.zip';
    
    t.equal(outerPath, expected);
    t.end();
});

test('redzip: redfs: inner', (t) => {
    const {sep} = path.win32;
    const [, , innerPath] = redfs('c:\\windows\\hello.zip\\readme.txt', {
        sep,
    });
    
    const expected = '/readme.txt';
    
    t.equal(innerPath, expected);
    t.end();
});
