Chomp.addExtension('chomp@0.1:npm')

Chomp.registerTemplate(
  'prettier',
  function ({
    name,
    targets,
    deps,
    env,
    templateOptions: {
      files = false,
      check = false,
      write = true,
      config = null,
      loglevel = false,
      noErrorOnUnmatchedPattern = false,
      ignorePath = false,
      autoInstall,
      ...invalid
    },
  }) {
    if (Object.keys(invalid).length)
      throw new Error(
        `Invalid prettier template option "${
          Object.keys(invalid)[0]
        }", expected one of "files", "check", "write", "config", "no-error-on-unmatched-pattern" or "auto-install".`
      )
    return [
      {
        name,
        targets,
        deps: [...deps, ...(ENV.CHOMP_EJECT ? ['npm:install'] : ['node_modules/prettier'])],
        watchInvalidation: 'skip-running',
        invalidation: 'always',
        env,
        run: `prettier --cache --cache-strategy metadata --loglevel ${loglevel || 'log'}${
          ignorePath ? ` --ignore-path ${ignorePath}` : ''
        }${config ? ` --config ${config}` : ''}${
          noErrorOnUnmatchedPattern ? ' --no-error-on-unmatched-pattern' : ''
        }${check ? ' --check' : ''}${write ? ' --write' : ''} ${
          files
            ? files
                .split(' ')
                .map(ex => `"${ex}"`)
                .join(' ')
            : '.'
        }`,
      },
      ...(ENV.CHOMP_EJECT
        ? []
        : [
            {
              template: 'npm',
              templateOptions: {
                autoInstall,
                packages: ['prettier'],
                dev: true,
              },
            },
          ]),
    ]
  }
)
