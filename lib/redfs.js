'use strict';

const {sep: _sep} = require('node:path');

const zip = require('./zip');
const local = require('./local');

module.exports = (path, overrides = {}) => {
    const {sep = _sep} = overrides;
    const [outerPath, innerPath] = split(path, {
        sep,
    });
    
    if (!innerPath)
        return [
            local,
            path,
            '',
        ];
    
    return [
        zip,
        outerPath,
        innerPath,
    ];
};

function split(path, {sep}) {
    const replaced = path.replace(`.zip${sep}`, `*${sep}`);
    let [outer, inner = ''] = replaced.split('*');
    
    inner = inner.replace(/\\/g, '/');
    
    return [
        `${outer}.zip`,
        inner || '',
    ];
}
