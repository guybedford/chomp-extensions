# SWC Extension

**Task Definitions**: _['swc:init'](#swc-init-task)_<br />
**Template Definitions**: _['assert'](#swc-template)_<br />
**Batcher Definitions**: _['swc'](#swc-batcher)_

Performs a single-file SWC compilation using the SWC CLI.

## SWC Template

### Template Options

* `auto-install` (_Boolean_, default: `false`): Whether to automatically install `@swc/core` and `@swc/cli` with npm if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `config` (_Record_): Custom SWC configurations provided by dotted property names (eg `'jsc.parser.syntax = 'typescript'`).
* `config-file` (_String_): Custom SWC configuration file to use.
* `source-maps` (_Boolean_, default `true`): Whether to output a source map for each compiled file.
* `swc-rc` (_Boolean_, default: `false`): Whether to use the `.swcrc` project configuration file. Will be created if it does not exist with recommended SWC defaults.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:swc']

# Automaticaly install SWC dependencies as necessary
[template-options.npm]
auto-install = true

[[task]]
name = 'build:swc'
target = 'lib/#.js'
dep = 'src/#.ts'
template = 'swc'
[task.template-options.config]
'jsc.parser.tsx' = true
'jsc.minify' = true
'jsc.target' = 'es2017'
```

### Ejection

When ejecting the template, only the SWC compilation CLI command will be ejected, without any `.swcrc`, auto-installation or intitialization tasks.

## SWC Init Task

The experimental `swc:init` task uses the Deno engine to provide the ability to configure SWC through a command prompt interface, simplifying configuration setup for SWC.

This init command will rewrite the local `chompfile.toml` with the template options selected.

Try calling `chomp swc:init` from any project with the extension present to add an SWC task or reconfigure and existing SWC task.

## SWC Batcher

SWC provides a simple batcher as an implementation detail for `.swcrc` construction to handle deduplication of this task.

## Roadmap

As the primary recommended JS compilation workflow the SWC template should be relatively well-maintained.

The batcher should be extended to support batching of SWC compilations into a single SWC call. This will provide a significant performance improvement, at least while SWC is still implemented in Node.js and has the cost of the Node.js runtime initialization overhead. The SWC CLI does naturally support multiple files listed in the compilation by repeated `-o` flags so this should be relatively simple to implement.
