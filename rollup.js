Chomp.addExtension('chomp@0.1:npm');

Chomp.registerTemplate('rollup', function ({ name, deps, targets, templateOptions: { outdir = 'dist', entries, sourceMaps = true, autoInstall, plugins = [], ...invalid } }) {
  if (Object.keys(invalid).length)
    throw new Error(`Invalid rollup template option "${Object.keys(invalid)[0]}", expected one of "outdir", "entries", "source-maps", "plugins" or "auto-install".`);
  if (!Array.isArray(entries) || !entries.every(entry => typeof entry === 'string'))
    throw new Error("'entries' must be an array of string module input paths for the Rollup plugin.");
  const rollupTargets = entries.map(entry => outdir + '/' + entry.split('/').pop());
  return [{
    name: name,
    deps: [...deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/rollup', ...plugins.map(p => `node_modules/${p}`)]],
    targets: [...new Set([...targets, ...rollupTargets])],
    run: `rollup ${
      plugins.length > 0
        ? `${plugins.reduce((acc, plugin) => {
            acc = acc + `--plugin ${plugin} `;
            return acc;
          }, "")}`
        : ""
    } ${entries.join(' ')} -d ${outdir}${sourceMaps ? ' -m' : ''}`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['rollup@2', ...plugins],
      dev: true
    }
  }]];
});
