# Chomp Extensions

Experimental core extensions for JS & frontend workflows.

This extensions library is available by default in Chomp core under the `chomp@0.1:` alias in the `extensions` list.

For example, using the SWC template extension:

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:swc']

[[task]]
name = 'build'
target = 'lib/#.js'
dep = 'src/#.ts'
template = 'swc'
```

Contributions are encouraged and new template extensions will very likely be accepted.

The following extensions are currently included:

* [assert](docs/assert.md): Template for asserting the output of target or dependency of a task, useful for test tasks.
* [babel](docs/babel.md): Template for Babel compilation. The [SWC template]() is highly recommended instead of Babel for performance.
* [jspm](docs/jspm.md): Template for JSPM import map generation.
* [npm](docs/npm.md): Template for initializing npm and ensuring packages are installed / `npm install` has been run.
* [prettier](docs/prettier.md): Template for running Prettier.
* [rollup](docs/rollup.md): Template for RollupJS compilation.
* [svelte](docs/svelte.md): Template for Svelte. Just a prototype currently, contributions would be great.
* [swc](docs/swc.md): Template for the SWC compiler. Recommended for TypeScript / JSX / JS transpilation workflows with Chomp.

# LICENSE

MIT