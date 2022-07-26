# Prettier Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['prettier'](#prettier-template)_<br />
**Batcher Definitions**: _None_

Applies Prettier to the current project, rewriting the project files. Caching is handled by Prettier (`--cache --cache-strategy metadata`).

## Prettier Template

### Template Options

* `auto-install` (_Boolean_, default: `true`): Whether to automatically install `prettier` if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `check` (_Boolean_, default: `false`): Whether to run a Prettier check run.
* `config` (_String_): Custom Prettier configuration.
* `files` (_String_): Files to apply Prettier to. Defaults to all project files.
* `ignorePath` (_String_): Path to .prettierignore (or otherwise named) file.
* `loglevel` (_String_): "debug", "error", "log" (default), "silent" or "warn
* `no-error-on-unmatched-pattern` (_Boolean_, default: `false`): Disable errors for unmatches patterns in the `files` string provided.
* `write` (_Boolean_, default: `true`): Whether to write the updated source files.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:prettier']

[[task]]
name = 'prettier'
template = 'prettier'
deps = ['src/**/*', 'docs/**/*.md']
[task.template-options]
ignore-path = '.prettierignore'
files = 'src/**/*.@(js|json|yml) docs/**/*.md'
loglevel = 'warn'
config = '.prettierrc'
```

### Ejection

When ejecting the template, only the Prettier compilation CLI command will be ejected, without auto installation.
