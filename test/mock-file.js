import {copyFile, mkdtemp} from 'node:fs/promises';
import {rmSync} from 'node:fs';
import process from 'node:process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const dirs = new Set();

const remove = (dir) => {
    dirs.delete(dir);
    rmSync(dir, {
        recursive: true,
        force: true,
    });
};

process.on('exit', () => {
    dirs.forEach(remove);
});

export const mockDir = async () => {
    const dir = await mkdtemp(join(tmpdir(), 'redzip-'));
    
    dirs.add(dir);
    
    return {
        dir,
        restoreFs: () => remove(dir),
    };
};

export const mockFile = async (path) => {
    const {dir, restoreFs} = await mockDir();
    const outerPath = join(dir, 'hello.zip');
    
    await copyFile(path, outerPath);
    
    return {
        outerPath,
        restoreFs,
    };
};
