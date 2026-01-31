import {Readable} from 'node:stream';
import {readFile} from 'node:fs/promises';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import mockFs from 'mock-fs';
import remove from './index.js';
import {read, write} from '../index.js';

test('redzip: zip: remove: ENOENT', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    
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

test('redzip: zip: remove: directory', async (t) => {
    const originalOuterPath = new URL('fixture/dir.zip', import.meta.url).pathname;
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/xxx';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath);
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/xxx'`);
    t.end();
});

test('redzip: zip: remove: one directory', async (t) => {
    const originalOuterPath = new URL('fixture/one-dir.zip', import.meta.url).pathname;
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/one-dir';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(remove, outerPath, innerPath);
    await read(outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `Can't remove latest entry`);
    t.end();
});

test('redzip: zip: remove: one directory: error', async (t) => {
    const originalOuterPath = new URL('fixture/one-file.zip', import.meta.url).pathname;
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/one-file.txt';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(remove, outerPath, innerPath);
    await read(outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `Can't remove latest entry`);
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
