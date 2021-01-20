'use strict';

const {Readable} = require('stream');
const redfs = require('../../redfs');

module.exports = async (path, options = {}) => {
    const {type} = options;
    
    validate({
        type,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    const size = await vfs.readSize(outerPath, innerPath, options);
    
    return Readable.from(String(size));
};

function validate({type}) {
    if (type && type !== 'raw')
        throw Error('type should be "raw" or not to be defined!');
}

