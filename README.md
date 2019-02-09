# unused-exports.ts

Shamefully stolen CLI wannabe version of https://gist.github.com/dsherret/0bae87310ce24866ae22425af80a9864, thanks to @dsherret.

## Usage

```
# basic
$ cd my-project/
$ unused-exports

# custom tsconfig path (defaults to current directory tsconfig.json)
$ unused-exports --config my-project/path/to/tsconfig.json

# custom file patterns exclusion
$ unused-exports 'path/to/include/**/*' '!node_modules' '!src/to/exclude/**/*'
```
