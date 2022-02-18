# JSPM Extension

**Task Definitions**: _None_<br />
**Template Definitions**: _['jspm'](#jspm-template)_<br/>
**Batcher Defintions**: _None_

Applies the [JSPM Generator](https://github.com/jspm/generator) to an HTML file to populate its import map for module loading using the JSPM Generator [htmlGenerate API](https://github.com/jspm/generator#generating-html).

## JSPM Template

### Template Options

* `auto-install` (_Boolean_, default: `false`): Whether to automatically install `@babel/core`, `@babel/cli` and the used presets or plugins with npm if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `env` (_String[]_, default: `['browser', 'production', 'module']`): The list of [environment exports conditions](https://github.com/jspm/generator#env) to build.
* `es-module-shims` (_String_): Custom URL to use for the [ES Module Shims](https://github.com/guybedford/es-module-shims) import maps polyfill. Defaults to the latest version on JSPM.
* `integrity` (_Boolean_, default: `false`): Whether to inject integrity metadata for the module graph (relies on preload tags).
* `preload` (_Boolean_, default: `false`): Whether to inject `modulepreload` tags for the static module graph for performance.
* `whitespace` (_Boolean_, default: `true`): Set to false to serialize the import map without whitespace for minified HTML.
* `...generate-opts` (_Dictionary_): Any custom [JSPM Generator options](https://github.com/jspm/generator#options) are supported via object spread.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:jspm']

# Automaticaly install JSPM dependencies as necessary
[template-options.npm]
auto-install = true

[[task]]
name = 'test'
target = 'public/app.html'
dep = 'src/app.html'
template = 'jspm'
[task.template-options]
env = ['browser', 'production', 'module']
preload = true
integrity = true
```

### Ejection

Ejection will eject the task with the JS wrapper API for JSPM generator, without the auto install feature.

## Roadmap

This extension is actively supported by JSPM and will continue to track JSPM best practices.
