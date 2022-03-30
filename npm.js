if (ENV.PACKAGE_MANAGER !== 'yarn' && ENV.PACKAGE_MANAGER !== 'pnpm')
  ENV.PACKAGE_MANAGER = 'npm';

const isWin = ENV.PATH.match(/\\|\//)[0] !== '/';
const INSTALL = ENV.PACKAGE_MANAGER === 'npm' ? 'install' : 'add';

Chomp.registerTask({
  name: 'npm:install',
  display: 'init-only',
  targets: ['node_modules', { npm: 'package-lock.json', yarn: 'yarn.lock', pnpm: 'pnpm-lock.yaml' }[ENV.PACKAGE_MANAGER]],
  deps: ['package.json'],
  validation: 'ok-only',
  run: `${ENV.PACKAGE_MANAGER} install`
});

const NPM_MISSING_MESSAGE = "\n\x1b[93mChomp\x1b[0m: Some packages are missing.";

Chomp.registerTemplate('npm', function ({ name, deps, env, display, templateOptions: { packages, dev, autoInstall = true, ...invalid } }) {  
  if (Object.keys(invalid).length)
    throw new Error(`Invalid npm template option "${Object.keys(invalid)[0]}", expected one of "packages", "dev" or "auto-install".`);
  if (!packages)
    throw new Error('npm template requires the "packages" option to be a list of packages to install.');
  const nodeModulesTargets = packages.map(pkg => {
    const versionIndex = pkg.indexOf('@', 1);
    return `node_modules/${versionIndex === -1 ? pkg : pkg.slice(0, versionIndex)}`;
  });
  return ENV.CHOMP_EJECT ? [] : autoInstall ? [{
    name,
    display,
    deps: [...deps, ...nodeModulesTargets],
    serial: true
  }, ...packages.map(pkg => {
    const versionIndex = pkg.indexOf('@', 1);
    return {
      target: `node_modules/${versionIndex === -1 ? pkg : pkg.slice(0, versionIndex)}`,
      invalidation: 'not-found',
      display: 'none',
      env,
      run: `${ENV.PACKAGE_MANAGER} ${INSTALL} ${packages.join(' ')}${dev ? ' -D' : ''}`
    };
  })] : [{
    name,
    env,
    invalidation: 'not-found',
    display: 'none',
    targets: nodeModulesTargets,
    deps: ['npm:install'],
    run: (isWin ? 'If (' + nodeModulesTargets.map(t => `(Test-Path -Path "${t}")`).join(' -And ') + ') { } Else { ' : nodeModulesTargets.map(t => `[ ! -d "${t}" ] || `).join('')) + 
      `echo "${NPM_MISSING_MESSAGE} Run \x1b[1m${ENV.PACKAGE_MANAGER} ${INSTALL} ${packages.join(' ')}${dev ? ' -D' : ''}\x1b[0m, or add \x1b[36mauto-install = true\x1b[0m to the npm template configuration.\n"` +
      (isWin ? '\n}' : '')
  }];
});

if (!ENV.CHOMP_EJECT)
Chomp.registerTask({
  target: 'package.json',
  display: 'none',
  // this is useful becuase it stops force from rerunning it
  invalidation: 'not-found',
  run: `${ENV.PACKAGE_MANAGER} init -y`
});

// Batcher for npm executions handles the following:
// 1. Ensuring only one npm operation runs at a time
// 2. If two npm init operations are batched, only one is run. If npm init
//    is already running, ties additional invocations to the existing one.
// 3. When multiple npm install operations are running at the same time,
//    combine them into a single install operation.

Chomp.registerBatcher('npm', function (batch, running) {
  if (running.length >= ENV.CHOMP_POOL_SIZE) return;
  const defer = [], completionMap = {};
  let batchInstall = null;
  const existingNpm = running.find(({ run }) => run.startsWith(ENV.PACKAGE_MANAGER + ' '));
  for (const { id, run, engine, env } of batch) {
    if (engine !== 'shell' || !run.startsWith(ENV.PACKAGE_MANAGER + ' ')) continue;
    const args = run.slice(ENV.PACKAGE_MANAGER.length + 1).split(' ');
    if (args[0] === 'init' && args[1] === '-y' && args.length === 2) {
      if (existingNpm) {
        completionMap[id] = existingNpm.id;
        continue;
      }
    }
    else if (!existingNpm && args[0] === INSTALL) {
      const install = parseInstall(args.slice(1));
      if (!install) continue;
      if (running.find(({ run }) => run.startsWith(ENV.PACKAGE_MANAGER + ' ')) ||
          batchInstall && batchInstall.isDev !== install.isDev) {
        defer.push(id);
        continue;
      }
      if (!batchInstall) {
        batchInstall = { isDev: install.isDev, env, engine, ids: [id], packages: install.packages };
      } else {
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
  // defer any shell error hints while npm install operations are still running
  if (batchInstall) {
    for (const { id, run, engine } of batch) {
      if (engine !== 'shell' || !run.includes(NPM_MISSING_MESSAGE))
      defer.push(id);
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
