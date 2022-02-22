# Replace Extension

**Task Definitions**: _None_<br/>
**Template Definitions**: _['replace'](#replace-template)_<br/>
**Batcher Defintions**: _None_

Performs string and regular expression replacements.

## Replace Template

### Template Options

* `replacements` (_List[from: String, to: String]_): List of replacements to apply.
* `throw-unmatched` (_Boolean_, default: `false`): Whether to throw if any of the replacements aren't found.

Regular expression replacements are supported when the _from_ string is a regex.

Replacements are applied one after the other in order.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:replace']

[[task]]
target = 'dist/app.js'
dep = 'lib/app.js'
template = 'replace'
[task.template-options]
replacements = [
  ['ENV', '"production"'],
  ['/version-(\d+)/g', 'version-production-$1']
]
```

### Ejection

When ejecting the template, the complete replacement implementation source is provided as the Node.js task, without any dependencies.

## Roadmap

* It would be beneficial to integrate environment variable replacements into the plugin replacements.
* It could be nice to integrate a configuration system that drives such variables, where variable changes could be tracked. For example to get a replacement from a JSON configuration file, etc.
