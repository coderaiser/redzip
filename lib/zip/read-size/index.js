import format from 'format-io';
import {readzip} from 'readzip';

export default async (outerPath, innerPath, options = {}) => {
    const {type} = options;
    
    let sum = 0;
    
    for await (const path of readzip(outerPath)) {
        const {size, filePath} = path;
        
        if (path.isFile() && !filePath.indexOf(innerPath))
            sum += size;
    }
    
    if (type === 'raw')
        return sum;
    
    return format.size(sum);
};
