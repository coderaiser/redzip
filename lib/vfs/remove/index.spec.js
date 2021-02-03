'use strict';

const test = require('supertape');
const tryToCatch = require('try-to-catch');
const remove = require('.');

test('redzip: vfs: remove', async (t) => {
    const [error] = await tryToCatch(remove, 'hello');
    
    t.equal(error.message, `ENOENT: no such file or directory, rmdir 'hello'`);
    t.end();
});

test('redzip: vfs: remove', async (t) => {
    const [error] = await tryToCatch(remove);
    
    t.equal(error.message, `path should be string!`);
    t.end();
});

