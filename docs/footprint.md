# Footprint Extension

**Task Definitions**: _None_<br/>
**Template Definitions**: _['footprint'](#footprint-template)_<br/>
**Batcher Defintions**: _None_

Prints the byte sizes of the listed task dependencies, including Brotli compression sizes.

## Footprint Template

### Template Options

_None_

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:footprint']

[[task]]
name = 'footprint'
deps = ['dist/build1.js', 'dist/build2.js']
template = 'footprint'
```

With output:

```sh
$ chomp footprint

● dist/lexer.asm.js [cached]
🞂 :footprint
dist/build1.js:  4,670B Brotli (11,532B raw)
dist/build2.js:    874B Brotli ( 2,482B raw)
```

The footprint task will naturally depend on the build as it references the build targets as dependencies.

Glob dependencies are supported, but not interpolates. Target / run / engine customization is not supported.

### Ejection

Ejecting the footprint template will inline the footprint Node.js task (which uses no dependencies).

## Roadmap

Future additions to this extension might include:

* Customizing the byte output and compression comparisons
* Saving the footprint or comparing to a previous run with thresholds to fail if a threshold is breached
