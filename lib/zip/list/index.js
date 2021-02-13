'use strict';

const readzip = require('readzip');
const addSlash = (a) => a[a.length - 1] === '/' ? a : `${a}/`;

module.exports = async (outerPath, innerPath) => {
    const paths = [];
    const rootDir = addSlash(innerPath);
    
    for await (const path of readzip(outerPath)) {
        const {
            filePath,
            name,
            size,
            date,
            mode,
            directory,
        } = path;
        
        if (!directory.includes(rootDir))
            continue;
        
        paths.push([filePath, {
            name,
            size,
            date,
            mode,
        }]);
    }
    
    return paths;
};

