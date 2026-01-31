import {Readable} from 'node:stream';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
    unlink,
    rmdir,
    stat,
} from 'node:fs/promises';
import pullout from 'pullout';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {write} from './index.js';

test('redzip: vfs: write: no args', async (t) => {
    const [error] = await tryToCatch(write);
    
    t.equal(error.message, 'path should be string!');
    t.end();
});

test('redzip: vfs: write', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me');
    
    const stream = await write(name, Readable.from('hello'));
    const result = await pullout(stream);
    
    await unlink(name);
    
    t.equal(result, 'save: ok("redzip-remove-me")');
    t.end();
});

test('redzip: vfs: write: directory: mode', async (t) => {
    const name = join(tmpdir(), 'redzip-remove-me');
    
    await write(name, null, {
        mode: 0o777,
    });
    
    const {mode} = await stat(name);
    await rmdir(name);
    
    t.equal(mode, 16_877, 'should create directory with mode');
    t.end();
});
