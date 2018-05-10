# Readbox [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/readbox.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/readbox/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/readbox.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/readbox "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/readbox  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/readbox "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/coderaiser/readbox?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/readbox/badge.svg?branch=master&service=github

Read file or directory from dropbox.

## Install

```
npm i readbox
```

## API

`readbox` requires [token](https://blogs.readbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/) as first parameter

### readbox(token, path[, options], fn)

- **token** - `string`
- **path** - `string`
- **options** - `object` can contain:
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")
  - `type` - when "raw" returns not formatted result
- **fn** - `function` callback

#### Example

```js
const sort = 'size';
const order = 'desc';
const token = 'token';
const path = '/';
const type = 'raw';

const readbox = require('readbox');

readbox(token, path, {type, sort, order}, (e, stream) => {
    if (error)
        return console.error(e);
    
    stream.pipe(process.stdout)
    // outputs
    {
        path: "/",
        files: [{
            name: 'readbox.js',
            size: 4735,
            date: 1377248899000,
            owner: 0,
            mode: 0
        }, {
            name: 'readify.js',
            size: 3735,
            date: 1377248899000,
            owner: 0,
            mode: 0
        }];
    }
});

readbox(token, '/dropbox.html', (e, stream) => {
    if (e)
        return console.error(e);
    
    stream.pipe(process.stdout);
});
```

## Environments

In old `node.js` environments that not supports `es2017`, `readbox` can be used with:

```js
var readbox = require('readbox/legacy');
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [flop](https://github.com/coderaiser/flop "flop") - FoLder OPerations
- [dropboxify](https://github.com/coderaiser/dropboxify "dropboxify") - read directory content from readbox compatible way with `readify`
- [dropbox](https://github.com/cloudcmd/dropbox "dropbox") - Dropbox files and folders CRUD

## License

MIT

