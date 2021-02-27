'use strict';

const {join} = require('path');
const {Readable} = require('stream');
const {createGzip} = require('zlib');
const {readFile} = require('fs/promises');

const {test} = require('supertape');
const pullout = require('pullout');
const mockFs = require('mock-fs');
const tryToCatch = require('try-to-catch');

const {
    read,
    readStat,
    write,
    remove,
    list,
} = require('.');

test('redzip: zip: write: unzip', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    const restoreFs = await mockFile(originalOuterPath);
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world';
    
    const stream = Readable.from('hello').pipe(createGzip());
    
    await write(outerPath, innerPath, stream, {
        unzip: true,
    });
    
    const readStream = await read(outerPath, innerPath);
    const line = await pullout(readStream);
    
    restoreFs();
    
    t.equal(line, 'hello');
    t.end();
});

test('redzip: zip: remove', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world.txt';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath, Readable.from('hello'));
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/world.txt'`);
    t.end();
});

test('redzip: zip: list', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/empty';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const files = await list(outerPath, innerPath);
    
    restoreFs();
    
    t.deepEqual(files, []);
    t.end();
});

test('redzip: zip: readStat', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/empty';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const result = await readStat(outerPath, innerPath);
    
    delete result.owner;
    delete result.date;
    
    const expected = {
        mode: 438,
        name: 'empty',
        size: 0,
        type: 'dir',
    };
    
    restoreFs();
    
    t.deepEqual(result, expected);
    t.end();
});

async function mockFile(path) {
    mockFs({
        '/fixture': {
            'hello.zip': await readFile(path),
        },
    });
    
    return mockFs.restore;
}
