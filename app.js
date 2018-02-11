'use strict';

const START = /^(\[_+)\n/g;
const END = /\n(_+])/g;

function locator(value, fromIndex) {
  const index = value.indexOf(START, fromIndex);
  return index;
}
function prop2HTML(prop) {
  let html = '';

  if ('id' in prop && prop.id) {
    html += ` id=${prop.id}`;
  }
  if ('class' in prop && prop.class) {
    html += ` class="${prop.class.join(' ')}"`;
  }
  if ('key' in prop && prop.key) {
    Object.entries(prop.key).forEach(
      ([key,
        value,
      ]) => {
        html += ' ';
        if (value) {
          html += `${key}="${value}"`;
        } else {
          html += key;
        }
      }
    );
  }

  return html;
}

function parseHTMLparam(value, indexNext) {
  let letsEat = '{';
  indexNext++;

  const eat = chars => {
    let eaten = '';
    while (chars.indexOf(value.charAt(indexNext)) >= 0) {
      letsEat += value.charAt(indexNext);
      eaten += value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  };
  const eatUntil = chars => {
    let eaten = '';
    while (chars.indexOf(value.charAt(indexNext)) < 0) {
      letsEat += value.charAt(indexNext);
      eaten += value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  };

  const prop =
    {key: undefined /* {} */,
      class: undefined /* [] */,
      id: undefined,
    };
  let type;

  while (value.charAt(indexNext) !== '}') {
    let labelFirst = '';
    let labelSecond;

    eat(' \t\n\r\v');

    if (value.charAt(indexNext) === '}') { // Fin l'accolade
      continue;
    } else if (value.charAt(indexNext) === '.') { // Classes
      type = 'class';
      indexNext++;
      letsEat += '.';
    } else if (value.charAt(indexNext) === '#') { // ID
      type = 'id';
      indexNext++;
      letsEat += '#';
    } else { // Key
      type = 'key';
    }

    // Extract name
    labelFirst = eatUntil('=\t\b\r\v  }');

    if (value.charAt(indexNext) === '=') { // Set labelSecond
      indexNext++;
      letsEat += '=';

      if (value.charAt(indexNext) === '"') {
        indexNext++;
        letsEat += '"';
        labelSecond = eatUntil('"}\n');

        if (value.charAt(indexNext) === '"') {
          indexNext++;
          letsEat += '"';
        } else {
          // Erreur
        }
      } else if (value.charAt(indexNext) === '\'') {
        indexNext++;
        letsEat += '\'';
        labelSecond = eatUntil('\'}\n');

        if (value.charAt(indexNext) === '\'') {
          indexNext++;
          letsEat += '\'';
        } else {
          // Erreur
        }
      } else {
        labelSecond = eatUntil(' \t\n\r\v=}');
      }
    }
    switch (type) {
      case 'id': // ID
        prop.id = labelFirst;
        break;
      case 'class':
        if (!prop.class) {
          prop.class = [];
        }
        prop.class.push(labelFirst);
        break;
      case 'key':
        if (!prop.key) {
          prop.key = {};
        }
        if (labelFirst !== 'id' && labelFirst !== 'class') {
          prop.key[labelFirst] = labelSecond || '';
        }
        break;
      default:
        // Default
    }
  }
  letsEat += '}';

  return {
    type,
    prop,
    eaten: letsEat,
  };
}

function plugin() {
  function blockTokenizer(eat, value) {
    if (!this.options.gfm || value.search(START) !== 0) {
      return;
    }

    let prop = {
      key: undefined /* {} */,
      class: undefined /* [] */,
      id: undefined,
    };

    let eaten = '';

    if (value.charAt(value.search(END) + value.match(END)[0].length) === '{') {
      const res = parseHTMLparam(value, value.search(END) + value.match(END)[0].length);
      eaten = res.eaten;
      prop = res.prop;
    }

    if (value.search(END) > 0) {
      return eat(value.slice(0, value.search(END)) + value.match(END)[0] + eaten)({
        type: 'html',
        value: `<textarea${prop2HTML(prop)}>` +
               `${value.slice(value.match(START)[0].length, value.search(END))}`
               '</textarea>',
        /*

        Type: 'form',
        data: {
          hName:'form',
          hChildren : [ {
            type: 'element',
            tagName:'div',
            properties: {},
            children: [ {
              type:'element',
              tagName: 'textarea',
              properties: prop,
              children: [ { type: 'text',
                value: value.slice(value.match(START)[0].length+1, value.search(END)-1 )
              } ]
            }]
          }, { type:'element', tagName:'div', properties:{} } ]
        }

        type: 'form',
        children: [ {
          type: 'texterea',
          children: [ { type: 'text',
            value: value.slice(value.match(START)[0].length+1, value.search(END)-1 )
          } ],
          data: {
            hName: 'textarea'
          }
        }],
        */
        /*
        data: {
          hName: 'form',
          hChildren : [ {
            type: 'texterea',
            data: {
              hName: 'textarea',
              hChildren : [ { type: 'text',
                value: value.slice(value.match(START)[0].length+1, value.search(END)-1 )
              } ]
            }
          }]
        }
          hName: 'form'
        } */
      });
    }
    return true;
  }

  blockTokenizer.locator = locator;

  const Parser = this.Parser;

  // Inject blockTokenizer
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
