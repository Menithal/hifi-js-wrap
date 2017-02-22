yargs = {
  'root': true,
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module'
  },
  'extends': 'standard',
  'plugins': [],
  'rules': {
    'arrow-parens': [2, 'always'],
    'generator-star-spacing': 0,
    'handle-callback-err': 0, //Disabled due to some axios being incorrectly recognized as a try catch, even though its a function called catch
    'semi': [2, 'always'],
  }
}
