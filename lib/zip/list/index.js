'use strict';

const readzip = require('readzip');

module.exports = async (outerPath) => {
    const paths = [];
    
    for await (const path of readzip(outerPath)) {
        const {filePath} = path;
        
        paths.push(filePath);
    }
    
    return paths;
};

