'use strict';

const {once} = require('events');
const {
    createReadStream,
    createWriteStream,
} = require('fs');

const {createGunzip} = require('zlib');
const {
    realpath,
    mkdir,
    rmdir,
    unlink,
} = require('fs/promises');

const readify = require('readify');
const trammel = require('trammel');
const tryToCatch = require('try-to-catch');
const pipe = require('pipe-io');

const notDir = (e) => e?.code === 'ENOTDIR';

const {assign} = Object;

module.exports.write = async (outerPath, innerPath, readStream, options = {}) => {
    const {unzip} = options;
    
    if (!readStream) {
        await mkdir(outerPath, {
            recursive: true,
        });
        return;
    }
    
    const writeStream = createWriteStream(outerPath);
    
    if (unzip)
        return await pipe([
            readStream,
            createGunzip(),
            writeStream,
        ]);
    
    await pipe([
        readStream,
        writeStream,
    ]);
};

module.exports.readSize = async (outerPath, innerPath, options) => {
    return await trammel(outerPath, options);
};

module.exports.remove = async (outerPath) => {
    const [error] = await tryToCatch(unlink, outerPath);
    
    if (!error)
        return;
    
    if (error.code === 'EISDIR')
        return await rmdir(outerPath);
    
    throw error;
};

module.exports.read = async (path, innerPath, {type, sort, order} = {}) => {
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
        
        await once(stream, 'open');
        
        return stream;
    }
    
    if (error)
        throw error;
    
    return result.files;
};

