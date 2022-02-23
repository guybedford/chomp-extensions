# npm Extension

**Task Definitions**: _['package.json'](#packagejson-task), ['npm:install'](#npm-install-task), ['yarn:install'](#yarn-install-task), ['pnpm:install'](#pnpm-install-task)_<br/>
**Template Definitions**: _['npm'](#npm-template)_<br/>
**Batcher Defintions**: _['npm'](#npm-batcher)_

Supports validating dependencies are installed in `node_modules`, with the ability to either output an installation prompt (for `auto-install: false` per the default) or calilng npm install only when necessary.

## npm Template

### Template Options

* `auto-install` (_Boolean_, default: `false`): Whether to automatically install packages if not present or to just log an install prompt to the console instead.
* `dev` (_Boolean_, default: `false`): Whether to install packages as devDependencies.
* `packages` (_String[]_): List of packages to install, optionally with semver versions or version ranges using the `@version` suffix.

### Environment Variables

* `PACKAGE_MANAGER` (_String_, default `'npm'`): Set the system environment variable to `"yarn"` or `"pnpm"` to change the package manager.

### Example

_chompfile.toml_
```toml
version = 0.1

extensions = ['chomp@0.1:npm']

# Customize the package manager if desired
[env]
PACKAGE_MANAGER = 'yarn'

# Automaticaly install dependencies as necessary, for _all_ npm template option usage
[template-options.npm]
auto-install = true

[[task]]
# To depend on an npm install, depend on its folder in node_modules
deps = ['node_modules/cowsay']
run = 'cowsay Chomp'

[[task]]
template = 'npm'
[task.template-options]
dev = true
packages = ['cowsay']
```

### Ejection

When ejecting the template, auto installation is entirely removed, while an `npm:install` task for the package manager is left.

## package.json Task

When using `auto-install: true` and the `package.json` file does not exist, the `package.json` task will run an `npm init` with the defaults set to generate one.

## npm:install Task

For any operation that depends on the global npm install, the `npm:install` task is automatically added when using this extension, which when depended upon will ensure the `package-lock.json` exists and has its mtime greater than the `package.json` mtime, running an `npm install` if not.

When setting the `PACKAGE_MANAGER` environment variable to `"yarn"` or `"pnpm"` this task will adjust to the associated install command and lockfile.

## npm Batcher

A comprehensive batcher is provided for npm with `auto-install: true` to ensure:

* Only a single `npm install` operation can happen at a time.
* Where there are multiple usages of `npm install`, they are grouped together into the same install command to avoid repeated calls.

## Roadmap

Some considerations for future development:

* Currently the invalidation check is based on checking `node_modules/[pkg]` exists, but ideally we should be checking the version matches the version expectations as well. This would likely require some kind of Chomp invalidation extension API to handle or alternatively the task should always invalidate but handle these checks internally.
* It could be nicer to treat the npm install template as an addition to the task using the install instead of as a separate task, more like the assertion template pattern.
* The other model for npm validation is running a direct `npm install` validating on the `package-lock.json` having a greater mtime than the `package.json`. This model is currently not supported by this extension at all, but might still be a useful workflow to provide.
