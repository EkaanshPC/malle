import './style.css'
import malle from '../../package/core/main.js'

setupCounter(document.querySelector('#counter'))

function run(name, fn) {
  try {
    console.log(`\n=== ${name} ===`);
    console.log(fn());
  } catch (err) {
    console.error(name, 'ERROR', err && err.stack ? err.stack : err);
  }
}

run('loose: user example', () => {
  return malle({ mode: 'loose' })
    .expect({ name: 'string', type: 'string' }, { name: 'arr', type: 'arr' })
    .guess([123123], 'sting');
});

run('strict: spread + aliasNames - call1', () => {
  function add(...args) {
    return malle({ mode: 'strict' }).expect(
      { name: 'mode', aliasNames: ['m'], type: 'string|string[]', optional: true },
      { name: 'numbers', type: 'number[]', spread: true }
    ).guess(args);
  }
  return add('sum', 1, 2, 3);
});

run('strict: spread + aliasNames - call2 (object + array)', () => {
  function add(...args) {
    return malle({ mode: 'strict' }).expect(
      { name: 'mode', aliasNames: ['m'], type: 'string|string[]', optional: true },
      { name: 'numbers', type: 'number[]', spread: true }
    ).guess(args);
  }
  return add({ m: 'sum' }, [1, 2, 3]);
});

run('strict: union accepts array', () => {
  return malle().expect({ name: 'x', type: 'string|string[]' }).guess(['ok']);
});

run('spread collects consecutive (strict)', () => {
  return malle().expect({ name: 'nums', type: 'number', spread: true }).guess(5,6,7,'a');
});
