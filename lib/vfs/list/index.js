'use strict';

const _redfs = require('../../redfs');

module.exports = async (path, overrides = {}) => {
    const {redfs = _redfs} = overrides;
    const [vfs, outerPath, innerPath] = redfs(path);
    
    return await vfs.list(outerPath, innerPath);
};
