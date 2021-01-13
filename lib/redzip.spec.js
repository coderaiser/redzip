'use strict';

const test = require('supertape');
const redzip = require('..');

test('redzip: read: directory', async (t) => {
    const {path} = await redzip.read('/bin', {
        root: '/',
    });
    
    const expected = '/bin/';
    
    t.deepEqual(path, expected);
    t.end();
});
