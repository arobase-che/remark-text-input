'use strict';


const START = /^(\[_+)/g;
const END   = /(_+])/g;

function locator(value, fromIndex) {
  var index = value.indexOf(START, fromIndex);
  return index;
}
function prop2HTML( prop ) {
  let html = '';

  if( 'id' in prop && prop['id'] ) {
    html += ' id=' + prop['id'];
  }
  if( 'class' in prop && prop['class'] ) {
    html += ' class="' + prop['class'].join(' ') + '"';
  }
  if( 'key' in prop && prop['key'] ) {
    Object.entries(prop['key']).forEach(
      ([key, value]) => {
        html += ' '
        if(value) {
          html += key+'="'+value+'"';
        }else{
          html +=key
        }
      }
    )
  }

  return html
}

function parseHTMLparam( value, indexNext ) {
  let lets_eat = "{";
  indexNext++;

  const eat = ( ( chars ) => {
    let eaten = ""
    while(chars.indexOf(value.charAt(indexNext)) >= 0) {
      lets_eat+=value.charAt(indexNext);
      eaten   +=value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  });
  const eat_until = ( ( chars ) => {
    let eaten = ""
    while(chars.indexOf(value.charAt(indexNext)) < 0) {
      lets_eat+=value.charAt(indexNext);
      eaten   +=value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  });



  let prop = {key:undefined /* {} */, 'class':undefined /*[]*/,id:undefined /*""*/}
  let type;
    
  while(true) {
    let labelFirst = "";
    let labelSecond = undefined;

    eat(' \t\n\r\v');

    if( value.charAt(indexNext) == '}' ) { // Fin l'accolade
      break;
    } else if( value.charAt(indexNext) == '.' ) { // Classes
      type = 'class';
      indexNext++;
      lets_eat+='.'
    } else if( value.charAt(indexNext) == '#' ) { // ID
      type = 'id';
      indexNext++;
      lets_eat+='#'
    } else { // Key
      type = 'key';
    }

    // Extract name
    labelFirst = eat_until( '=\t\b\r\v  }')

    if( value.charAt(indexNext) == '=' ) { // Set labelSecond
      indexNext++;
      lets_eat+='=';

      if( value.charAt(indexNext) == '"' ) {
        indexNext++;
        lets_eat+='"';
        labelSecond = eat_until('"}\n')

        if( value.charAt(indexNext) != '"' ) {
          // Erreur
        }else{
          indexNext++;
          lets_eat+='"';
        }
      } else if( value.charAt(indexNext) == "'" ) {
        indexNext++;
        lets_eat+="'";
        labelSecond = eat_until("'}\n")

        if( value.charAt(indexNext) !="'" ) {
          // Erreur
        }else{
          indexNext++;
          lets_eat+="'";
        }
      } else {
        labelSecond = eat_until(' \t\n\r\v=}');
      }
    }
    switch( type ) {
      case 'id': // ID
        prop['id']=labelFirst;
      break;
      case 'class':
        if( ! prop['class'] )
          prop['class'] = []
        prop['class'].push(labelFirst);
      break;
      case 'key':
        if( !prop['key'] ) prop['key'] = {};
        if( labelFirst != 'id' && labelFirst != 'class' )
        prop['key'][labelFirst] = labelSecond ? labelSecond : '';
      break;
  }
    if( labelSecond ) 
      console.log("{{" + labelFirst + "=" + labelSecond + "}}");
    else
      console.log("{{" + labelFirst + "}}");
  }
  lets_eat+="}";

  return {type:type, prop:prop, eaten:lets_eat};

}

function plugin() {
  function blockTokenizer(eat, value, silent) {

    if (!this.options.gfm || value.search(START) != 0) {
      return;
    }
    let prop = {key:undefined /* {} */, 'class':undefined /*[]*/,id:undefined /*""*/};
    let eaten = '';
    console.log(value[value.search(END)+value.match(END)[0].length])
    if( value.charAt(value.search(END)+value.match(END)[0].length) == '{' ) {
      let res = parseHTMLparam( value, value.search(END)+value.match(END)[0].length);
      eaten = res.eaten;
      console.log(res.eaten);
      prop=res.prop;
    }
    console.log(prop2HTML(prop));
    if( value.search(END) > 0 ) {
      return eat(value.slice(0,value.search(END))+value.match(END)[0]+eaten)({
        type:'html',
        value:'<textarea' + prop2HTML(prop) + '>' + value.slice(value.match(START)[0].length+1, value.search(END)-1 ) + '</textarea>'
        /*

        type: 'form',
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
        }*/
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
