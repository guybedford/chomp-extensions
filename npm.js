Chomp.registerTask({
  name: 'yarn:install',
  display: 'init-only',
  target: 'yarn.lock',
  dep: 'package.json',
  run: 'yarn'
});

Chomp.registerTask({
  name: 'npm:install',
  display: 'init-only',
  target: 'package-lock.json',
  dep: 'package.json',
  run: 'npm install'
});

Chomp.registerTask({
  name: 'pnpm:install',
  display: 'init-only',
  target: 'pnpm-lock.yaml',
  dep: 'package.json',
  run: 'pnpm install'
});

Chomp.registerTemplate('npm', function ({ name, deps, env, display, templateOptions: { packages, dev, packageManager = 'npm', autoInstall, ...invalid } }) {
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
      deps: ['package.json'],
      env,
      run: `${packageManager} install ${packages.join(' ')}${dev ? ' -D' : ''}`
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
  invalidation: 'not-found',
  display: 'none',
  run: `npm init -y`
});

// Batcher for npm executions handles the following:
// 1. Ensuring only one npm operation runs at a time
// 2. If two npm init operations are batched, only one is run. If npm init
//    is already running, ties additional invocations to the existing one.
// 3. When multiple npm install operations are running at the same time,
//    combine them into a single install operation.
const POOL_SIZE = Number(ENV.CHOMP_POOL_SIZE);

Chomp.registerBatcher('npm', function (batch, running) {
  if (running.length >= POOL_SIZE) return;
  const defer = [], completionMap = {};
  let batchInstall = null;
  for (const { id, run, engine, env } of batch) {
    if (engine !== 'cmd' || !run.startsWith('npm ')) continue;
    const args = run.slice(4).split(' ');
    if (args[0] === 'init' && args[1] === '-y' && args.length === 2) {
      const existingNpm = running.find(({ run }) => run.startsWith('npm '));
      if (existingNpm) {
        completionMap[id] = existingNpm.id;
        continue;
      }
    }
    if (args[0] === 'install') {
      const install = parseInstall(args.slice(1));
      if (!install) return;
      if (running.find(({ run }) => run.startsWith('npm ')) ||
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
    run: `npm install${batchInstall.isDev ? ' -D' : ''} ${batchInstall.packages.join(' ')}`,
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
