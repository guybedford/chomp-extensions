Chomp.addExtension('chomp@0.1:npm');

Chomp.registerTemplate('rollup', task => {
  const { name, targets, deps, env, templateOptions } = task;
  const { autoInstall, onwarn, clearDir } = templateOptions;
  if (templateOptions.plugins) {
    console.log(`Warning: "plugins" option in RollupJS template is no longer supported and will be deprecated, instead use separate "plugin" entries.\nSee the documentation at https://github.com/guybedford/chomp-extensions/blob/main/docs/rollup.md for more information.`);
    templateOptions.plugin = templateOptions.plugins.map(plugin => ({ 'package': plugin }));
  }
  if (templateOptions.entries) {
    console.log(`Warning: "entries" and "outdir" options in RollupJS template are no longer supported and will be deprecated, instead use the target dependency pattern for single file builds, or directly populate the input and output options per the RollupJS documentation with the extension automatically setting dependencies and targets.\nSee the documentation at https://github.com/guybedford/chomp-extensions/blob/main/docs/rollup.md for more information.`);
    templateOptions.input = templateOptions.entries;
    templateOptions.output = templateOptions.output || {};
    templateOptions.output.dir = templateOptions.outdir || 'dist';
    templateOptions.output.sourcemap = true;
    delete templateOptions.outdir;
    delete templateOptions.entries;
  }
  const output = templateOptions.output || {};
  const { banner } = output;
  delete templateOptions.output;
  const pjsonVersion = typeof banner === 'string' && banner.includes('#PJSON_VERSION');
  delete templateOptions.onwarn;
  const plugins = (templateOptions.plugin || []).map((plugin, idx) => {
    const { package } = plugin;
    if (typeof package !== 'string')
      throw new Error(`No "package" import name provided for RollupJS plugin ${idx + 1}`);
    return package;
  });
  const pluginOpts = (templateOptions.plugin || []).map((plugin, idx) => {
    delete plugin.package;
    return `(plugin${idx + 1}.default || plugin${idx + 1})(${JSON.stringify(plugin, null, 2).replace(/\n/g, '\n    ')})`;
  }).join(',\n  ');
  delete templateOptions.plugin;
  const rollupDeps = typeof templateOptions.input === 'string' ? [templateOptions.input] : Array.isArray(templateOptions.input) ? templateOptions.input : Object.values(templateOptions.input || {});
  const inputNames = (typeof templateOptions.input === 'string' ? [templateOptions.input] : Array.isArray(templateOptions.input) ? templateOptions.input : Object.keys(templateOptions.input || {})).map(name => name.split('/').pop());

  if (output.entryFileNames)
    console.log('Warning: Chomp RollupJS extension does not yet support target inferral from entryFileNames. It should though. Lets make it happen.');

  const rollupTargets = output.file ? [output.file] : output.dir && !output.entryFileNames ? inputNames.map(name => `${output.dir}${output.dir.endsWith('/') ? '' : '/'}${name}`) : null;
  
  const rollupInput = templateOptions.input ? JSON.stringify(templateOptions.input, null, 2).replace(/\n/g, '\n    ') : 'process.env.DEP';
  delete templateOptions.input;
  delete templateOptions.clearDir;
  
  const inputOpts = JSON.stringify(templateOptions, null, 2).replace(/\n/g, '\n  ');
  const outputOpts = JSON.stringify(output, null, 2).replace(/\n/g, '\n  ');

  const delDir = clearDir && output.dir ? output.dir : null;

  return [{
    name,
    targets: rollupTargets ? [...new Set([...targets, ...rollupTargets])] : targets,
    deps: [...new Set([...deps, ...rollupDeps]), ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/rollup', ...plugins.map(p => `node_modules/${p}`)], ...pjsonVersion ? ['package.json'] : []],
    env,
    engine: 'node',
    run: `  import { rollup } from 'rollup';
  ${plugins.map((plugin, idx) => `import * as plugin${idx + 1} from '${plugin}';`).join('\n  ')}${pjsonVersion || delDir ?
    `import { ${pjsonVersion ? 'readFileSync' : ''}${delDir && pjsonVersion ? ', ' : ''}${delDir ? 'rmSync' : ''} } from 'fs';` : ''}
${delDir ? `
  rmSync('${JSON.stringify(delDir).slice(1, -1)}', { recursive: true });` : ''}${pjsonVersion ? `
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));` : ''}

  const bundle = await rollup({
    input: ${rollupInput},${onwarn === false ? `
    onwarn () {},` : ''}${pluginOpts ? `
    plugins: [${pluginOpts}],` : ''}${inputOpts.length > 2 ? `
    ${inputOpts.slice(6, -4)}` : ''}
  });
  await bundle.write({${rollupTargets ? '' : `
    file: process.env.TARGET,`}${outputOpts.length > 2 ? `
    ${outputOpts.slice(6, -4).replace('"banner": ' + JSON.stringify(banner), '"banner": `' + (banner || '').replace(/(\`|\${)/, '\\$1').replace('#PJSON_VERSION', '${version}') + '`')}` : ''}
  });
`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['rollup@2', ...plugins],
      dev: true
    }
  }]];
});
