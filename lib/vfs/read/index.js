'use strict';

const {Buffer} = require('node:buffer');
const {normalize} = require('node:path');
const {Readable} = require('node:stream');
const {addSlashToEnd} = require('format-io');

const _redfs = require('../../redfs');

const {assign} = Object;
const {stringify} = JSON;
const isString = (a) => typeof a === 'string';
const preparePath = (a, b) => normalize(addSlashToEnd(a).replace(b, '/'));

module.exports = async (path, options = {}) => {
    const {
        root = '/',
        order = 'asc',
        sort = 'name',
        type,
        redfs = _redfs,
        realpath,
    } = options;
    
    validate({
        path,
        type,
        sort,
        order,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    
    const content = await vfs.read(outerPath, innerPath, {
        type,
        sort,
        order,
        realpath,
    });
    
    const currentPath = preparePath(path, root);
    
    if (content.type === 'file')
        return content;
    
    const files = content;
    
    const str = stringify({
        path: currentPath,
        files,
    }, null, 4);
    
    const stream = Readable.from(str);
    
    assign(stream, {
        type: 'directory',
        path: currentPath,
        contentLength: Buffer.byteLength(str),
        files,
    });
    
    return stream;
};

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
