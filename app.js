'use strict';

const START = /^(\[_+)/g;
const END = /(_+])/g;

const parseAttr = require('md-attr-parser');

function locator(value, fromIndex) {
  const index = value.indexOf(START, fromIndex);
  return index;
}

function plugin() {
  function blockTokenizer(eat, value) {
    if (!this.options.gfm || value.search(START) !== 0) {
      return;
    }

    let prop = {
      class: undefined /* [] */,
      id: undefined,
    };

    let eaten = '';

    if (value.search(END) > 0) {
      if ((value.search(END) + value.match(END)[0].length) < value.length &&
            value.charAt(value.search(END) + value.match(END)[0].length) === '{') {
        const res = parseAttr(value, value.search(END) + value.match(END)[0].length);
        eaten = res.eaten;
        prop = res.prop;
      }
      const t = eat(value.slice(0, value.match(END)[0].lenght) + eaten)({
        type: 'textarea',
        data: {
          hName: 'TEXTAREA',
          hProperties: prop,
          hChildren: [{type: 'text',
            value: value.slice(value.match(START)[0].length, value.search(END)),
          }],
        },
      });
      return t;
    }
    return true;
  }

  blockTokenizer.locator = locator;

  const Parser = this.Parser;

  const blockTokenizers = Parser.prototype.blockTokenizers;
  const blockMethods = Parser.prototype.blockMethods;
  blockTokenizers.textinput = blockTokenizer;
  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, 'textinput');

  const Compiler = this.Compiler;

  // Stringify
  if (Compiler) {
    const visitors = Compiler.prototype.visitors;
    visitors.textinput = function (node) {
      return `[__${this.all(node).join('')}__]`;
    };
  }
}

module.exports = plugin;
