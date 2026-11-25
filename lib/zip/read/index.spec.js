import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Buffer} from 'node:buffer';
import {ZipFile} from 'yazl';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {mockDir} from '#mock-file';
import read from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: zip: read: windows', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/';
    const files = await read(outerPath, innerPath);
    
    const expected = [{
        date: '05.01.2021',
        time: '16:15:14',
        mode: 'rw- rw- rw-',
        name: 'dir',
        owner: 'root',
        size: '0b',
        type: 'directory',
    }];
    
    t.deepEqual(files, expected);
    t.end();
});

test('redzip: zip: read: raw', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/';
    
    const result = await read(outerPath, innerPath, {
        type: 'raw',
    });
    
    delete result[0].date;
    
    const expected = [{
        mode: 438,
        name: 'dir',
        owner: 'root',
        size: 0,
        type: 'directory',
    }];
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: read: no file found', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/abcd';
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: zip: read: no directory found', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/abcd/';
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: zip: read: file: contentLength', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/file.zip');
    const innerPath = '/hello.txt';
    const {contentLength} = await read(outerPath, innerPath);
    
    t.equal(contentLength, 6);
    t.end();
});

test('redzip: zip: read: sort: time', async (t) => {
    const {dir, restoreFs} = await mockDir();
    const outerPath = join(dir, 'time.zip');
    
    await createZip(outerPath, [
        ['a-late.txt', new Date(2020, 0, 1, 18, 0, 0)],
        ['z-early.txt', new Date(2020, 0, 1, 8, 0, 0)],
    ]);
    
    const files = await read(outerPath, '/', {
        sort: 'time',
    });
    
    restoreFs();
    
    const result = [];
    
    for (const {name, time} of files) {
        result.push([name, time]);
    }
    
    const expected = [
        ['z-early.txt', '08:00:00'],
        ['a-late.txt', '18:00:00'],
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: read: sort: time: desc', async (t) => {
    const {dir, restoreFs} = await mockDir();
    const outerPath = join(dir, 'time.zip');
    
    await createZip(outerPath, [
        ['a-late.txt', new Date(2020, 0, 1, 18, 0, 0)],
        ['z-early.txt', new Date(2020, 0, 1, 8, 0, 0)],
    ]);
    
    const files = await read(outerPath, '/', {
        sort: 'time',
        order: 'desc',
    });
    
    restoreFs();
    
    const result = [];
    
    for (const {name} of files) {
        result.push(name);
    }
    
    const expected = [
        'a-late.txt',
        'z-early.txt',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

async function createZip(path, files) {
    const zip = new ZipFile();
    
    for (const [name, mtime] of files)
        zip.addBuffer(Buffer.from(name), name, {
            mtime,
        });
    
    zip.end();
    
    await pipeline(zip.outputStream, createWriteStream(path));
}
