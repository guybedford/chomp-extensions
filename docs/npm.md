# npm Extension

**Task Definitions**: _['package.json'](#packagejson-task)_<br/>
**Template Definitions**: _['npm'](#npm-template)_<br/>
**Batcher Defintions**: _['npm'](#npm-batcher)_

Supports validating dependencies are installed in `node_modules`, with the ability to either output an installation prompt (for `auto-install: false` per the default) or calilng npm install only when necessary.

## npm Template

### Template Options

* `auto-install` (_Boolean_, default: `false`): Whether to automatically install packages if not present or to just log an install prompt to the console instead.
* `dev` (_Boolean_, default: `false`): Whether to install packages as devDependencies.
* `packages` (_String[]_): List of packages to install, optionally with semver versions or version ranges using the `@version` suffix.
* `package-manager` (_String_, default `'npm'`): The npm package manager CLI bin to use.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:npm']

# Automaticaly install dependencies as necessary, for _all_ npm template option usage
[template-options.npm]
auto-install = true

[[task]]
name = 'install:swc'
template = 'npm'
[task.template-options]
dev = true
packages = ['@swc/cli', '@swc/core']
```

### Ejection

When ejecting the template, the install task is entirely removed.

## package.json Task

When using `auto-install: true` and the `package.json` file does not exist, the `package.json` task will run an `npm init` with the defaults set to generate one.

## npm Batcher

A comprehensive batcher is provided for npm with `auto-install: true` to ensure:

* Only a single `npm install` operation can happen at a time.
* Where there are multiple usages of `npm install`, they are grouped together into the same install command to avoid repeated calls.

## Roadmap

Some considerations for future development:

* Currently the invalidation check is based on checking `node_modules/[pkg]` exists, but ideally we should be checking the version matches the version expectations as well. This would likely require some kind of Chomp invalidation extension API to handle or alternatively the task should always invalidate but handle these checks internally.
* The other model for npm validation is running a direct `npm install` validating on the `package-lock.json` having a greater mtime than the `package.json`. This model is currently not supported by this extension at all, but might still be a useful workflow to provide.