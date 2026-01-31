import {run} from 'madrun';

export default {
    'test': () => `tape 'lib/**/*.spec.js'`,
    'report': () => 'c8 report --reporter=lcov',
    'coverage': () => 'c8 npm test',
    'watch:coverage': () => run('watcher', 'npm run coverage'),
    'watch:test': async () => await run('watcher', `"${await run('test')}"`),
    'watcher': () => 'nodemon -w test -w lib --exec',
    'lint': () => 'redlint scan && putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => 'redlint fix && putout . --fix',
};
