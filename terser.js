Chomp.registerTemplate('terser', function (task) {
  if (task.engine || task.run)
    throw new Error('"engine", "run" not configurable for Terser template.');

  const opts = task.templateOptions;
  const preamble = opts.output?.preamble;
  const pjsonVersion = typeof preamble === 'string' && preamble.includes('#PJSON_VERSION');
  const { autoInstall } = opts;
  const optionsStr = JSON.stringify(opts, null, 2).replace(/\n/g, '\n  ');

  return [{
    name: task.name,
    targets: task.targets,
    deps: [...task.deps, ...pjsonVersion ? ['package.json'] : [], ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/terser']],
    engine: 'node',
    run: `  import { readFileSync, writeFileSync } from 'fs';
  import terser from 'terser';

${pjsonVersion ? `  const pjson = JSON.parse(readFileSync('package.json', 'utf8'));` : ''}
  const { code, map } = terser.minify(readFileSync(process.env.DEP, 'utf8'), ${
    pjsonVersion ? optionsStr.replace('"preamble": ' + JSON.stringify(preamble), '"preamble": `' + preamble.replace(/(\`|\${)/, '\\$1').replace('#PJSON_VERSION', '${pjson.version}') + '`') : optionsStr
  });

  writeFileSync(process.env.TARGET, code);
${opts.sourceMap ? '  writeFileSync(\`\${process.env.TARGET}.map\`, map);\\n' : ''}`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['terser@5'],
      dev: true
    }
  }]];
});
