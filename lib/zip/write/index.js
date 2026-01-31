import {once} from 'node:events';
import {promisify} from 'node:util';
import {posix} from 'node:path';
import {createWriteStream} from 'node:fs';
import {createGunzip} from 'node:zlib';
import {
    rename as _rename,
    unlink,
} from 'node:fs/promises';
import yazl from 'yazl';
import pipe from 'pipe-io';
import {tryToCatch} from 'try-to-catch';
import readzip from 'readzip';

const {join, dirname} = posix;

const {round, random} = Math;

const getRandom = () => String(round(random() * 10));
const end = promisify((zipfile, fn) => {
    zipfile.end((/* ignore args */) => {
        fn();
    });
});

export default async (outerPath, innerPath, stream, options = {}) => {
    const {
        rename = _rename,
        unzip,
        remove,
    } = options;
    
    const tmpName = join(dirname(outerPath), `.redzip-${getRandom()}.zip`);
    
    const zipfile = new yazl.ZipFile();
    const {outputStream} = zipfile;
    
    let readStream;
    
    if (stream)
        readStream = !unzip ? stream : stream.pipe(createGunzip());
    
    const createArchive = Promise.all([
        update(outerPath, innerPath, readStream, zipfile, {
            remove,
        }),
        replace(outerPath, tmpName, outputStream, {
            rename,
        }),
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
    
    if (remove && count === 1)
        throw Error(`Can't remove latest entry`);
    
    await end(zipfile);
}

async function replace(outerPath, name, stream, {rename}) {
    const writeStream = createWriteStream(name);
    
    await pipe([stream, writeStream]);
    
    const [error] = await tryToCatch(rename, name, outerPath);
    
    if (error) {
        await unlink(name);
        throw error;
    }
}
