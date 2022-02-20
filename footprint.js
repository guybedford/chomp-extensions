Chomp.registerTemplate('footprint', function (task) {
  if (task.targets.length > 0)
    throw new Error('Footprint template does not support targets, it must be a new separate task.');
  if (task.deps.some(dep => dep.includes('#')))
    throw new Error('Footprint template does not support interpolates.');
  if (task.targets.length === 0 && task.deps.length === 0)
    throw new Error('Footprint template must have a dep or target to measure.');
  return [{
    name: task.name,
    deps: task.deps,
    engine: 'node',
    display: 'init-only',
    run: `  import { readFileSync } from 'fs';
  import { brotliCompressSync } from 'zlib';

  const info = process.env.DEPS.split(':').map(dep => [dep, readFileSync(dep)])
      .map(([dep, source]) => [dep, source.byteLength.toLocaleString(), brotliCompressSync(source).byteLength.toLocaleString()]);

  const [c1, c2, c3] = info.map(([a, b, c]) => [a.length, b.length, c.length])
      .reduce(([a, b, c], [d, e, f]) => [Math.max(a, d), Math.max(b, e), Math.max(c, f)], [0, 0, 0]);

  for (const [file, rawLen, brotliLen] of info) {
    console.log(\`\${file.padStart(c1)}: \x1b[36m\${brotliLen.padStart(c2)}B\x1b[0m Brotli (\${rawLen.padStart(c3 + 1)}B raw)\`);
  }
`
  }];
});
