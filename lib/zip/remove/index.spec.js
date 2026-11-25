import {Readable} from 'node:stream';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {mockFile} from '#mock-file';
import remove from './index.js';
import {read, write} from '../index.js';

test('redzip: zip: remove: ENOENT', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    
    const innerPath = '/world.txt';
    
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath, Readable.from('hello'));
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/world.txt'`);
    t.end();
});

test('redzip: zip: remove: directory', async (t) => {
    const originalOuterPath = new URL('fixture/dir.zip', import.meta.url).pathname;
    
    const innerPath = '/xxx';
    
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath);
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/xxx'`);
    t.end();
});

test('redzip: zip: remove: one directory', async (t) => {
    const originalOuterPath = new URL('fixture/one-dir.zip', import.meta.url).pathname;
    
    const innerPath = '/one-dir';
    
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(remove, outerPath, innerPath);
    await read(outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `Can't remove latest entry`);
    t.end();
});

test('redzip: zip: remove: one directory: error', async (t) => {
    const originalOuterPath = new URL('fixture/one-file.zip', import.meta.url).pathname;
    
    const innerPath = '/one-file.txt';
    
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
    const [error] = await tryToCatch(remove, outerPath, innerPath);
    await read(outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `Can't remove latest entry`);
    t.end();
});
