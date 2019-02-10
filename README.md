# unused-exports.ts

Shamefully stolen CLI wannabe version of https://gist.github.com/dsherret/0bae87310ce24866ae22425af80a9864
built on top of excellent typescript service api wrapper https://github.com/dsherret/ts-morph
All credit goes to @dsherret.

## Usage

### Basic
```
$ cd my-project/
$ npx unused-exports # defaults with checking project sources files declared in ./tsconfig.json.
```
### Advanced

- custom tsconfig path (defaults to current directory tsconfig.json)
```
$ npx unused-exports --config my-project/path/to/tsconfig.json
```

- custom file patterns exclusion
```
$ npx unused-exports 'path/to/include/**/*' '!path/to/include/not/**/*'
```
