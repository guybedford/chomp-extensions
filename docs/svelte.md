# Svelte Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['svelte'](#svelte-template)_<br />
**Batcher Definitions**: _None_

Builds a Svelte template into a JS and CSS file.

## Svelte Template

### Template Options

* `auto-install` (_Boolean_, default: `true`): Whether to automatically install `svelte` if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `source-maps` (_Boolean_, default: `true`): Whether to output source maps.
* `svelte-config` (_String | Boolean_, default: `false`): Custom Svelte configuration file to use, when set to `true` defaults to `svelte-config.js`.
* `svelte-preprocess` (_Boolean_, default: `true` for no `svelte-config`, `false` when `svelte-config` is set): Automatically applies the [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess) default Svelte preprocessor.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:svelte']

[[task]]
name = 'build:svelte'
target = 'lib/#.js'
dep = 'src/#.svelte'
template = 'svelte'
```

### Ejection

When ejecting the template, the Svelte API JS wrapper task will be output without auto-installation.

## Roadmap

This extension is currently very much a prototype. It would be amazing if someone with Svelte experience is interested in improving it.
