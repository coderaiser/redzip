# Readbox [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/readzip.svg?style=flat
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/readzip/master.svg?style=flat
[DependencyStatusIMGURL]: https://img.shields.io/david/coderaiser/readzip.svg?style=flat
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/readzip "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/readzip "Build Status"
[DependencyStatusURL]: https://david-dm.org/coderaiser/readzip "Dependency Status"
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]: https://coveralls.io/github/coderaiser/readzip?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/readzip/badge.svg?branch=master&service=github

Read file or directory from dropbox.

## Install

```
npm i readzip
```

## API

`readzip` requires [token](https://blogs.readzip.com/developers/2014/05/generate-an-access-token-for-your-own-account/) as first parameter

### readzip(path[, options], fn)

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
const path = '/home/coderaiser/hello.zip/hello.txt';
const type = 'raw';

const readzip = require('readzip');

const dirStream = await readzip(path, {type, sort, order});
console.log(dirStream.type);
// outputs
'directory';

dirStream.pipe(process.stdout);
// outputs
({
    path: "/",
    files: [{
        name: 'readzip.js',
        size: 4735,
        date: 1_377_248_899_000,
        owner: 0,
        mode: 0,
    }, {
        name: 'readify.js',
        size: 3735,
        date: 1_377_248_899_000,
        owner: 0,
        mode: 0,
    }],
});

const fileStream = await readzip('/dropbox.html');
console.log(fileStream.type);
// outputs
'file';

fileStream.pipe(process.stdout);
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [readbox](https://github.com/coderaiser/readbox "readbox") - read file or directory from zip `dropbox`

## License

MIT
