# Terser Extension

**Task Definitions**: _None_<br/>
**Template Definitions**: _['terser'](#terser-template)_<br/>
**Batcher Defintions**: _None_

Performs a single-file Terser minification.

## Terser Template

### Template Options

* `auto-install` (_Boolean_, default: `true`): Whether to automatically install `terser` with npm if not present (using the [npm extension](npm.md)). The global npm extension `auto-install` option will take precedence here if not otherwise set.
* `...terserOptions`. Options are exactly per [Terser documentation](https://github.com/terser/terser).

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:terser']

[[task]]
name = 'test'
target = 'dist/app.js'
dep = 'dist/app.min.js'
template = 'terser'
[task.template-options]
module = true
compress = { ecma = 6, unsafe = true }
output = { preamble = '/* App@1.2.3 Min */' }
```

### Ejection

When ejecting the template, the JS Terser API usage will be ejected, without auto-installation.
