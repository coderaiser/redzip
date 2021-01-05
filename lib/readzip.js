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
const sortify = require('@cloudcmd/sortify');
const formatify = require('@cloudcmd/formatify');

const yauzl = require('yauzl');
const tryToCatch = require('try-to-catch');

const open = promisify(yauzl.open);
const {dosDateTimeToDate} = yauzl;

const superOnce = once(events.once);

const endSlashReg = /\/$/;
const addSlash = (a) => endSlashReg.test(a) ? a : `${a}${sep}`;
const {stringify} = JSON;
const ifRaw = (type, fn, a) => type === 'raw' ? a : fn(a);
const close = wraptile((a) => a.close());
const isString = (a) => typeof a === 'string';

const {assign} = Object;

// /home/coderaiser/hello.zip:/hello
module.exports = async (path, options = {}) => {
    const {
        type,
        order = 'asc',
        sort = 'name',
    } = options;
    
    const validationError = validate({path, type, sort, order});
    
    if (validationError)
        return [validationError];
    
    const [outerPath, innerPath] = path.split(':');
    const [error, zipfile] = await tryToCatch(open, outerPath, {
        lazyEntries: true,
    });
    
    if (error)
        return [error];
    
    const inner = addSlash(innerPath);
    const names = [];
    
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
    const formated = ifRaw(type, formatify, sorted);
    
    const stream = Readable.from(stringify(formated, null, 4));
    
    assign(stream, {
        type: 'directory',
    });
    
    return [null, stream];
};

function validate({path, type, sort, order}) {
    if (!isString(path))
        return Error('path should be string!');
    
    if (!path.includes(':'))
        return Error('path should conaint ":" separatar beetween paths');
    
    if (type && !isString(type))
        return Error('type should be a string or not to be defined!');
    
    if (sort && !isString(sort))
        return Error('sort should be a string!');
    
    if (order && !/^(asc|desc)$/.test(order))
        return Error('order can be "asc" or "desc" only!');
    
    return null;
}

