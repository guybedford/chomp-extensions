Chomp.registerTemplate('assert', function (task) {
  let env = {};
  if (typeof task.templateOptions.expectEquals === 'string')
    env['EXPECT_EQUALS'] = task.templateOptions.expectEquals;
  if (typeof task.templateOptions.expectMatch === 'string')
    env['EXPECT_MATCH'] = task.templateOptions.expectMatch;
  if (task.targets.length === 0 && task.deps.length === 0)
    throw new Error('Assertion tests must have a dep or target to assert.');
  if (task.deps.some(dep => dep.indexOf('#') !== -1))
    throw new Error('Assertion tests do not support interpolates.');
  env['ASSERT_TARGET'] = task.targets[0] || task.deps[0];
  if (!task.name)
    throw new Error('Assertion tests must be named.');
  if (task.templateOptions.taskTemplate)
    task.template = task.templateOptions.taskTemplate;
  task.templateOptions = task.templateOptions.taskTemplateOptions;
  const name = task.name;
  if (!ENV.CHOMP_EJECT) {
    task.display = task.display || 'none';
    delete task.name;
  }
  // ejection of assertions ejects assertions usage
  return !ENV.CHOMP_EJECT ? [{
    name,
    dep: '&next',
    engine: 'node',
    env,
    envReplace: false,
    display: 'status-only',
    run: `
      import { strictEqual, match } from 'assert';
      import { readFileSync } from 'fs';

      function rnlb (source) {
        source = source.replace(/\\r\\n/g, '\\n');
        if (source.startsWith('\\ufeff'))
          source = source.slice(1);
        if (source.endsWith('\\n'))
          source = source.slice(0, -1);
        return source;
      }

      let asserted = false;
      const assertSource = readFileSync(process.env.ASSERT_TARGET, 'utf8');
      
      if (process.env.EXPECT_EQUALS !== undefined) {
        asserted = true;
        strictEqual(rnlb(assertSource), rnlb(process.env.EXPECT_EQUALS));
      }
      
      if (process.env.EXPECT_MATCH !== undefined) {
        asserted = true;
        match(assertSource, new RegExp(process.env.EXPECT_MATCH));
      }

      if (!asserted)
        throw new Error(\`No assertions made for \${process.env.ASSERT_TARGET}\`);
    `
  }, task] : [task];
});
