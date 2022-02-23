Chomp.addExtension('./npm.js');

Chomp.registerTemplate('rollup', function (task) {
  const { outdir = 'dist', entries, sourceMaps = true, autoInstall } = task.templateOptions;
  if (!Array.isArray(entries) || !entries.every(entry => typeof entry === 'string'))
    throw new Error("'entries' must be an array of string module input paths for the Rollup plugin.");
  const targets = entries.map(entry => outdir + '/' + entry.split('/').pop());
  return [{
    name: task.name,
    deps: [...task.deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/rollup']],
    targets: [...new Set([...task.targets, ...targets])],
    run: `rollup ${entries.join(' ')} -d ${outdir}${sourceMaps ? ' -m' : ''}`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['rollup@2'],
      dev: true
    }
  }]];
});
