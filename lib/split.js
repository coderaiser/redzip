'use strict';

const {extname} = require('path');

module.exports = (path, ext) => {
    const names = path.split('/');
    
    const inner = [];
    const outer = [];
    
    let array = outer;
    
    for (const name of names) {
        array.push(name);
        
        if (extname(name) === ext) {
            array = inner;
            continue;
        }
    }
    
    return [
        outer.join('/'),
        `/${inner.join('/')}`,
    ];
};

