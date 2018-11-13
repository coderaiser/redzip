'use strict';

const squad = require('squad');
const tryToCatch = require('try-to-catch');
const stringToStream = require('string-to-stream');

const dropboxify = require('dropboxify');

const {createReadStream} = require('@cloudcmd/dropbox');

const stringify = (json) => JSON.stringify(json, null, 4)
const streamJson = squad(stringToStream, stringify);

const {assign} = Object;

module.exports = async (token, path, options = {}) => {
    check(token, path);
    return read(token, path, options)
};

async function read(token, filepath, options) {
    const {
        sort,
        order,
        type,
        root = '',
    } = options;
    
    const [error, list] = await tryToCatch(dropboxify, token, filepath, {
        sort,
        order,
        type,
    });
    
    if (!error) {
        const path = list.path.replace(root, '');
        const stream = streamJson({
            ...list,
            path,
        });
        
        assign(stream, {
            type: 'directory',
        });
        
        return stream;
    }
    
    if (error.message.indexOf('path/not_folder/'))
        throw error;
     
    const stream = createReadStream(token, filepath);
    
    assign(stream, {
        type: 'file',
    });
    
    return stream;
}

function check(token, path) {
    if (typeof token !== 'string')
        throw Error('token should be a string!');
    
    if (typeof path !== 'string')
        throw Error('path should be a string!');
}

