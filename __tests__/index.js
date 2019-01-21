'use strict';

import plugin from '..';

import {readFileSync as file} from 'fs';
import {join} from 'path';
import unified from 'unified';

import test from 'ava';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';
import {parse} from 'parse5';
import isequal from 'is-equal';

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

const isIn = (value, array) => {
  let ret = false;
  array.forEach(elem => {
    if (isequal(elem, value)) {
      ret = true;
    }
  });
  return ret;
};

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
  t.is(contents.toLowerCase(), '<textarea>here some text</textarea>\n<div>yeah !</div>');
});

test('id', t => {
  const {contents} = renderRaw('[____\nHere some text\n____]{#id}');
  t.is(contents.toLowerCase(), '<textarea id="id">here some text</textarea>');
});

test('text-input-class', t => {
  const {contents} = render('[______\npanda\n___]{.unicorn}');
  t.deepEqual(parse(contents),
    parse('<textarea class="unicorn">panda</textarea>')
  );
});

test('text-input-classes', t => {
  const {contents} = render('[______\n🦔\n___]{.unicorn .unix}');
  t.deepEqual(parse(contents),
    parse('<textarea class="unicorn unix">🦔</textarea>')
  );
});

test('text-input-classes key-value id', t => {
  const {contents} = render('[______\n🦔\n___]{.unixcorn unix=windows #false}');
  const expected = [{name: 'id', value: 'false'},
    {name: 'class', value: 'unixcorn'},
    {name: 'unix', value: 'windows'}];
  const result = parse(contents);
  const {attrs} = result.childNodes[0].childNodes[1].childNodes[0];
  let isok = true;

  // This test comparaison is NOT perfect.
  // But still good for what we want
  //
  // Here, we test if every attributes we must include are.
  expected.forEach(e => {
    if (!isIn(e, attrs)) {
      t.fail();
      isok = false;
    }
  });

  // And the reverse, test if we doesn't create false attributes
  attrs.forEach(e => {
    if (!isIn(e, expected)) {
      t.fail();
      isok = false;
    }
  });
  t.true(isok);
});

test('text-input-overwrite-class', t => {
  const {contents} = render('[______\n🦔Ⓜ️\n___]{.sonic class="mario"}');
  const result = parse(contents);
  const classAttr = result.childNodes[0].childNodes[1].childNodes[0].attrs[0];

  if (classAttr !== undefined && classAttr.name !== undefined && classAttr.name !== 'class') {
    t.fail();
  }
  const classes = classAttr.value.split(' ');
  const expected = ['sonic', 'mario'];

  classes.forEach(elem => t.is(expected.indexOf(elem) > -1, true));
  expected.forEach(elem => t.is(classes.indexOf(elem) > -1, true));
});

test('text-input-overwrite-id', t => {
  const {contents} = render('[______\n🦊\n___]{id="fox" #falco}');
  t.deepEqual(parse(contents),
    parse('<textarea id="falco">🦊</textarea>')
  );
});

test('text-input-multiple-id', t => {
  const {contents} = render('[______\n🦊\n___]{#fox #falco}');
  t.deepEqual(parse(contents),
    parse('<textarea id="fox">🦊</textarea>')
  );
});
