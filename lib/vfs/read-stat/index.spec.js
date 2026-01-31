import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {readStat} from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('redzip: vfs: read-stat', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const result = await readStat(`${fixture}/nested/readme.md`);
    
    delete result.isDirectory;
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

test('redzip: read-stat: isDirectory', async (t) => {
    const fixture = join(__dirname, 'fixture', 'nested.zip');
    const {isDirectory} = await readStat(`${fixture}/nested/readme.md`);
    
    t.notOk(isDirectory());
    t.end();
});
