import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import readStat from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: zip: read-stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(fixture, '/nested');
    
    delete result.date;
    delete result.owner;
    
    const expected = {
        mode: 438,
        name: 'nested',
        size: 0,
        type: 'dir',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: read-stat: not found', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const [error] = await tryToCatch(readStat, fixture, '/nested/words/not-found');
    
    t.ok(error);
    t.end();
});

test('redzip: zip: read-stat: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(fixture, '/nested/readme.md');
    
    delete result.date;
    delete result.owner;
    
    const expected = {
        mode: 438,
        name: 'readme.md',
        size: 15,
        type: 'file',
    };
    
    t.deepEqual(result, expected);
    t.end();
});
