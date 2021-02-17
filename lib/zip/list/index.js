'use strict';

const {join} = require('path');
const readzip = require('readzip');

const addSlash = (a) => a[a.length - 1] === '/' ? a : `${a}/`;

module.exports = async (outerPath, innerPath) => {
    const paths = [];
    const rootDir = addSlash(innerPath);
    
    for await (const path of readzip(outerPath)) {
        const {
            directory,
            filePath,
        } = path;
        
        if (path.isFile(innerPath))
            return [join(outerPath, filePath)];
        
        if (!directory.includes(rootDir))
            continue;
        
        paths.push(join(outerPath, filePath));
    }
    
    return paths;
};

