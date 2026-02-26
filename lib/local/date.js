import {dirname} from 'node:path';
import {mkdir, utimes} from 'node:fs/promises';
import {tryToCatch} from 'try-to-catch';
import {readStat} from './read-stat.js';

const maybeSetDate = async (path, date) => {
    if (!date)
        return;
    
    await tryToCatch(utimes, path, date, date);
};

export const keepParentDate = (fn) => async (outerPath, innerPath, readStream, options = {}) => {
    const {date} = options;
    const dirPath = dirname(outerPath);
    
    await mkdir(dirPath, {
        recursive: true,
    });
    const {date: dirDate} = await readStat(dirPath);
    
    await fn(outerPath, innerPath, readStream, options);
    
    await maybeSetDate(outerPath, date);
    await tryToCatch(utimes, dirPath, dirDate, dirDate);
};
