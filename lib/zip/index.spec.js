import {Readable} from 'node:stream';
import {createGzip} from 'node:zlib';
import {readFile} from 'node:fs/promises';
import {test} from 'supertape';
import pullout from 'pullout';
import mockFs from 'mock-fs';
import {tryToCatch} from 'try-to-catch';
import {
    read,
    readStat,
    write,
    remove,
    list,
} from './index.js';

test('redzip: zip: complex: write: unzip', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    const restoreFs = await mockFile(originalOuterPath);
    
    const outerPath = '/fixture/hello.zip';
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

test('redzip: zip: complex: list', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/empty';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    const files = await list(outerPath, innerPath);
    
    restoreFs();
    
    t.deepEqual(files, []);
    t.end();
});

test('redzip: zip: readStat', async (t) => {
    const originalOuterPath = new URL('fixture/hello.zip', import.meta.url).pathname;
    
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
