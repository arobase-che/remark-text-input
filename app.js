'use strict';


const START = /^(\[_+)/g;
const END   = /(_+])/g;

function locator(value, fromIndex) {
  var index = value.indexOf(START, fromIndex);
  return index;
}

function plugin() {
  function blockTokenizer(eat, value, silent) {

    if (!this.options.gfm || value.search(START) != 0) {
      return;
    }
    if( value.search(END) > 0 ) {
      return eat(value.slice(0,value.search(END))+value.match(END)[0])({
        type: 'form',
        data: {
          hName: 'form'
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
      });
    } else
      return true;
  }

  blockTokenizer.locator = locator;

  var Parser = this.Parser;

  // Inject blockTokenizer
  const blockTokenizers = Parser.prototype.blockTokenizers
  const blockMethods = Parser.prototype.blockMethods
  blockTokenizers.textinput = blockTokenizer
  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, 'textinput')


  var Compiler = this.Compiler;

  // Stringify
  if (Compiler) {
    var visitors = Compiler.prototype.visitors;
    visitors.textinput = function (node) {
      return '[__' + this.all(node).join('') + '__]';
    };
  }
}

module.exports = plugin;
