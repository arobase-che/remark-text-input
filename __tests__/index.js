import {readFileSync as file} from 'fs';
import {join} from 'path';
import unified from 'unified';

import test from 'ava';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';

import plugin from '../app';

const render = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype)
  .use(stringify)
  .processSync(text);

const renderRaw = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype, {allowDangerousHTML: true})
  .use(raw)
  .use(stringify)
  .processSync(text);

test('snapshot simple', t => {
  const {contents} = render(file(join(__dirname, 'text.md')));
  t.snapshot(contents);
});

test('snapshot raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'text.md')));
  t.snapshot(contents);
});

test('emty', t => {
  const {contents} = render('[____\n____]');
  t.is(contents, '<textarea></textarea>');
});

test('emty-raw', t => {
  const {contents} = renderRaw('[____\n____]');
  t.is(contents, '<textarea></textarea>');
});

test('simple', t => {
  const {contents} = render('[____\nHere some text\n____]');
  t.is(contents, '<textarea>Here some text</textarea>');
});

test('simple-raw', t => {
  const {contents} = renderRaw('[____\nHere some text\n____]');
  t.is(contents, '<textarea>Here some text</textarea>');
});

test('long', t => {
  const {contents} = render(`
[_______

Here some awesome text !
With severale lines, ...

a good text area
_______]`);
  t.is(contents, `<textarea>
Here some awesome text !
With severale lines, ...

a good text area</textarea>`);
});

test('long-raw', t => {
  const {contents} = renderRaw(`
[_______

Here some awesome text !
With severale lines, ...

a good text area
_______]`);
  t.is(contents, `<textarea>
Here some awesome text !
With severale lines, ...

a good text area</textarea>`);
});

test.todo('id text');
test.todo('class');
test.todo('classes');
test.todo('key-value');
test.todo('classes key-value id');
test.todo('overwrite class');
test.todo('overwrite id');
test.todo('multiple id');

test.todo('real1');
test.todo('real2');
test.todo('real3');

