'use strict';

const {promisify} = require('util');
const test = require('tape');
const currify = require('currify');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const squad = require('squad');
const stringToStream = require('string-to-stream');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');

const read = require('..');

const {reRequire} = require('mock-require');

const swap = currify((fn, a, b) => fn(b, a));
const swapPromisify = squad(swap, promisify, require);
const pullout_ = swapPromisify('pullout');

const stringify = (json) => JSON.stringify(json, null, 4);

test('dropbox: no args', async (t) => {
    const [e] = await tryToCatch(read);
    
    t.equal(e.message, 'token should be a string!', 'should throw when no token');
    t.end();
});

test('dropbox: no path', async (t) => {
    const [e] = await tryToCatch(read, 'token');
    
    t.equal(e.message, 'path should be a string!', 'should throw when no path');
    t.end();
});

test('dropbox: read: error', async (t) => {
    const token = 'token';
    const path = '/';
    const error = Error('hello');
    const options = {};
    
    const createDropboxDownloadStream = sinon.stub();
    const dropboxify = async () => {
        throw error
    };
    
    mockRequire('dropboxify', dropboxify);
    mockRequire('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const read = reRequire('..');
    
    const [e] = await tryToCatch(read, token, path, options);
    t.equal(e, error, 'should return error');
    t.end();
});

test('dropbox: read: not dir', (t) => {
    const token = 'token';
    const path = '/';
    const file = 'hello';
    
    const createDropboxDownloadStream = sinon
        .stub()
        .returns(stringToStream(file));
    
    const dropboxify = async () => {
        throw Error('path/not_folder/');
    };
    
    mockRequire('dropboxify', dropboxify);
    mockRequire('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const read = reRequire('..');
    const equal = currify((a, b) => {
        t.equal(a, b, 'should equal');
    });
    
    read(token, path)
        .then(pullout_('string'))
        .then(equal(file))
        .catch(t.fail)
        .then(t.end)
});

test('dropbox: read: result', (t) => {
    const token = 'token';
    const path = '/';
    const list = {
        hello: 'world'
    };
    
    const expected = stringify(list);
    
    const createDropboxDownloadStream = sinon
        .stub()
    
    const dropboxify = async () => {
        return list;
    };
    
    mockRequire('dropboxify', dropboxify);
    mockRequire('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const read = reRequire('..');
    
    const equal = currify((a, b) => {
        t.equal(a, b, 'should equal');
    });
    
    read(token, path)
        .then(pullout_('string'))
        .then(equal(expected))
        .catch(t.fail)
        .then(t.end)
});

