'use strict';

const format = require('format-io');

const readzip = require('../readzip');
const split = require('../split');

module.exports = async (path, options = {}) => {
    const {type} = options;
    const [outerPath, innerPath] = split(path);
    
    let sum = 0;
    for await (const path of readzip(outerPath)) {
        const {
            size,
            filePath,
        } = path;
        
        if (path.isFile() && !filePath.indexOf(innerPath))
            sum += size;
    }
    
    if (type === 'raw')
        return sum;
    
    return format.size(sum);
};

