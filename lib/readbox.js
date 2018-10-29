'use strict';

const squad = require('squad');
const tryToCatch = require('try-to-catch');
const stringToStream = require('string-to-stream');

const dropboxify = require('dropboxify');
const {
    createDropboxDownloadStream,
} = require('dropbox-stream');

const stringify = (json) => JSON.stringify(json, null, 4)
const streamJson = squad(stringToStream, stringify);

module.exports = async (token, path, options = {}) => {
    check(token, path);
    return read(token, path, options)
};

async function read(token, filepath, options) {
    const [error, list] = await tryToCatch(dropboxify, token, filepath, options);
    
    if (!error)
        return streamJson(list);
    
    if (error.message.indexOf('path/not_folder/'))
        throw error;
    
    return createDropboxDownloadStream({
        token,
        filepath,
    });
}

function check(token, path) {
    if (typeof token !== 'string')
        throw Error('token should be a string!');
    
    if (typeof path !== 'string')
        throw Error('path should be a string!');
}

