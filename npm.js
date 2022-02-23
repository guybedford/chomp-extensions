
if (ENV.PACKAGE_MANAGER !== 'yarn' && ENV.PACKAGE_MANAGER !== 'pnpm')
  ENV.PACKAGE_MANAGER = 'npm';

Chomp.registerTask({
  name: 'npm:install',
  display: 'init-only',
  targets: [{ npm: 'package-lock.json', yarn: 'yarn.lock', pnpm: 'pnpm-lock.yaml' }[ENV.PACKAGE_MANAGER], 'node_modules'],
  dep: 'package.json',
  run: `${ENV.PACKAGE_MANAGER} install`
});

Chomp.registerTemplate('npm', function ({ name, deps, env, display, templateOptions: { packages, dev, autoInstall, ...invalid } }) {
  if (Object.keys(invalid).length)
    throw new Error(`Invalid npm template option "${Object.keys(invalid)[0]}"`);
  if (!packages)
    throw new Error('npm template requires the "packages" option to be a list of packages to install.');
  return ENV.CHOMP_EJECT ? [] : autoInstall ? [{
    name,
    display,
    deps: [...deps, ...packages.map(pkg => {
      const versionIndex = pkg.indexOf('@', 1);
      return `node_modules/${versionIndex === -1 ? pkg : pkg.slice(0, versionIndex)}`;
    })],
    serial: true
  }, ...packages.map(pkg => {
    const versionIndex = pkg.indexOf('@', 1);
    return {
      target: `node_modules/${versionIndex === -1 ? pkg : pkg.slice(0, versionIndex)}`,
      invalidation: 'not-found',
      display: 'none',
      dep: 'package.json',
      env,
      run: `${ENV.PACKAGE_MANAGER} install ${packages.join(' ')}${dev ? ' -D' : ''}`
    };
  })] : [{
    name,
    env,
    invalidation: 'not-found',
    display: 'none',
    targets: packages.map(pkg => {
      const versionIndex = pkg.indexOf('@', 1);
      return `node_modules/${versionIndex === -1 ? pkg : pkg.slice(0, versionIndex)}`;
    }),
    run: `echo "\n\x1b[93mChomp\x1b[0m: Some packages are missing. Run \x1b[1m${packageManager} install ${packages.join(' ')}${dev ? ' -D' : ''}\x1b[0m, or add \x1b[36mauto-install = true\x1b[0m to the npm template configuration.\n"`
  }];
});

Chomp.registerTask({
  target: 'package.json',
  display: 'none',
  run: `${ENV.PACKAGE_MANAGER} init -y`
});

// Batcher for npm executions handles the following:
// 1. Ensuring only one npm operation runs at a time
// 2. If two npm init operations are batched, only one is run. If npm init
//    is already running, ties additional invocations to the existing one.
// 3. When multiple npm install operations are running at the same time,
//    combine them into a single install operation.

Chomp.registerBatcher('npm', function (batch, running) {
  const INSTALL = ENV.PACKAGE_MANAGER === 'npm' ? 'install' : 'add';
  if (running.length >= ENV.CHOMP_POOL_SIZE) return;
  const defer = [], completionMap = {};
  let batchInstall = null;
  for (const { id, run, engine, env } of batch) {
    if (engine !== 'shell' || !run.startsWith(ENV.PACKAGE_MANAGER + ' ')) continue;
    const args = run.slice(ENV.PACKAGE_MANAGER.length + 1).split(' ');
    if (args[0] === 'init' && args[1] === '-y' && args.length === 2) {
      const existingNpm = running.find(({ run }) => run.startsWith(ENV.PACKAGE_MANAGER + ' '));
      if (existingNpm) {
        completionMap[id] = existingNpm.id;
        continue;
      }
    }
    if (args[0] === INSTALL) {
      const install = parseInstall(args.slice(1));
      if (!install) return;
      if (running.find(({ run }) => run.startsWith(ENV.PACKAGE_MANAGER + ' ')) ||
          batchInstall && batchInstall.isDev !== install.isDev) {
        defer.push(id);
        continue;
      }
      if (!batchInstall) {
        batchInstall = { isDev: install.isDev, env, engine, ids: [id], packages: install.packages };
      }
      else {
        for (const key of Object.keys(env)) {
          if (!Object.hasOwnProperty.call(batchInstall.env, key))
            batchInstall.env[key] = env[key];
        }
        batchInstall.ids.push(id);
        for (const pkg of install.packages) {
          if (!batchInstall.packages.includes(pkg))
            batchInstall.packages.push(pkg);
        }
      }
    }
  }
  const exec = batchInstall ? [{
    run: `${ENV.PACKAGE_MANAGER} ${INSTALL}${batchInstall.isDev ? ' -D' : ''} ${batchInstall.packages.join(' ')}`,
    env: batchInstall.env,
    engine: batchInstall.engine,
    ids: batchInstall.ids,
  }] : [];
  return { defer, exec, completionMap };

  function parseInstall (args) {
    const packages = args.filter(arg => !arg.startsWith('-') && arg.indexOf('"') === -1 && arg.indexOf("'") === -1);
    const flags = args.filter(arg => arg.startsWith('-'));
    if (flags.length > 1) return;
    if (flags.length === 1 && flags[0] !== '-D') return;
    if (packages.length + flags.length !== args.length) return;
    const isDev = flags.length === 1;
    return { packages, isDev };
  }
});
