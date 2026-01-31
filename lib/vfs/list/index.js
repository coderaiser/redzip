import _redfs from '../../redfs.js';

export const list = async (path, overrides = {}) => {
    const {redfs = _redfs} = overrides;
    const [vfs, outerPath, innerPath] = redfs(path);
    
    return await vfs.list(outerPath, innerPath);
};
