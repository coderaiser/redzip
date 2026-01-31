import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import read from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: zip: read: windows', async (t) => {
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/';
    const files = await read(outerPath, innerPath);
    
    const expected = [{
        date: '05.01.2021',
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
