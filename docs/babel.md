# Babel Extension

**Task Definitions**: _['.babelrc'](#babelrc-task)_<br/>
**Template Definitions**: _['assert'](#babel-template)_<br/>
**Batcher Defintions**: _None_

Performs a single-file Babel compilation using the Babel CLI.

## Babel Template

### Template Options

* `auto-install` (_Boolean_, default: `true`): Whether to automatically install `@babel/core`, `@babel/cli` and the used presets or plugins with npm if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `babel-rc` (_Boolean_, default: `false`): Whether to read the `.babelrc` configuration in the current project (and creating it if it doesn't exist).
* `config-file` (_String_): A custom Babel configuration file to use.
* `plugins` (_String[]_): List of plugins to use.
* `presets` (_String[]_): List of presets to use.
* `source-maps` (_Boolean_, default: `true`): Whether to output a source map for each compiled file.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:babel']

[[task]]
name = 'test'
target = 'lib/#.js'
dep = 'src/#.js'
template = 'babel'
[task.template-options]
presets = ['@babel/preset-typescript']
```

### Ejection

When ejecting the template, only the Babel compilation CLI command will be ejected, without any `.babelrc` or auto installation tasks.

## BabelRc Task

When setting `babel-rc = true` in the template options, the BabelRc Task will ensure the `.babelrc` exists, and if it does not will initialize a default `.babelrc` with an empty default configuration:

## Roadmap

Most future work is recommended on the [SWC extension](swc.md) as a preferable and faster alternative to the Babel extension.
