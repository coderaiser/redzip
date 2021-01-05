'use strict';

const {Readable} = require('stream');

const {
    sep,
    basename,
    dirname,
    join,
} = require('path');
const events = require('events');
const {promisify} = require('util');
const once = require('once');
const wraptile = require('wraptile');

const yauzl = require('yauzl');
const tryToCatch = require('try-to-catch');

const open = promisify(yauzl.open);

const superOnce = once(events.once);

const endSlashReg = /\/$/;
const addSlash = (a) => endSlashReg.test(a) ? a : `${a}${sep}`;
const {stringify} = JSON;

const close = wraptile((a) => a.close());

const {assign} = Object;

// /home/coderaiser/hello.zip:/hello
module.exports = async (path) => {
    const [isValid, validationError] = validate(path);
    
    if (!isValid)
        return [validationError];
    
    const [outerPath, innerPath] = path.split(':');
    const [error, zipfile] = await tryToCatch(open, outerPath, {
        lazyEntries: true,
    });
    
    if (error)
        return [error];
    
    const inner = addSlash(innerPath);
    const list = [];
    
    const openReadStream = promisify(zipfile.openReadStream.bind(zipfile));
    zipfile.readEntry();
    
    let [entry] = await Promise.race([
        events.once(zipfile, 'entry'),
        superOnce(zipfile, 'end'),
    ]);
    
    do {
        const {fileName} = entry;
        const name = basename(fileName);
        const dir = join(sep, dirname(fileName));
        const fullName = join(sep, fileName);
        const isDir = endSlashReg.test(fileName);
        
        if (!isDir && fullName === innerPath) {
            const [error, stream] = await tryToCatch(openReadStream, entry);
            
            assign(stream, {
                type: 'file',
            });
            
            stream.on('end', close(zipfile));
            
            return [error, stream];
        }
        
        if (RegExp(`^${inner}?$`).test(dir)) {
            const type = isDir ? 'directory' : 'file';
            list.push({
                name,
                size: entry.uncompressedSize,
                date: entry.lastModFileDate,
                owner: 'root',
                mode: entry.externalFileAttributes,
                type,
            });
        }
        
        zipfile.readEntry();
        
        [entry] = await Promise.race([
            events.once(zipfile, 'entry'),
            superOnce(zipfile, 'end'),
        ]);
    } while(entry);
    
    const stream = Readable.from(stringify(list, null, 4));
    
    assign(stream, {
        type: 'directory',
    });
    
    return [null, stream];
};

const VALID = true;
const INVALID = false;

function validate(path) {
    if (typeof path !== 'string')
        return [INVALID, Error('path should be string!')];
    
    /*
    if (!path.includes(':'))
        return [INVALID, Error('path should conaint ":" separatar beetween paths')];
        */
    
    return [VALID];
}

