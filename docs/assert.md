# Assert Extension

**Task Definitions**: _None_<br/>
**Template Definitions**: _['assert'](#assert-template)_<br/>
**Batcher Defintions**: _None_

Allows wrapping an existing task with an assertion of its target or dependency file contents.

## Assert Template

### Template Options

* `expect-equals` (_String_): The source text of the target (or dep in the case of no target) to assert.
* `task-template` (_String_): The template string to use for the task. Used to wrap templated tasks.
* `task-template-options` (_Dictionary_): The template options to use for the task, when `task-template` is used above.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:assert']

[[task]]
name = 'test'
target = 'out.txt'
run = 'echo "Chomp Chomp" > out.txt'
template = 'assert'
[task.template-options]
expect-equals = 'Chomp Chomp'
```

Where the task will fail with an assertion diff on failure (which isn't possible in the above example unless changing the `echo "Chomp Chomp"` contents).

Support for asserting templated tasks is provided with the `task-template` and `task-template-options` template options.

### Ejection

When ejecting the assert template, ejection will entirely remove the assertion itself, leaving only the unasserted task.

## Roadmap

Future additions to this extension might include:

* Pattern matching the output instead of matching it directly.
* Supporting multiple output checks, for example with interpolation tasks.
* Supporting taking the expectation values from files instead of as a template option.
* If supporting using expectations in files, having the ability to generate these file expectations as well.
* It may make sense to treat ejection as a nicer form of the assertion task instead of removing the assertion entirely.
