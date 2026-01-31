import redfs from '../../redfs.js';

const buildIsDirectory = ({type}) => () => type === 'dir';
const {assign} = Object;

export const readStat = async (path) => {
    const [vfs, outerPath, innerPath] = redfs(path);
    const stat = await vfs.readStat(outerPath, innerPath);
    
    assign(stat, {
        isDirectory: buildIsDirectory(stat),
    });
    
    return stat;
};
