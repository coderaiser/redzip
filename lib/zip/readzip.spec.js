'use strict';

const {join} = require('path');

const test = require('supertape');
const readzip = require('./readzip');

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
