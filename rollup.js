Chomp.addExtension('chomp@0.1:npm');

Chomp.registerTemplate('rollup', function (task) {
  const { outdir = 'dist', entries, sourceMaps = true, autoInstall, plugins = [] } = task.templateOptions;
  if (!Array.isArray(entries) || !entries.every(entry => typeof entry === 'string'))
    throw new Error("'entries' must be an array of string module input paths for the Rollup plugin.");
  const targets = entries.map(entry => outdir + '/' + entry.split('/').pop());
  return [{
    name: task.name,
    deps: [...task.deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/rollup']],
    targets: [...new Set([...task.targets, ...targets])],
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
