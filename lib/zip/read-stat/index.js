import {readzip} from 'readzip';

const {assign} = Object;

export default async (outerPath, innerPath) => {
    for await (const path of readzip(outerPath)) {
        const {
            name,
            size,
            date,
            mode,
        } = path;
        
        if (path.isFile(innerPath))
            return {
                type: 'file',
                name,
                size,
                date,
                owner: 0,
                mode,
            };
        
        if (path.isDirectory(innerPath))
            return {
                type: 'dir',
                name,
                size,
                date,
                owner: 0,
                mode,
            };
    }
    
    const error = Error(`ENOENT: no such file or directory, stat '${outerPath}${innerPath}'`);
    
    assign(error, {
        code: 'ENOENT',
    });
    
    throw error;
};
