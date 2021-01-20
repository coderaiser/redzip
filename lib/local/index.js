'use strict';

const {createReadStream} = require('fs');
const {realpath} = require('fs/promises');

const readify = require('readify');
const trammel = require('trammel');
const tryToCatch = require('try-to-catch');

const notDir = (e) => e?.code === 'ENOTDIR';

const {assign} = Object;

module.exports.readSize = async (innerPath, outerPath, options) => {
    return await trammel(innerPath, options);
};

module.exports.read = async (path, innerPath, {type, sort, order}) => {
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
};

