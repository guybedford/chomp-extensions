# RollupJS Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['rollup'](#rollup-template)_<br />
**Batcher Definitions**: _None_

Performs a chunked RollupJS build on the provided application entry point files.

## Babel Template

### Template Options

* `auto-install` (_Boolean_, default: `false`): Whether to automatically install `rollup` if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `entries` (_String[]_): List of application entry points.
* `outdir` (_String[]_): The build output directory.
* `source-maps` (_Boolean_, default: `true`): Whether to output source maps for the build.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:rollup']

# Automaticaly install Rollup as necessary
[template-options.npm]
auto-install = true

[[task]]
name = 'build'
template = 'rollup'
[task.template-options]
outdir = 'dist'
entries = ['lib/app.js', 'lib/feature.js']
```

Where `dist/app.js` and `dist/feature.js` will be created as inlining all their dependencies while having a shared chunk file as appropriate in the build.

### Ejection

When ejecting the template, only the Rollup compilation CLI command will be ejected, without any auto installation tasks.

## Roadmap

This plugin is very simple currently and needs to be extended to support comprehensive RollupJS build customization options.
