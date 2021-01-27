'use strict';

const {Readable} = require('stream');
const {basename} = require('path');

const redfs = require('../../redfs');

const isString = (a) => typeof a === 'string';

module.exports = async (path, data) => {
    validate({
        path,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    await vfs.write(outerPath, innerPath, data);
    
    return Readable.from(`save: ok("${basename(path)}")`);
};

function validate({path, data}) {
    if (!isString(path))
        throw Error('path should be string!');
}


