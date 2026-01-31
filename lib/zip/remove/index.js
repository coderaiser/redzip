import write from '../write/index.js';

export default async (outerPath, innerPath) => {
    await write(outerPath, innerPath, null, {
        remove: true,
    });
};
