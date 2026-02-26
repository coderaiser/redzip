import {lstat} from 'node:fs/promises';
import {basename} from 'node:path';

export const readStat = async (outerPath) => {
    const statResult = await lstat(outerPath);
    const {
        mtime,
        mode,
        uid,
    } = statResult;
    
    const type = statResult.isDirectory() ? 'dir' : 'file';
    const size = statResult.isDirectory() ? 0 : statResult.size;
    
    return {
        type,
        name: basename(outerPath),
        size,
        date: mtime,
        owner: uid,
        mode,
    };
};
