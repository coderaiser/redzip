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
  - `root` - root directory to cut from result
- **fn** - `function` callback

#### Example

```js
const sort = 'size';
const order = 'desc';
const token = 'token';
const path = '/';
const type = 'raw';

const readbox = require('readbox');

const stream = await readbox(token, path, {type, sort, order})
console.log(stream.type);
// outputs
'directory'

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

const stream = await readbox(token, '/dropbox.html');
console.log(stream.type);
// outputs
'file'

stream.pipe(process.stdout);
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [flop](https://github.com/coderaiser/flop "flop") - FoLder OPerations
- [dropboxify](https://github.com/coderaiser/dropboxify "dropboxify") - read directory content from readbox compatible way with `readify`
- [dropbox](https://github.com/cloudcmd/dropbox "dropbox") - Dropbox files and folders CRUD

## License

MIT

