import {
    join,
    basename,
    dirname,
} from 'node:path';
import {
    createReadStream as _createReadStream,
    createWriteStream,
} from 'node:fs';
import {createGunzip} from 'node:zlib';
import {
    realpath as _realpath,
    mkdir,
    rmdir as _rmdir,
    unlink as _unlink,
    lstat,
    opendir,
    utimes,
} from 'node:fs/promises';
import readify from 'readify';
import trammel from 'trammel';
import {tryToCatch} from 'try-to-catch';
import pipe from 'pipe-io';

const notDir = (e) => e?.code === 'ENOTDIR';
const winNotDir = (e) => e?.code === 'ENOENT';

const {assign} = Object;

export const write = async (outerPath, innerPath, readStream, options = {}) => {
    const {
        unzip,
        mode,
        date,
    } = options;
    
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
        return await pipe([readStream, createGunzip(), writeStream]);
    
    await pipe([readStream, writeStream]);
    
    if (date)
        await utimes(outerPath, date, date);
};

export const readSize = async (outerPath, innerPath, options) => {
    return await trammel(outerPath, options);
};

export const remove = async (outerPath, overrides = {}) => {
    const {
        rmdir = _rmdir,
        unlink = _unlink,
    } = overrides;
    
    const [error] = await tryToCatch(rmdir, outerPath);
    
    if (!error)
        return;
    
    if (notDir(error) || winNotDir(error))
        return await unlink(outerPath);
    
    throw error;
};

export const read = async (path, innerPath, overrides = {}) => {
    const {
        type,
        sort,
        order,
        createReadStream = _createReadStream,
        realpath = _realpath,
    } = overrides;
    
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

export const list = async (outerPath) => {
    const [error, names] = await tryToCatch(listAll, outerPath);
    
    if (notDir(error))
        return [outerPath];
    
    if (error)
        throw error;
    
    return names;
};

async function listAll(outerPath) {
    const names = [];
    
    for await (const name of await walk(outerPath)) {
        names.push(name);
    }
    
    return names;
}

export const readStat = async (outerPath) => {
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
        } else {
            yield path;
        }
    }
}
