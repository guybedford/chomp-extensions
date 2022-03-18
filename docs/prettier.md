# Prettier Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['prettier'](#prettier-template)_<br />
**Batcher Definitions**: _None_

Applies Prettier to the current project, rewriting the project files.

Since it affects all files, no caching is provided.

## Prettier Template

### Template Options

* `auto-install` (_Boolean_, default: `true`): Whether to automatically install `prettier` if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `check` (_Boolean_, default: `false`): Whether to run a Prettier check run.
* `config` (_String_): Custom Prettier configuration.
* `files` (_String_): Files to apply Prettier to. Defaults to all project files.
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
```

### Ejection

When ejecting the template, only the Prettier compilation CLI command will be ejected, without auto installation.
