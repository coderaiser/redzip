'use strict';

const {test, stub} = require('supertape');
const mockRequire = require('mock-require');

const {stopAll} = mockRequire;

test('redzip: vfs: list', async (t) => {
    const path = '/hello';
    const outerPath = '/hello';
    const innerPath = '';
    
    const list = stub().returns([]);
    const vfs = {
        list,
    };
    const redfs = stub().returns([
        vfs,
        innerPath,
        outerPath,
    ]);
    
    mockRequire('../../redfs', redfs);
    const result = await list(path);
    
    stopAll();
    
    t.deepEqual(result, []);
    t.end();
});

