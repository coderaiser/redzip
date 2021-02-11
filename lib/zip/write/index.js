'use strict';

const {once} = require('events');
const {promisify} = require('util');
const {join, dirname} = require('path').posix;
const {createWriteStream} = require('fs');
const {createGunzip} = require('zlib');
const {
    rename,
    unlink,
} = require('fs/promises');

const yazl = require('yazl');
const pipe = require('pipe-io');
const tryToCatch = require('try-to-catch');
const readzip = require('readzip');

const {round, random} = Math;

const getRandom = () => String(round(random() * 10));
const end = promisify((zipfile, fn) => {
    zipfile.end((/* ignore args */) => {
        fn();
    });
});

module.exports = async (outerPath, innerPath, stream, options = {}) => {
    const tmpName = join(dirname(outerPath), `.redzip-${getRandom()}.zip`);
    
    const zipfile = new yazl.ZipFile();
    const {outputStream} = zipfile;
    const {unzip, remove} = options;
    
    let readStream;
    
    if (stream)
        readStream = !unzip ? stream : stream.pipe(createGunzip());
    
    const createArchive = Promise.all([
        update(outerPath, innerPath, readStream, zipfile, {
            remove,
        }),
        
        replace(outerPath, tmpName, outputStream),
    ]);
    
    if (!readStream) {
        await createArchive;
        return;
    }
    
    const [error] = await Promise.race([
        once(readStream, 'error'),
        createArchive,
    ]);
    
    if (error) {
        await unlink(tmpName);
        throw error;
    }
};

async function update(outerPath, innerPath, stream, zipfile, {remove}) {
    const shortPath = innerPath.slice(1);
    
    if (!remove && stream)
        zipfile.addReadStream(stream, shortPath);
    
    if (!remove && !stream)
        zipfile.addEmptyDirectory(shortPath);
    
    let count = 0;
    
    for await (const path of readzip(outerPath)) {
        const {entry} = path;
        ++count;
        
        if (path.isFile(innerPath) || path.isDirectory(innerPath)) {
            continue;
        }
        
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
    
    if (remove && count === 1)
        throw Error(`Can't remove latest entry`);
    
    await end(zipfile);
}

async function replace(outerPath, name, stream) {
    const writeStream = createWriteStream(name);
    
    await pipe([
        stream,
        writeStream,
    ]);
    
    const [error] = await tryToCatch(rename, name, outerPath);
    
    if (error) {
        await unlink(name);
        throw error;
    }
}

