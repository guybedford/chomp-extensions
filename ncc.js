Chomp.addExtension('chomp@0.1:npm');

Chomp.registerTemplate('ncc', ({ name, targets, deps, env, templateOptions: { assets = true, sourceMap, autoInstall, esm, ...invalid} }) => {
  if (Object.keys(invalid).length > 0)
    throw new Error(`Invalid key ${Object.keys(invalid)[0]} for ncc template`);

  return [{
    name,
    targets,
    deps: [...deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/@vercel/ncc', ...assets ? ['node_modules/mkdirp'] : []]],
    env,
    engine: 'node',
    run: `  import ncc from '@vercel/ncc';
  import path from 'path';
  import { writeFileSync } from 'fs';${assets ? `
  import mkdirp from 'mkdirp';` : ''}

  const { code, map, assets } = await ncc(path.resolve(process.env.DEP), {
    filename: process.env.DEP,${typeof esm === 'boolean' ? `
    esm: ${String(esm)},` : ''}
    sourceMap: ${sourceMap ? `true,
    sourceMapRegister: false` : 'false'},
    quiet: true
  });${assets ? `

  const base = path.dirname(process.env.TARGET);
  for (const asset of Object.keys(assets)) {
    mkdirp.sync(path.dirname(path.resolve(base, asset)));
    writeFileSync(path.resolve(base, asset), assets[asset].source);
  }` : ''}

  writeFileSync(path.resolve(process.env.TARGET), code);${sourceMap ? `
  writeFileSync(path.resolve(process.env.TARGET + '.map'), map);` : ''}
`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['@vercel/ncc', ...assets ? ['mkdirp'] : []],
      dev: true
    }
  }]];
});
