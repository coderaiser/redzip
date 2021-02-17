'use strict';

const redfs = require('../../redfs');

const buildIsDirectory = ({type}) => () => type === 'dir';
const {assign} = Object;

module.exports = async (path) => {
    const [vfs, outerPath, innerPath] = redfs(path);
    const stat = await vfs.readStat(outerPath, innerPath);
    
    assign(stat, {
        isDirectory: buildIsDirectory(stat),
    });
    
    return stat;
};

