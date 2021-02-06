import {run} from 'madrun';

export default {
    'test': () => `tape 'lib/**/*.spec.js'`,
    'report': () => 'c8 report --reporter=lcov',
    'coverage': () => 'c8 npm test',
    'watch:coverage': () => run('watcher', 'npm run coverage'),
    'watch:test': async () => await run('watcher', `"${await run('test')}"`),
    
    'watch:lint': async () => await run('watcher', `"${await run('lint', '--fix -f stream')}"`, {
        ESLINT_CONFIG_FILE: '.eslintrc-ide.js',
    }),
    
    'watcher': () => 'nodemon -w test -w lib --exec',
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
};

