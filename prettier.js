Chomp.addExtension('chomp@0.1:prettier');

Chomp.registerTemplate('prettier', function ({ name, targets, deps, env, templateOptions: { files = '.', check = false, write = true, config = null, noErrorOnUnmatchedPattern = false, autoInstall, ...invalid } }) {
  if (Object.keys(invalid).length)
    throw new Error(`Invalid prettier template option "${Object.keys(invalid)[0]}", expected one of "files", "check", "write", "config", "no-error-on-unmatched-pattern" or "auto-install".`);
  return [{
    name,
    targets,
    deps: [...deps, ...ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/prettier']],
    invalidation: 'always',
    env,
    run: `prettier ${files} ${
        check ? ' --check' : ''
      }${
        write ? ' --write' : ''
      }${
        config ? ` --config ${config}` : ''
      }${
        noErrorOnUnmatchedPattern ? ' --no-error-on-unmatched-pattern' : ''
      }`
  }, ...ENV.CHOMP_EJECT ? [] : [{
    template: 'npm',
    templateOptions: {
      autoInstall,
      packages: ['prettier'],
      dev: true
    }
  }]];
});
