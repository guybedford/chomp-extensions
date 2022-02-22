Chomp.registerTemplate('replace', function (task) {
  if (task.engine || task.run)
    throw new Error('"engine", "run" not configurable for Replace template.');

  const { replacements = [], throwUnmatched } = task.templateOptions;

  return [{
    name: task.name,
    targets: task.targets,
    deps: task.deps,
    engine: 'node',
    run: `  import { readFileSync, writeFileSync } from 'fs';

  let source = readFileSync(process.env.DEP, 'utf8');

  const replacements = [${replacements.map(([from, to], idx) => `\n    [${
    from.match(/^\/.+\/[gus]*$/) ? from : JSON.stringify(from)
  }, ${JSON.stringify(to)}]${idx === replacements.length - 1 ? '\n  ' : ','}`).join('')}];

  for (const [from, to] of replacements) {
${throwUnmatched ? `    if (!source.match(from)) {
      console.log(source);
      throw new Error(\`Match not found for \${from} -> \${to}\`);
    }
` : ''}    source = source.replace(from, to);
  }

  writeFileSync(process.env.TARGET, source);
`
  }]
});
