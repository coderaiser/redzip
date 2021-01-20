'use strict';

const zip = require('./zip');
const local = require('./local');

module.exports = (path) => {
    const [outerPath, innerPath] = split(path);
    
    if (!innerPath)
        return [local, path, ''];
    
    return [zip, outerPath, innerPath];
};

function split(path) {
    const replaced = path.replace('.zip/', ':/');
    const [outer, inner] = replaced.split(':');
    
    return [
        `${outer}.zip`,
        inner || '',
    ];
}

