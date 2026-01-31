import {Readable} from 'node:stream';
import {basename} from 'node:path';
import redfs from '../../redfs.js';

const isString = (a) => typeof a === 'string';

export const write = async (path, data, options) => {
    validate({
        path,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    await vfs.write(outerPath, innerPath, data, options);
    
    return Readable.from(`save: ok("${basename(path)}")`);
};

function validate({path}) {
    if (!isString(path))
        throw Error('path should be string!');
}
