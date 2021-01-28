'use strict';

const {join} = require('path');
const {Readable} = require('stream');
const {createGzip} = require('zlib');

const {test} = require('supertape');
const pullout = require('pullout');
const {read} = require('.');

const {reRequire} = require('mock-require');

test('redzip: zip: write: unzip', async (t) => {
    const {write} = reRequire('.');
    const outerPath = join(__dirname, 'fixture/hello.zip');
    const innerPath = '/world';
    
    const stream = Readable.from('hello').pipe(createGzip());
    
    await write(outerPath, innerPath, stream, {
        unzip: true,
    });
    
    const readStream = await read(outerPath, innerPath);
    const line = await pullout(readStream);
    
    t.equal(line, 'hello');
    t.end();
});

