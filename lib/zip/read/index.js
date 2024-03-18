'use strict';

const {sep} = require('path').posix;

const sortify = require('@cloudcmd/sortify');
const formatify = require('@cloudcmd/formatify');
const readzip = require('readzip');

const ifRaw = (type, fn, a) => type === 'raw' ? a : fn(a);
const isEndSlash = (a) => a.at(-1) === sep;
const addSlash = (a) => isEndSlash(a) ? a : `${a}${sep}`;

const {assign} = Object;

module.exports = async (outerPath, innerPath, options = {}) => {
    const inner = addSlash(innerPath);
    const {
        type,
        order,
        sort,
    } = options;
    
    const names = [];
    
    let stream;
    let found = inner === '/';
    const owner = 'root';
    
    for await (const path of readzip(outerPath)) {
        const {
            name,
            size,
            date,
            mode,
            directory,
        } = path;
        
        if (path.isFile(innerPath)) {
            found = true;
            stream = await path.openReadStream();
            
            assign(stream, {
                type: 'file',
                contentLength: size,
            });
            
            path.stop();
        }
        
        if (path.isDirectory(inner))
            found = true;
        
        if (directory === inner) {
            const type = path.isDirectory() ? 'directory' : 'file';
            
            names.push({
                name,
                size,
                date,
                mode,
                type,
                owner,
            });
        }
    }
    
    if (!found)
        throw createError(innerPath);
    
    if (stream)
        return stream;
    
    const sorted = sortify({sort, order}, names);
    
    return ifRaw(type, formatify, sorted);
};

function createError(path) {
    const error = Error(`ENOENT: no such file or directory, open '${path}'`);
    
    assign(error, {
        code: 'ENOENT',
        path,
    });
    
    return error;
}
