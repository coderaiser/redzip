'use strict';

const {promisify} = require('es6-promisify');
const squad = require('squad/legacy');
const currify = require('currify/legacy');
const tryToCatch = require('try-to-catch/legacy');
const stringToStream = require('string-to-stream');

const dropboxify = promisify(require('dropboxify'));
const {
    createDropboxDownloadStream,
} = require('dropbox-stream');

const good = currify((fn, a) => fn(null, a));
const stringify = (json) => JSON.stringify(json, null, 4)
const streamJson = squad(stringToStream, stringify);

module.exports = (token, path, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    check(token, path, fn);
    read(token, path, options)
        .then(good(fn))
        .catch(fn)
};

async function read(token, path, options) {
    const [error, list] = await tryToCatch(dropboxify, token, path, options);
    
    if (!error)
        return streamJson(list);
    
    if (error.message.indexOf('path/not_folder/'))
        throw error;
    
    return createDropboxDownloadStream({
        token,
        filepath: path,
    });
}

function check(token, path, fn) {
    if (typeof token !== 'string')
        throw Error('token should be a string!');
    
    if (typeof path !== 'string')
        throw Error('path should be a string!');
    
    if (typeof fn !== 'function')
        throw Error('fn should be a function!');
}

