'use strict';

const redfs = require('../../redfs');

module.exports = async (path) => {
    const [vfs, outerPath, innerPath] = redfs(path);
    return await vfs.list(outerPath, innerPath);
};

