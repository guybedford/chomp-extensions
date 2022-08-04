# RollupJS Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['rollup'](#rollup-template)_<br />
**Batcher Definitions**: _None_

Performs a chunked RollupJS build, exposing the full RollupJS configuration per the [documentation](https://rollupjs.org/guide/en/).

## Rollup Template

### Template Options

Exact same options as the RollupJS configuration documentation with a few exceptions / additions:

* `output` should be an object and not an array.
* `warn: false` is supported to disable warnings.
* `#PJSON_VERSION` is supported for version substitution in the `banner` output option.
* `plugin` is an array of `{ package, ...pluginOptions }` option, where the plugin is imported as `import '<package>'`.
* `auto-install`: Set to *false* to disable auto install of plugins packages and RollupJS.
* `clear-dir`: Boolean, defaults to *false*, whether to remove all files in the output directory before starting the build.

The template can run in two "modes":

1. Do not set `output.file` or `output.dir` or `input`, and then the template will set `input` to `dep` and `output.file` to `target` for a single-file build.
2. Use `input` and `output` options per RollupJS configuration, and `targets` and `deps` will automatically be inferred from this configuration.

Currently `entryFileNames` support is not included for `target` inferrence, although this feature should be added in future.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:rollup']

[[task]]
template = 'rollup'
[task.template-options]
input = ['src/app.js', 'src/feature.js']
onwarn = false
sourcemap = true
clear-dir = true
[task.template-options.output]
dir = 'dist'
banner = '''/*!
 * App #PJSON_VERSION
 */'''
format = 'esm'
[[task.template-options.plugin]]
package = '@rollup/plugin-replace'
"process.env.NODE_ENV" = 'production'
```

Where `dist/app.js` and `dist/feature.js` will be created as inlining all their dependencies while having a shared chunk file as appropriate in the build.

### Ejection

When ejecting the template, only the Rollup compilation CLI command will be ejected, without any auto installation tasks.
