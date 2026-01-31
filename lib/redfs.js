import {sep as _sep} from 'node:path';
import * as zip from './zip/index.js';
import * as local from './local/index.js';

export default (path, overrides = {}) => {
    const {sep = _sep} = overrides;
    const [outerPath, innerPath] = split(path, {
        sep,
    });
    
    if (!innerPath)
        return [
            local,
            path,
            '',
        ];
    
    return [
        zip,
        outerPath,
        innerPath,
    ];
};

function split(path, {sep}) {
    const replaced = path.replace(`.zip${sep}`, `*${sep}`);
    let [outer, inner = ''] = replaced.split('*');
    
    inner = inner.replace(/\\/g, '/');
    
    return [
        `${outer}.zip`,
        inner || '',
    ];
}
