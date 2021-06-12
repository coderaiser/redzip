'use strict';

const {join, basename, dirname} = require('path');
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
    lstat,
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
    
     await mkdir(dirname(outerPath), {
        recursive: true,
     });
    
    const writeStream = createWriteStream(outerPath, {
        mode,
    });
    
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
        
        const {size} = await lstat(newPath);
        
        assign(stream, {
            type: 'file',
            contentLength: size,
        });
        
        return stream;
    }
    
    if (error)
        throw error;
    
    return result.files;
};

module.exports.list = async (outerPath) => {
    const [error, names] = await tryToCatch(list, outerPath);
    
    if (error && error.code === 'ENOTDIR') {
        return [
            outerPath,
        ];
    }
    
    if (error)
        throw error;
    
    return names;
};

async function list(outerPath) {
    const names = [];
    
    for await (const name of await walk(outerPath)) {
        names.push(name);
    }
    
    return names;
}

module.exports.readStat = async (outerPath) => {
    const statResult = await lstat(outerPath);
    const {
        mtime,
        mode,
        uid,
    } = statResult;
    
    const type = statResult.isDirectory() ? 'dir' : 'file';
    const size = statResult.isDirectory() ? 0 : statResult.size;
    
    return {
        type,
        name: basename(outerPath),
        size,
        date: mtime,
        owner: uid,
        mode,
    };
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

