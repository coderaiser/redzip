# Redzip [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/redzip.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/redzip/actions
[BuildStatusIMGURL]: https://github.com/coderaiser/redzip/workflows/CI/badge.svg
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/redzip "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/redzip "Build Status"
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

console.log(dirStream.contentLength);
// outputs
280;

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

dirStream.path;
// returns
'/';

const fileStream = await redzip.read(path);
console.log(fileStream.type);
// outputs
'file';

fileStream.pipe(process.stdout);
// outputs
'hello';

console.log(fileStream.contentLength);
// outputs
6;
```

### readSize(path[, options])

- **path** - `string`
- **options** - `object` can contain:
  - `type` - when "raw" returns not formatted result

```js
const fileStream = readSize('/hello/world.zip/readme.md');

fileStream.pipe(process.stdout);
// outputs
'10kb';

fileStream.contentLength;
// 4
```

### readStat(path[, options])

- **path** - `string`

```js
const stat = readStat('/hello/world.zip/readme.md');
// returns
({
    "date": '2021-01-18T22:00:00.000Z',
    "mode": 1_107_099_648,
    "name": "readme.md",
    "owner": 0,
    "size": 0,
    "type": "file",
});
```

### write(path[, data], options)

When you need to save `string`, or `Buffer` use [Readable.from](https://nodejs.org/dist/latest-v17.x/docs/api/stream.html#streamreadablefromiterable-options).

- **path** - `string`
- **data** - `stream`
- **options** - `object` can contain:
  - `unzip` - unzip file content before writing
  - `mode` - set permissions mode (optional)

#### Example

```js
import {Readable} from 'stream';
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
await write(path, zipStream, {
    unzip: true,
});
const readStream = await read(path);
await pullout(readStream);
// returns
'hello';
```

### remove(path[, data], options)

- **path** - `string`
- **data** - `stream`
- **options** - `object` can contain:
  - `unzip` - unzip file content before writing

#### Example

```js
import {remove} from 'redzip';
import pullout from 'pullout';

const dirPath = '/home/coderaiser/hello.zip/hello/';
await remove(dirPath);

const path = '/home/coderaiser/hello.zip/hello.txt';
await remove(path);
```

### list(path)

- **path** - `string`

#### Example

```js
import {list} from 'redzip';

const dirPath = '/home/coderaiser/hello.zip/hello/';
await list(dirPath);
// returns
[
    '/Users/coderaiser/hello.zip/hello/world.txt',
];
```

## Related

- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [readbox](https://github.com/coderaiser/readbox "readbox") - read file or directory from `dropbox`

## License

MIT
