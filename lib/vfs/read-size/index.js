import {Buffer} from 'node:buffer';
import {Readable} from 'node:stream';
import redfs from '../../redfs.js';

const {assign} = Object;

export const readSize = async (path, options = {}) => {
    const {type} = options;
    
    validate({
        type,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    const size = await vfs.readSize(outerPath, innerPath, options);
    const str = String(size);
    const contentLength = Buffer.byteLength(str);
    const stream = Readable.from(str);
    
    assign(stream, {
        contentLength,
    });
    
    return stream;
};

function validate({type}) {
    if (type && type !== 'raw')
        throw Error('type should be "raw" or not to be defined!');
}
