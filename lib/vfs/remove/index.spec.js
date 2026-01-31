import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {remove} from './index.js';
import {write} from '../write/index.js';
import {read} from '../read/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: vfs: remove', async (t) => {
    const path = join(__dirname, 'fixture', 'remove-me');
    
    await write(path);
    await remove(path);
    
    const [error] = await tryToCatch(read, path);
    
    t.equal(error.code, 'ENOENT');
    t.end();
});

test('redzip: vfs: remove: no path', async (t) => {
    const [error] = await tryToCatch(remove);
    
    t.equal(error.message, `path should be string!`);
    t.end();
});

test('redzip: vfs: remove: error', async (t) => {
    const [error] = await tryToCatch(remove, 'hello');
    
    t.match(error.message, `ENOENT: no such file or directory`);
    t.end();
});
