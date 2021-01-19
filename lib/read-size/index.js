'use strict';

const {Readable} = require('stream');

const trammel = require('trammel');

const readZipSize = require('./read-zip-size');
const split = require('../split');

module.exports = async (path, options = {}) => {
    const {type} = options;
    
    validate({
        type,
    });
    
    let size = 0;
    const [outerPath, innerPath] = split(path);
    
    if (innerPath)
        size = await readZipSize(outerPath, innerPath, options);
    else
        size = await trammel(path, options);
    
    return Readable.from(String(size));
};

function validate({type}) {
    if (type && type !== 'raw')
        throw Error('type should be "raw" or not to be defined!');
}
