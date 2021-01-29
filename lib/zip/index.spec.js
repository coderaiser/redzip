'use strict';

const {join} = require('path');
const {Readable} = require('stream');
const {createGzip} = require('zlib');
const {readFile} = require('fs/promises');

const {test} = require('supertape');
const pullout = require('pullout');
const mockFs = require('mock-fs');
const {read, write} = require('.');

test('redzip: zip: write: unzip', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    mockFs({
        '/fixture': {
            'hello.zip': await readFile(originalOuterPath),
        },
    });
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world';
    
    const stream = Readable.from('hello').pipe(createGzip());
    
    await write(outerPath, innerPath, stream, {
        unzip: true,
    });
    
    const readStream = await read(outerPath, innerPath);
    const line = await pullout(readStream);
    
    mockFs.restore();
    
    t.equal(line, 'hello');
    t.end();
});

