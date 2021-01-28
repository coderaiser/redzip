'use strict';

const {Readable} = require('stream');
const {basename} = require('path');

const redfs = require('../../redfs');

const isString = (a) => typeof a === 'string';

module.exports = async (path, data, options) => {
    validate({
        path,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    await vfs.write(outerPath, innerPath, data, options);
    
    return Readable.from(`save: ok("${basename(path)}")`);
};

function validate({path}) {
    if (!isString(path))
        throw Error('path should be string!');
}

