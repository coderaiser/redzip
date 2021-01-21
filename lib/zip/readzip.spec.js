'use strict';

const {join, win32} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');
const readzip = require('./readzip');

const {reRequire, stopAll} = mockRequire;

test('redzip: traverse: isDirectory', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    let result;
    for await (const path of readzip(zipPath)) {
        result = path.isDirectory('/hello/world');
    }
    
    t.notOk(result);
    t.end();
});

test('redzip: traverse: isFile: windows', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    mockRequire('path', win32);
    
    const readzip = reRequire('./readzip');
    
    let result;
    for await (const path of readzip(zipPath)) {
        result = path.isFile('/dir/hello.txt');
        
        if (result)
            break;
    }
    
    stopAll();
    
    t.ok(result);
    t.end();
});
