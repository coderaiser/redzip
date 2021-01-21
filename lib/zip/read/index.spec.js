'use strict';

const {join, win32} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');

const {stopAll, reRequire} = mockRequire;

test('redzip: zip: read: windows', async (t) => {
    mockRequire('path', win32);
    
    const read = reRequire('.');
    
    const outerPath = join(__dirname, '..', 'fixture/dir.zip');
    const innerPath = '/';
    const files = await read(outerPath, innerPath);
    
    stopAll();
    
    const expected = [{
        date: '05.01.2021',
        mode: '--- --- ---',
        name: 'dir',
        owner: 'root',
        size: '0b',
        type: 'directory',
    }];
    
    t.deepEqual(files, expected);
    t.end();
});
