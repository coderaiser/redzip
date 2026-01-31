import redfs from '../../redfs.js';

const isString = (a) => typeof a === 'string';

export const remove = async (path) => {
    validate({
        path,
    });
    
    const [vfs, outerPath, innerPath] = redfs(path);
    await vfs.remove(outerPath, innerPath);
};

function validate({path}) {
    if (!isString(path))
        throw Error('path should be string!');
}
