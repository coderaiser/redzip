import {Readable} from 'node:stream';
import {createGzip} from 'node:zlib';
import {test} from 'supertape';
import pullout from 'pullout';
import {tryToCatch} from 'try-to-catch';
import {mockFile} from '#mock-file';
import {
    read,
    readStat,
    write,
    remove,
    list,
} from './index.js';

test('redzip: zip: complex: write: unzip', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
    const innerPath = '/world';
    
    const stream = Readable
        .from('hello')
        .pipe(createGzip());
    
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

test('redzip: zip: complex: list', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    
    const innerPath = '/empty';
    
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
    const result = await list(outerPath, innerPath);
    const expected = [];
    
    restoreFs();
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: readStat', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    
    const innerPath = '/empty';
    
    const {outerPath, restoreFs} = await mockFile(originalOuterPath);
    
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
