import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {list} from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: zip: list', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const result = await list(fixture, '/');
    
    const expected = [
        join(fixture, '/words/hello.txt'),
        join(fixture, '/words/world.txt'),
        join(fixture, '/words/'),
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('redzip: zip: list: stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/words', {
        stat: true,
    });
    
    const expected = [
        join(fixture, '/words/hello.txt'),
        join(fixture, '/words/world.txt'),
    ];
    
    t.deepEqual(names, expected);
    t.end();
});

test('redzip: zip: list: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const names = await list(fixture, '/words/hello.txt', {
        stat: true,
    });
    
    const expected = [
        join(fixture, '/words/hello.txt'),
    ];
    
    t.deepEqual(names, expected);
    t.end();
});
