# remark-text-input

A [remark](https://github.com/remarkjs/remark/) plugin that parse Mardown syntax to add support for text area.


## Syntax

You can add a text area this way :

```markdown
[______
Some text.
_____]
```

Wich leads to :

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-text-input/master/images/example_1.png)


## Installation

Easy as npm i :

```shell
npm install remark-text-input
```


## Installation

An example of code :

```js
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const textInput = require('remark-text-input')

const testFile = `This is a text area : 

[_____
A editable text here
_____]`

unified()
  .use(remarkParse)
  .use(textInput)
  .use(remark2rehype) 
  .use(stringify)
  .process( testFile, (err, file) => {
    console.log(String(file));
  } );
```

In the file, a text-area should be preceded by an empty line.

## Configuration

This plugin support custom HTML attributes :

```markdown
[____
Here
some
text
_____]{.row=5 .cols=10}
```

## Licence

MIT
