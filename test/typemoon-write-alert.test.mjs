import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const scriptPath = new URL('../typemoon-write-alert.user.js', import.meta.url);

test('userscript targets typemoon write editor pages', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /@name\s+TYPE-MOON Write Leave Alert/);
  assert.match(source, /@name:ko\s+TYPE-MOON 글쓰기 이탈 경고/);
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
