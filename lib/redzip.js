'use strict';

const {Readable} = require('stream');
const {createReadStream} = require('fs');
const {realpath} = require('fs/promises');

const readify = require('readify');
const tryToCatch = require('try-to-catch');
const {addSlashToEnd} = require('format-io');

const readZip = require('./readzip');
const split = require('./split');

const notDir = (e) => e?.code === 'ENOTDIR';

const {assign} = Object;
const {stringify} = JSON;
const isString = (a) => typeof a === 'string';

module.exports.read = async (path, options = {}) => {
    const {
        root = '/',
        order = 'asc',
        sort = 'name',
        type,
    } = options;
    
    validate({
        path,
        type,
        sort,
        order,
    });
    
    const [outerPath, innerPath] = split(path);
    
    let stream;
    
    if (innerPath)
        stream = await readZip(outerPath, innerPath, {
            type,
            sort,
            order,
        });
    else
        stream = await readLocal(path, {
            type,
            sort,
            order,
        });
    
    const currentPath = addSlashToEnd(path.replace(root, ''));
    
    if (stream.type === 'file')
        return stream;
    
    const files = stream;
    const str = stringify({
        path: currentPath,
        files,
    }, null, 4);
    
    stream = Readable.from(str);
    
    assign(stream, {
        type: 'directory',
        path: currentPath,
        files,
    });
    
    return stream;
};

async function readLocal(path, {type, sort, order}) {
    const [error, result] = await tryToCatch(readify, path, {
        type,
        sort,
        order,
    });
    
    if (notDir(error)) {
        const [realPathError, pathReal] = await tryToCatch(realpath, path);
        const newPath = realPathError ? path : pathReal;
        const stream = createReadStream(newPath);
        
        assign(stream, {
            type: 'file',
        });
        
        return stream;
    }
    
    if (error)
        throw error;
    
    return result.files;
}

function validate({path, type, sort, order}) {
    if (!isString(path))
        throw Error('path should be string!');
    
    if (type && !isString(type))
        throw Error('type should be a string or not to be defined!');
    
    if (sort && !isString(sort))
        throw Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        throw Error('order can be "asc" or "desc" only!');
}
