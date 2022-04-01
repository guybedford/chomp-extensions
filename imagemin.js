Chomp.addExtension("chomp@0.1:npm");

Chomp.registerTemplate("imagemin", function (task) {
  const {
    outdir = "dist",
    entry,
    autoInstall,
    plugins = [],
  } = task.templateOptions;
  if (!entry) {
    throw new Error(`Images entry is mandatory`);
  }

  const imageminPlugins = plugins.map((plugin) => `imagemin-${plugin}`);
  const statement = `imagemin ${entry}/* --out-dir=${outdir}/${entry} ${
    plugins.length > 0
      ? plugins.reduce((acc, plugin) => {
          acc = acc + `--plugin=${plugin}`;
          return acc;
        }, "")
      : ""
  }`;

  return [
    {
      name: task.name,
      deps: [
        ...task.deps,
        ...(ENV.CHOMP_EJECT
          ? ["npm:install"]
          : [
              "node_modules/imagemin-cli",
              /* 
                While reading through cli imagemin don't need prefix 
                https://github.com/imagemin/imagemin-cli/blob/main/cli.js#L55 
              */
              ...imageminPlugins.map((plugin) => `node_modules/${plugin}`),
            ]),
      ],
      targets: [...new Set([...task.targets])],
      run: statement,
    },
    ...(ENV.CHOMP_EJECT
      ? []
      : [
          {
            template: "npm",
            templateOptions: {
              autoInstall,
              packages: ["imagemin-cli", ...imageminPlugins],
              dev: true,
            },
          },
        ]),
  ];
});
