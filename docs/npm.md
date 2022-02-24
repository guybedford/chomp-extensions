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

# Task depends on npm install first running (if necessary)
[[task]]
deps = ['npm:install']
run = 'node app.js'

# Add a dependency to a specific package or list of packages, which will be installed if not present
# This pattern is used in templates themselves and ejects into an `npm:install` dependency
[[task]]
run = 'cowsay Chomp'
template = 'npm'
[task.template-options]
dev = true
packages = ['cowsay']
```

### Ejection

When ejecting the template, auto installation is entirely removed, while an `npm:install` task is always injected for the configured package manager.

## package.json Task

When using `auto-install: true` and the `package.json` file does not exist, the `package.json` task will run an `npm init` with the defaults set to generate one.

## npm:install Task

Any task can depend on the `npm:install` task to which when depended upon will ensure the `package-lock.json` and `node_modules` folder exists and have mtimes greater than the `package.json` mtime, running an `npm install` if not.

When setting the `PACKAGE_MANAGER` environment variable to `"yarn"` or `"pnpm"` this task will adjust to the associated install command and lockfile.

## npm Batcher

A comprehensive batcher is provided for npm with `auto-install: true` to ensure:

* Only a single `npm install` operation can happen at a time.
* Where there are multiple usages of `npm install`, they are grouped together into the same install command to avoid repeated calls.
