'use strict';

const {sep} = require('path');

const zip = require('./zip');
const local = require('./local');

module.exports = (path) => {
    const [outerPath, innerPath] = split(path);
    
    if (!innerPath)
        return [local, path, ''];
    
    return [zip, outerPath, innerPath];
};

function split(path) {
    const replaced = path.replace(`.zip${sep}`, `*${sep}`);
    let [outer, inner = ''] = replaced.split('*');
    inner = inner.replace(/\\/g, '/');
    
    return [
        `${outer}.zip`,
        inner || '',
    ];
}

