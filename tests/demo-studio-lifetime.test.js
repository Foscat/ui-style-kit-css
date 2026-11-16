import test from 'node:test';
import assert from 'node:assert/strict';
import { createLifetime } from '../demo/studio/lifetime.js';

/** Listener ownership must be explicit and must not replace native browser methods. */
test('studio specimen lifetime releases listeners and observers without global patches', () => {
  const add = EventTarget.prototype.addEventListener;
  const target = new EventTarget();
  const lifetime = createLifetime();
  let calls = 0,
    disconnects = 0;
  lifetime.listen(target, 'sample', () => calls++);
  lifetime.observe(
    class {
      disconnect() {
        disconnects++;
      }
    },
  );
  target.dispatchEvent(new Event('sample'));
  assert.equal(calls, 1);
  lifetime.dispose();
  target.dispatchEvent(new Event('sample'));
  assert.equal(calls, 1);
  assert.equal(disconnects, 1);
  assert.equal(EventTarget.prototype.addEventListener, add);
  lifetime.dispose();
  assert.equal(disconnects, 1);
});

/** Nested native property assignments restore their original owner in reverse order. */
test('studio specimen lifetime restores native property handlers after disposal', () => {
  const original = () => {};
  const node = { onclick: original };
  const lifetime = createLifetime();
  lifetime.handle(node, 'click', () => {});
  lifetime.handle(node, 'click', () => {});
  lifetime.dispose();
  assert.equal(node.onclick, original);
});
