import {test, stub} from 'supertape';

test('redzip: vfs: list', async (t) => {
    const path = '/hello';
    const outerPath = '/hello';
    const innerPath = '';
    
    const list = stub().returns([]);
    const vfs = {
        list,
    };
    
    const redfs = stub().returns([
        vfs,
        innerPath,
        outerPath,
    ]);
    
    const result = await list(path, {
        redfs,
    });
    
    t.deepEqual(result, []);
    t.end();
});
