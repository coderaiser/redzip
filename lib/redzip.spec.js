import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import * as redzip from './redzip.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: read: directory', async (t) => {
    const {path} = await redzip.read('/bin', {
        root: '/',
    });
    
    const expected = '/bin/';
    
    t.equal(path, expected);
    t.end();
});

test('redzip: remove', async (t) => {
    const [error] = await tryToCatch(redzip.remove, 'xxx');
    
    t.match(error.message, `ENOENT: no such file or directory`);
    t.end();
});

test('redzip: list', async (t) => {
    const [error] = await tryToCatch(redzip.list, '/root');
    
    t.ok(error, error.message);
    t.end();
});

test('redzip: readStat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'read-stat');
    const result = await redzip.readStat(fixture);
    
    delete result.isDirectory;
    delete result.date;
    delete result.owner;
    
    const expected = {
        mode: 33_188,
        name: 'read-stat',
        size: 6,
        type: 'file',
    };
    
    t.deepEqual(result, expected);
    t.end();
});
