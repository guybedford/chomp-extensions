Chomp.addExtension('chomp@0.1:npm');

Chomp.registerTemplate('svelte', function ({ name, targets, deps, env, templateOptions: { svelteConfig = null, sveltePreprocess = true, sourceMaps = true, autoInstall, ...invalid } }) {
  if (Object.keys(invalid).length)
    throw new Error(`Invalid svelte template option "${Object.keys(invalid)[0]}"`);
  return [{
    name,
    targets,
    deps: [...deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/svelte', ...sveltePreprocess ? ['node_modules/svelte-preprocess'] : []], 'node_modules/magic-string', 'node_modules/es-module-lexer'],
    env,
    engine: 'node',
    run: `    import { readFile, writeFile } from 'fs/promises';
    import { compile${svelteConfig || sveltePreprocess ? ', preprocess' : ''} } from 'svelte/compiler';
    import MagicString from 'magic-string';
    import { parse } from 'es-module-lexer/js';
    import mkdirp from 'mkdirp';
    import { dirname, extname } from 'path';
${sveltePreprocess ? `    import sveltePreprocess from 'svelte-preprocess';\n` : ''}
    ${svelteConfig
      ? `const { default: svelteConfig } = await import(${svelteConfig === true ? '"./svelte.config.js"' : svelteConfig});`
      : `const svelteConfig = {};`}
${sveltePreprocess ? `    svelteConfig.preprocess = svelteConfig.preprocess || sveltePreprocess;\n` : ''}
    const filename = process.env.DEP;
    const compilerOptions = {
      css: false,
      filename,
      ...svelteConfig.compilerOptions
    };

    const { code, map } = await preprocess(await readFile(filename, 'utf-8'), [{
      // preprocessor to convert imports into .js extensions
      // (would be great to have this as a community extension)
      script: ({ content, filename }) => {
        const [imports] = parse(content);
        const s = new MagicString(content, { filename });
        for (const impt of imports) {
          if (impt.n && (impt.n.startsWith('./') || impt.n.startsWith('../')))
            s.overwrite(impt.e - extname(impt.n).length, impt.e, '.js');
        }
        return { code: s.toString(), map: s.generateMap() };
      }
    }, ...svelteConfig.preprocess ? [svelteConfig.preprocess] : []], { filename });
    compilerOptions.sourcemap = map;

    try {
      var result = compile(code, compilerOptions);
    } catch (err) {
      if (err.frame) {
        console.log(err.frame);
        throw err.message;
      } else {
        throw err;
      }
    }

    const cssFile = process.env.TARGET.replace(/\\.js$/, ".css");
    await Promise.all[
      writeFile(process.env.TARGET, result.js.code),
      writeFile(cssFile, result.css.code)${sourceMaps ? `,
      writeFile(process.env.TARGET + ".map", JSON.stringify(result.js.map)),
      writeFile(cssFile + ".map", JSON.stringify(result.css.map))` : ''}
    ];
`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['svelte@3', ...sveltePreprocess ? ['svelte-preprocess'] : [], 'magic-string', 'es-module-lexer'],
      dev: true
    }
  }]];
});
