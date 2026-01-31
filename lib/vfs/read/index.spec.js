import {
    join,
    sep,
    dirname,
} from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {test, stub} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import pullout from 'pullout';
import {read} from './index.js';
import {write} from '../write/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: vfs: read: read: no path', async (t) => {
    const [e] = await tryToCatch(read);
    
    t.equal(e.message, 'path should be string!', 'should throw when no path');
    t.end();
});

test('redzip: vfs: read: wrong type', async (t) => {
    const [e] = await tryToCatch(read, '/1.zip/', {
        type: 3,
    });
    
    t.equal(e.message, 'type should be a string or not to be defined!');
    t.end();
});

test('redzip: vfs: read: wrong sort', async (t) => {
    const [e] = await tryToCatch(read, '/1.zip/', {
        sort: 3,
    });
    
    t.equal(e.message, 'sort should be a string!');
    t.end();
});

test('redzip: vfs: read: wrong order', async (t) => {
    const [e] = await tryToCatch(read, '/1.zip/', {
        order: 'hello',
    });
    
    t.equal(e.message, 'order can be "asc" or "desc" only!');
    t.end();
});

test('redzip: vfs: read: open error', async (t) => {
    const path = '/hello/';
    const options = {};
    
    const [e] = await tryToCatch(read, path, options);
    
    t.equal(e.message, `ENOENT: no such file or directory, scandir '/hello/'`);
    t.end();
});

test('redzip: vfs: read: file', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'file.zip');
    
    const path = `${zipPath}${sep}hello.txt`;
    const file = 'world\n';
    
    const stream = await read(path);
    const result = await pullout(stream, 'string');
    
    t.equal(result, file);
    t.end();
});

test('redzip: vfs: read: directory', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    const files = [{
        name: 'hello.txt',
        size: 6,
        date: new Date('2021-01-05T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }];
    
    const path = `${zipPath}${sep}dir`;
    
    const vfs = {
        read: stub().returns(files),
    };
    
    const redfs = stub().returns([vfs, '', '']);
    
    const stream = await read(path, {
        type: 'raw',
        redfs,
    });
    
    t.equal(stream.files, files);
    t.end();
});

test('redzip: vfs: read: directory: nested', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'nested.zip');
    
    const path = `${zipPath}${sep}nested`;
    const files = [{
        name: 'dir',
        size: 0,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 1_107_099_648,
        type: 'directory',
    }, {
        name: '.zip',
        size: 1142,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }, {
        name: 'dir.zip',
        size: 232,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }, {
        name: 'world.txt',
        size: 6,
        date: new Date('2021-01-04T22:00:00.000Z'),
        owner: 'root',
        mode: 2_176_057_344,
        type: 'file',
    }];
    
    const vfs = {
        read: stub().returns(files),
    };
    
    const redfs = stub().returns([vfs, '', '']);
    
    const stream = await read(path, {
        type: 'raw',
        redfs,
    });
    
    t.deepEqual(stream.files, files);
    t.end();
});

test('redzip: vfs: read: directory: with slash', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    const path = `${zipPath}${sep}dir/`;
    const {files} = await read(path);
    
    const expected = [{
        name: 'hello.txt',
        size: '6b',
        date: '05.01.2021',
        owner: 'root',
        mode: 'rw- rw- rw-',
        type: 'file',
    }];
    
    t.deepEqual(files, expected);
    t.end();
});

test('redzip: vfs: read: file: type', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'file.zip');
    
    const path = `${zipPath}${sep}hello.txt`;
    const {type} = await read(path);
    
    t.equal(type, 'file');
    t.end();
});

test('redzip: vfs: read: directory: type', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    const path = `${zipPath}${sep}dir`;
    
    const {type} = await read(path);
    
    t.equal(type, 'directory');
    t.end();
});

test('redzip: vfs: read: directory: local', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    
    const files = [{
        date: '20.01.2021',
        mode: 'rw- rw- r--',
        name: 'dir.zip',
        owner: 'coderaiser',
        size: '232b',
        type: 'file',
    }, {
        date: '20.01.2021',
        mode: 'rw- rw- r--',
        name: 'file.zip',
        owner: 'coderaiser',
        size: '140b',
        type: 'file',
    }, {
        date: '20.01.2021',
        mode: 'rw- rw- r--',
        name: 'nested.zip',
        owner: 'coderaiser',
        size: '1.46kb',
        type: 'file',
    }];
    
    const readify = stub().returns(files);
    
    const vfs = {
        read: readify,
    };
    
    const redfs = stub().returns([vfs, '', '']);
    
    const stream = await read(dirPath, {
        redfs,
    });
    
    t.equal(stream.files, files);
    t.end();
});

test('redzip: vfs: read: file: local', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    const stream = await read(zipPath);
    const file = await pullout(stream, 'buffer');
    const expected = await readFile(zipPath);
    
    t.deepEqual(file, expected);
    t.end();
});

test('redzip: vfs: read: file: local: real path error', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    const realpath = stub().throws(Error('hello'));
    
    const stream = await read(zipPath);
    
    const file = await pullout(stream, 'buffer');
    const expected = await readFile(zipPath, {
        realpath,
    });
    
    t.deepEqual(file, expected);
    t.end();
});

test('redzip: vfs: read: zip: directory: root', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    const {path} = await read(`${zipPath}${sep}`, {
        root: dirPath,
    });
    
    const expected = '/dir.zip/';
    
    t.equal(path, expected);
    t.end();
});

test('redzip: vfs: read: directory: root', async (t) => {
    const {path} = await read('/', {
        root: '/',
    });
    
    const expected = '/';
    
    t.equal(path, expected);
    t.end();
});

test('redzip: vfs: read: directory: long path', async (t) => {
    const {path} = await read('/bin', {
        root: '/',
    });
    
    const expected = '/bin/';
    
    t.equal(path, expected);
    t.end();
});

test('redzip: vfs: read: file: root', async (t) => {
    const {type} = await read(__filename, {
        root: '/',
    });
    
    t.equal(type, 'file');
    t.end();
});

test('redzip: vfs: read: file: contentLength', async (t) => {
    const name = join(...[
        __dirname,
        'fixture',
        'file.zip',
        'hello.txt',
    ]);
    
    const {contentLength} = await read(name, {
        root: '/',
    });
    
    t.equal(contentLength, 6);
    t.end();
});

test('redzip: vfs: read: dir: contentLength', async (t) => {
    const name = join(__dirname, 'fixture', 'empty-dir');
    
    await write(name);
    
    const {contentLength} = await read(name, {
        root: '/',
    });
    
    t.equal(typeof contentLength, 'number');
    t.end();
});
