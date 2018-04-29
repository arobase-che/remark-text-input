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
  t.snapshot(contents.toLowerCase());
});

test('snapshot raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'text.md')));
  t.snapshot(contents);
});

test('emty', t => {
  const {contents} = render('[____\n____]');
  t.is(contents.toLowerCase(), '<textarea></textarea>');
});

test('emty-raw', t => {
  const {contents} = renderRaw('[____\n____]');
  t.is(contents.toLowerCase(), '<textarea></textarea>');
});

test('simple', t => {
  const {contents} = render('[____\nHere some text\n____]');
  t.is(contents.toLowerCase(), '<textarea>here some text</textarea>');
});

test('simple-raw', t => {
  const {contents} = renderRaw('[____\nHere some text\n____]');
  t.is(contents.toLowerCase(), '<textarea>here some text</textarea>');
});

test('long', t => {
  const {contents} = render(`
[_______

here some awesome text !
with severale lines, ...

a good text area
_______]`);
  t.is(contents.toLowerCase(), `<textarea>
here some awesome text !
with severale lines, ...

a good text area</textarea>`);
});

test('long-raw', t => {
  const {contents} = renderRaw(`
[_______

here some awesome text !
with severale lines, ...

a good text area
_______]`);
  t.is(contents.toLowerCase(), `<textarea>
here some awesome text !
with severale lines, ...

a good text area</textarea>`);
});

test('not a text-area', t => {
  const {contents} = renderRaw(`
[_______some text
oups bad-formated text area
_______]`);
  t.notRegex(contents.toLowerCase(), /textarea/);
});

test('simple-raw2', t => {
  const {contents} = renderRaw('[____\nHere some text\n____]\n\n<div>Yeah !</div>');
  t.is(contents.toLowerCase(), '<textarea>here some text</textarea>');
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

