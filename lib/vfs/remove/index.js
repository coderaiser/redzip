'use strict';

const redfs = require('../../redfs');

const isString = (a) => typeof a === 'string';

module.exports = async (path) => {
    validate({
        path,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    
    await vfs.remove(outerPath, innerPath);
};

function validate({path}) {
    if (!isString(path))
        throw Error('path should be string!');
}

