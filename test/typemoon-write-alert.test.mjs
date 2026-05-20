import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const scriptPath = new URL('../typemoon-write-alert.user.js', import.meta.url);

async function loadScriptInFakeBrowser({ editorPresent = true } = {}) {
  const source = await readFile(scriptPath, 'utf8');
  const documentListeners = new Map();
  const windowListeners = new Map();
  const timers = [];

  class FakeForm {}

  const document = {
    body: null,
    documentElement: {},
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
    querySelector() {
      return editorPresent ? {} : null;
    },
  };

  const window = {
    location: { href: 'https://www.typemoon.net/bbs/write.php' },
    addEventListener(type, listener) {
      windowListeners.set(type, listener);
    },
    setTimeout(listener) {
      timers.push(listener);
      return timers.length;
    },
  };

  vm.runInNewContext(source, {
    document,
    HTMLFormElement: FakeForm,
    MutationObserver: class {
      observe() {}
    },
    URL,
    window,
  });

  return {
    FakeForm,
    documentListeners,
    timers,
    windowListeners,
  };
}

function createForm(FakeForm, attributes) {
  const form = new FakeForm();
  form.getAttribute = (name) => attributes[name] || null;
  form.name = attributes.name || '';
  form.method = attributes.method || '';
  form.action = attributes.action || '';
  return form;
}

function createBeforeUnloadEvent() {
  return {
    defaultPrevented: false,
    returnValue: undefined,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

test('userscript targets typemoon write editor pages', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /@name\s+TYPE-MOON Write Leave Alert/);
  assert.match(source, /@name:ko\s+TYPE-MOON 글쓰기 이탈 경고/);
  assert.match(source, /@version\s+0\.1\.1/);
  assert.match(source, /@description\s+Show the browser's default leave-page warning/);
  assert.match(source, /@description:ko\s+TYPE-MOON SmartEditor2가 있는 동안/);
  assert.match(source, /@match\s+https:\/\/www\.typemoon\.net\/\*/);
  assert.match(source, /@match\s+http:\/\/www\.typemoon\.net\/\*/);
  assert.match(
    source,
    /https:\/\/www\.typemoon\.net\/plugin\/editor\/smarteditor2\/SmartEditor2Skin\.html/,
  );
});

test('userscript relies on browser default leave confirmation', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /beforeunload/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /event\.returnValue\s*=\s*''/);
  assert.doesNotMatch(source, /\bconfirm\s*\(/);
});

test('userscript tracks late editor iframe insertion', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /MutationObserver/);
  assert.match(source, /attributeFilter:\s*\['src'\]/);
});

test('userscript leaves update hosting to script repositories', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.doesNotMatch(source, /@updateURL/);
  assert.doesNotMatch(source, /@downloadURL/);
  assert.match(source, /@license\s+/);
});

test('userscript allows the real write completion form to submit', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /WRITE_UPDATE_URL/);
  assert.match(source, /https:\/\/www\.typemoon\.net\/bbs\/write_update\.php/);
  assert.match(source, /name\.toLowerCase\(\)\s*!==\s*'fwrite'/);
  assert.match(source, /method\.toLowerCase\(\)\s*!==\s*'post'/);
  assert.match(source, /addEventListener\('submit', handleSubmit, \{ capture: true \}\)/);
  assert.match(source, /allowNextUnload/);
});

test('write completion form submit bypasses one leave warning at runtime', async () => {
  const { FakeForm, documentListeners, windowListeners } =
    await loadScriptInFakeBrowser();
  const submit = documentListeners.get('submit');
  const beforeunload = windowListeners.get('beforeunload');
  const form = createForm(FakeForm, {
    action: 'https://www.typemoon.net/bbs/write_update.php',
    method: 'post',
    name: 'fwrite',
  });

  submit({ target: form });

  const allowedEvent = createBeforeUnloadEvent();
  beforeunload(allowedEvent);

  assert.equal(allowedEvent.defaultPrevented, false);
  assert.equal(allowedEvent.returnValue, undefined);

  const blockedEvent = createBeforeUnloadEvent();
  beforeunload(blockedEvent);

  assert.equal(blockedEvent.defaultPrevented, true);
  assert.equal(blockedEvent.returnValue, '');
});

test('other form submissions still use the leave warning at runtime', async () => {
  const { FakeForm, documentListeners, windowListeners } =
    await loadScriptInFakeBrowser();
  const submit = documentListeners.get('submit');
  const beforeunload = windowListeners.get('beforeunload');
  const form = createForm(FakeForm, {
    action: 'https://www.typemoon.net/bbs/write_update.php',
    method: 'get',
    name: 'fwrite',
  });

  submit({ target: form });

  const event = createBeforeUnloadEvent();
  beforeunload(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(event.returnValue, '');
});
