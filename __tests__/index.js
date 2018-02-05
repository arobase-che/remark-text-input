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

test('text simple', t => {
  const {contents} = render(file(join(__dirname, 'text.md')));
  t.snapshot(contents);
});

test('text raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'text.md')));
  t.snapshot(contents);
});

test.todo('empty');
test.todo('empty raw');

test.todo('simple');
test.todo('simple raw');

test.todo('long');
test.todo('long raw');

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

