import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import pullout from 'pullout';
import {tryToCatch} from 'try-to-catch';
import {readSize} from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: read-size', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const stream = await readSize(`${fixture}/`);
    const size = await pullout(stream);
    
    t.equal(size, '12b', '"hello" and "world" with line endings');
    t.end();
});

test('redzip: read-size: nested', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(`${fixture}/nested/words`);
    const size = await pullout(stream);
    
    t.equal(size, '12b', '"hello" and "world" with line endings');
    t.end();
});

test('redzip: read-size: file', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(`${fixture}/nested/readme.md`);
    const size = await pullout(stream);
    
    t.equal(size, '15b');
    t.end();
});

test('redzip: read-size: file: raw', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(`${fixture}/nested/readme.md`, {
        type: 'raw',
    });
    
    const size = await pullout(stream);
    
    t.equal(size, '15');
    t.end();
});

test('redzip: read-size: wrong type', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const [error] = await tryToCatch(readSize, `${fixture}/nested/readme.md`, {
        type: 'hello',
    });
    
    t.equal(error.message, 'type should be "raw" or not to be defined!');
    t.end();
});

test('redzip: read-size: local', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const stream = await readSize(fixture);
    const size = await pullout(stream);
    
    t.equal(size, '641b');
    t.end();
});

test('redzip: read-size: content length', async (t) => {
    const fixture = join(__dirname, 'fixture', 'words.zip');
    const {contentLength} = await readSize(`${fixture}/`);
    
    t.equal(contentLength, 3);
    t.end();
});
