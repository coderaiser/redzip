'use strict';

const {Readable} = require('stream');
const redfs = require('../../redfs');

const {assign} = Object;

module.exports = async (path, options = {}) => {
    const {type} = options;
    
    validate({
        type,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    const size = await vfs.readSize(outerPath, innerPath, options);
    const str = String(size);
    const contentLength = Buffer.byteLength(str);
    const stream = Readable.from(str);
    
    assign(stream, {
        contentLength,
    });
    
    return stream;
};

function validate({type}) {
    if (type && type !== 'raw')
        throw Error('type should be "raw" or not to be defined!');
}
