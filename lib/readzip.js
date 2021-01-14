'use strict';

const events = require('events');
const {promisify} = require('util');
const once = require('once');
const wraptile = require('wraptile');
const yauzl = require('yauzl');

const open = promisify(yauzl.open);
const close = wraptile((a) => a.close());
const isEndSlash = (a) => a[a.length - 1] === sep;

const {
    sep,
    basename,
    dirname,
    join,
} = require('path');

module.exports = async function*(outerPath) {
    const zipfile = await open(outerPath, {
        lazyEntries: true,
    });
    
    const superOnce = once(events.once);
    
    zipfile.readEntry();
    
    let [entry] = await Promise.race([
        events.once(zipfile, 'entry'),
        superOnce(zipfile, 'end'),
    ]);
    
    do {
        const path = new Path(entry, {
            zipfile,
        });
        
        yield path;
        
        if (path.isStop())
            return;
        
        zipfile.readEntry();
        
        [entry] = await Promise.race([
            events.once(zipfile, 'entry'),
            superOnce(zipfile, 'end'),
        ]);
    } while(entry);
};

class Path {
    constructor(entry, {zipfile}) {
        const {fileName} = entry;
        const name = basename(fileName);
        
        this._isStop = false;
        this._openReadStream = promisify(zipfile.openReadStream.bind(zipfile));
        this._zipfile = zipfile;
        this._isDirectory = isEndSlash(fileName);
        
        this.entry = entry;
        this.filePath = join(sep, fileName);
        this.fileName = name;
        this.directory = join(sep, dirname(fileName), sep);
    }
    
    isFile(path) {
        if (this._isDirectory)
            return false;
        
        return !path || path === this.filePath;
    }
    
    isDirectory(path) {
        if (!this._isDirectory)
            return false;
        
        return !path || path === this.filePath;
    }
    
    async openReadStream() {
        this._stream = await this._openReadStream(this.entry);
        return this._stream;
    }
    
    stop() {
        this._stream?.on('end', close(this._zipfile));
        this._isStop = true;
    }
    
    isStop() {
        return this._isStop;
    }
}

