import readZip from './read/index.js';
import readZipSize from './read-size/index.js';
import readZipStat from './read-stat/index.js';

export {list} from './list/index.js';
import writeZip from './write/index.js';
import removeZip from './remove/index.js';

export const read = async (outerPath, innerPath, options) => {
    return await readZip(outerPath, innerPath, options);
};

export const readSize = async (outerPath, innerPath, options) => {
    return await readZipSize(outerPath, innerPath, options);
};

export const readStat = readZipStat;

export const write = async (outerPath, innerPath, stream, options) => {
    return await writeZip(outerPath, innerPath, stream, options);
};

export const remove = removeZip;
