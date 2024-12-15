'use strict';

const path = require('node:path');

const test = require('supertape');

const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;

test('redzip: redfs', (t) => {
    mockRequire('node:path', path.win32);
    
    const redfs = reRequire('./redfs');
    const [, outerPath] = redfs('c:\\windows');
    const expected = 'c:\\windows';
    
    stopAll();
    reRequire('./redfs');
    
    t.equal(outerPath, expected);
    t.end();
});

test('redzip: redfs: outer', (t) => {
    mockRequire('node:path', path.win32);
    
    const redfs = reRequire('./redfs');
    const [, outerPath] = redfs('c:\\windows\\hello.zip\\readme.txt');
    const expected = 'c:\\windows\\hello.zip';
    
    stopAll();
    reRequire('./redfs');
    
    t.equal(outerPath, expected);
    t.end();
});

test('redzip: redfs: inner', (t) => {
    mockRequire('node:path', path.win32);
    
    const redfs = reRequire('./redfs');
    const [, , innerPath] = redfs('c:\\windows\\hello.zip\\readme.txt');
    const expected = '/readme.txt';
    
    stopAll();
    reRequire('./redfs');
    
    t.equal(innerPath, expected);
    t.end();
});
