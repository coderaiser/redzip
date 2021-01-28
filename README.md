# Redzip [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/redzip.svg?style=flat
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/redzip/master.svg?style=flat
[DependencyStatusIMGURL]: https://img.shields.io/david/coderaiser/redzip.svg?style=flat
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/redzip "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/redzip "Build Status"
[DependencyStatusURL]: https://david-dm.org/coderaiser/redzip "Dependency Status"
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]: https://coveralls.io/github/coderaiser/redzip?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/redzip/badge.svg?branch=master&service=github

Work with zip archives as it is regular files and directories.

## Install

```
npm i redzip
```

## API

### read(path[, options])

- **path** - `string`
- **options** - `object` can contain:
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")
  - `type` - when "raw" returns not formatted result
  - `root` - root directory to cut from result

#### Example

```js
const sort = 'size';
const order = 'desc';
const type = 'raw';

const dirPath = '/home/coderaiser/hello.zip/hello/';
const path = '/home/coderaiser/hello.zip/hello.txt';

const redzip = require('redzip');

const dirStream = await redzip.read(dirPath, {type, sort, order});
console.log(dirStream.type);
// outputs
'directory';

dirStream.pipe(process.stdout);
// outputs
({
    path: "/",
    files: [{
        name: 'redzip.js',
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

dirStream.files;
// returns
[{
    name: 'redzip.js',
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
}];

dirStream.files.path;
// returns
'/';

const fileStream = await redzip.read(path);
console.log(fileStream.type);
// outputs
'file';

fileStream.pipe(process.stdout);
// outputs
'hello';
```

### readSize(path[, options])

- **path** - `string`
- **options** - `object` can contain:
  - `type` - when "raw" returns not formatted result

### write(path[, data], options)

- **path** - `string`
- **data** - `stream`
- **options** - `object` can contain:
  - `unzip` - unzip file content before writing

#### Example

```js
import {write} from 'redzip';
import pullout from 'pullout';

const dirPath = '/home/coderaiser/hello.zip/hello/';
await write(dirPath);
// returns
'save: ok("hello")';

const path = '/home/coderaiser/hello.zip/hello.txt';
const writeStream = await write(path, Readable.from('hello'));
await pullout(writeStream);
// returns
'save: ok("hello")';

await pullout(await read(path));
// returns
'hello';

import {createGzip} from 'zlib';
const zipStream = Readable.from('hello').pipe(createGzip());
await write(path, zipStream);
const readStream = await read(path);
await pullout(readStream);
// returns
'hello';

```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [readbox](https://github.com/coderaiser/readbox "readbox") - read file or directory from `dropbox`

## License

MIT
