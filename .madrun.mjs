import {run} from 'madrun';

export default {
    'test': () => `tape 'lib/**/*.spec.js' -f tap`,
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'coverage': () => 'nyc npm test',
    'watch:coverage': () => run('watcher', 'npm run coverage'),
    'watch:test': async () => await run('watcher', `"${await run('test')}"`),
    'watcher': () => 'nodemon -w test -w lib --exec',
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
};

