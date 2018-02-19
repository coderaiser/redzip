'use strict';

const test = require('tape');
const read = require('..');
const currify = require('currify');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const {promisify} = require('es6-promisify');
const squad = require('squad');
const stringToStream = require('string-to-stream');

const clean = require('clear-module');
const stub = require('mock-require');

const swap = currify((fn, a, b) => fn(b, a));
const swapPromisify = squad(swap, promisify, require);
const pullout_ = swapPromisify('pullout');

const stringify = (json) => JSON.stringify(json, null, 4);

test('dropbox: no args', (t) => {
    t.throws(read, /token should be a string!/, 'should throw when no token');
    t.end();
});

test('dropbox: no path', (t) => {
    const fn = () => read('token');
    
    t.throws(fn, /path should be a string!/, 'should throw when no path');
    t.end();
});

test('dropbox: no fn', (t) => {
    const fn = () => read('token', '/hello');
    
    t.throws(fn, /fn should be a function!/, 'should throw when no path');
    t.end();
});

test('dropbox: read: error', (t) => {
    const token = 'token';
    const path = '/';
    const error = Error('hello');
    const options = {};
    
    const createDropboxDownloadStream = sinon.stub();
    const dropboxify = (token, path, options, fn) => {
        fn(error);
    };
    
    clean('..');
    
    stub('dropboxify', dropboxify);
    stub('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const read = require('..');
    
    read(token, path, options, (e) => {
        t.equal(e, error, 'should return error');
        t.end();
    });
});

test('dropbox: read: not dir', (t) => {
    const token = 'token';
    const path = '/';
    const file = 'hello';
    
    const createDropboxDownloadStream = sinon
        .stub()
        .returns(stringToStream(file));
    
    const dropboxify = (token, path, options, fn) => {
        fn(Error('path/not_folder/'));
    };
    
    clean('..');
    
    stub('dropboxify', dropboxify);
    stub('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const read = promisify(require('..'));
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
    
    const dropboxify = (token, path, options, fn) => {
        fn(null, list);
    };
    
    clean('..');
    
    stub('dropboxify', dropboxify);
    stub('dropbox-stream', {
        createDropboxDownloadStream
    });
    
    const read = promisify(require('..'));
    
    const equal = currify((a, b) => {
        t.equal(a, b, 'should equal');
    });
    
    read(token, path)
        .then(pullout_('string'))
        .then(equal(expected))
        .catch(t.fail)
        .then(t.end)
});

