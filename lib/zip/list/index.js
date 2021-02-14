'use strict';

const {join} = require('path');
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
        
        if (path.isFile(innerPath))
            return [join(outerPath, innerPath), {
                name,
                size,
                date,
                mode,
            }];
        
        if (!directory.includes(rootDir))
            continue;
        
        paths.push([join(outerPath, filePath), {
            name,
            size,
            date,
            mode,
        }]);
    }
    
    return paths;
};

