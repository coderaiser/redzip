'use strict';

const {promisify} = require('util');
const {join} = require('path').posix;
const {tmpdir} = require('os');
const {createWriteStream} = require('fs');
const {
    rename,
    copyFile,
    unlink,
} = require('fs/promises');

const yazl = require('yazl');
const pipe = require('pipe-io');
const tryToCatch = require('try-to-catch');
const readzip = require('../readzip');

const {round, random} = Math;

const isDir = (a) => a[a.length - 1] === '/';
const getRandom = () => String(round(random() * 10));
const end = promisify((zipfile, fn) => {
    zipfile.end((/* ignore args */) => {
        fn();
    });
});

module.exports = async (outerPath, innerPath, stream) => {
    const zipfile = new yazl.ZipFile();
    const {outputStream} = zipfile;
    
    await Promise.all([
        update(outerPath, innerPath, stream, zipfile),
        replace(outerPath, outputStream),
    ]);
};

async function update(outerPath, innerPath, stream, zipfile) {
    const shortPath = innerPath.slice(1);
    
    if (stream)
        zipfile.addReadStream(stream, shortPath);
    
    if (isDir(innerPath))
        zipfile.addEmptyDirectory(shortPath);
    
    for await (const path of readzip(outerPath)) {
        const {entry} = path;
        
        if (path.isFile(innerPath) || path.isDirectory(innerPath))
            continue;
        
        if (path.isFile()) {
            stream = await path.openReadStream();
            zipfile.addReadStream(stream, entry.fileName);
            continue;
        }
        
        // istanbul ignore next
        if (path.isDirectory()) {
            zipfile.addEmptyDirectory(entry.fileName);
            continue;
        }
    }
    
    await end(zipfile);
}

async function replace(outerPath, stream) {
    const name = join(String(tmpdir()), `redzip-${getRandom()}.zip`);
    const writeStream = createWriteStream(name);
    
    await pipe([
        stream,
        writeStream,
    ]);
    
    const [error] = await tryToCatch(rename, name, outerPath);
    
    if (!error) {
        await unlink(name);
        return;
    }
    
    if (error.code !== 'EXDEV') {
        await unlink(name);
        throw error;
    }
    
    await copyFile(name, outerPath);
    await unlink(name);
}

