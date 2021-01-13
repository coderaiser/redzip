'use strict';

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
const sortify = require('@cloudcmd/sortify');
const formatify = require('@cloudcmd/formatify');

const yauzl = require('yauzl');

const open = promisify(yauzl.open);
const {dosDateTimeToDate} = yauzl;

const endSlashReg = /\/$/;
const addSlash = (a) => endSlashReg.test(a) ? a : `${a}${sep}`;
const ifRaw = (type, fn, a) => type === 'raw' ? a : fn(a);
const close = wraptile((a) => a.close());

const {assign} = Object;

// /home/coderaiser/hello.zip:/hello
module.exports = async (outerPath, innerPath, options) => {
    const {
        type,
        order,
        sort,
    } = options;
    
    const zipfile = await open(outerPath, {
        lazyEntries: true,
    });
    
    const inner = addSlash(innerPath);
    const names = [];
    
    const superOnce = once(events.once);
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
            const stream = await openReadStream(entry);
            
            assign(stream, {
                type: 'file',
            });
            
            stream.on('end', close(zipfile));
            
            return stream;
        }
        
        if (RegExp(`^${inner}?$`).test(dir)) {
            const type = isDir ? 'directory' : 'file';
            names.push({
                name,
                size: entry.uncompressedSize,
                date: dosDateTimeToDate(entry.lastModFileDate),
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
    
    const sorted = sortify({sort, order}, names);
    const files = ifRaw(type, formatify, sorted);
    
    return files;
};

