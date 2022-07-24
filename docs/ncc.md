# NCC Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['ncc'](#ncc-template)_<br />
**Batcher Definitions**: _None_

Uses [ncc](https://github.com/vercel/ncc) to compile a Node.js application into a single file.

## NCC Template

### Template Options

* `assets`: Set to *false* to disable asset builds.
* `autoInstall`: Set to *false* to disable auto install of plugins packages and RollupJS.
* `sourceMap`: Set to *true* to enable source maps for the build.
* `esm`: Set to *true* to output an ES module, or *false* to output CJS. Defaults to format of the input file.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:ncc']

[[task]]
template = 'ncc'
target = 'dist/build.js'
deps = ['src/app.js', 'src/**/*.js']
[task.template-options]
assets = false
source-map = true
```

Builds `src/app.js` and all of its dependencies into `dist/build.js` disabling asset relocations.

### Ejection

When ejecting the template, only the Rollup compilation CLI command will be ejected, without any auto installation tasks.
