# RollupJS Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['imagemin'](#imagemin-template)_<br />
**Batcher Definitions**: _None_

Performs compression on images with the default settings from `imagemin-cli`

### Template Options

* `auto-install` (_Boolean_, default: `true`): Whether to automatically install `rollup` if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `entry` (_String_): List of application entry points.
* `outdir` (_String_): The build output directory.
* `plugins` (_String_): Any valid imagemin plugins (eg: `mozjpeg`)

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:rollup']

[[task]]
name = 'build:assets'
deps = ["public/assets"]
template = 'imagemin'
[task.template-options]
plugins = ['mozjpeg']
entry = 'public/assets'
```

## Roadmap

This plugin is very simple currently and needs to be extended to support comprehensive Imagemin pipelines and customization options.
