'use strict';

const {join, basename} = require('path');
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
    stat,
    opendir,
} = require('fs/promises');

const readify = require('readify');
const trammel = require('trammel');
const tryToCatch = require('try-to-catch');
const pipe = require('pipe-io');

const notDir = (e) => e?.code === 'ENOTDIR';

const {assign} = Object;

module.exports.write = async (outerPath, innerPath, readStream, options = {}) => {
    const {unzip, mode} = options;
    
    if (!readStream) {
        await mkdir(outerPath, {
            recursive: true,
            mode,
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
    const [error] = await tryToCatch(rmdir, outerPath);
    
    if (!error)
        return;
    
    if (notDir(error))
        return await unlink(outerPath);
    
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
        
        const {size} = await stat(newPath);
        
        assign(stream, {
            type: 'file',
            size,
        });
        
        return stream;
    }
    
    if (error)
        throw error;
    
    return result.files;
};

module.exports.list = async (outerPath) => {
    const names = [];
    const stats = [];
    
    for await (const name of await walk(outerPath)) {
        names.push(name);
        stats.push(stat(name));
    }
    
    const realStats = await Promise.all(stats);
    const n = realStats.length;
    const items = [];
    
    for (let i = 0; i < n; i++) {
        const name = names[i];
        const {
            size,
            mtime,
            mode,
        } = realStats[i];
        
        items.push([name, {
            name: basename(name),
            size,
            date: mtime,
            mode,
        }]);
    }
    
    return items;
};

async function* walk(dir) {
    for await (const dirent of await opendir(dir)) {
        const {name} = dirent;
        const path = join(dir, name);
        
        if (dirent.isDirectory()) {
            yield path;
            yield* await walk(path);
        } else
            yield path;
    }
}

