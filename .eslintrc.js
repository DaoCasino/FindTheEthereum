module.exports = {
  'extends': 'standard',
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module",
    "ecmaFeatures": {
        "jsx": true
    }
  },
  'globals': {
    'DCLib': true,
    'localHost': true,
    'self': true,
    'fetch': true,
    'artifacts': true
  },

  'plugins': [],

  'rules': {
      'new-cap'                                 : ['off'],
      'no-multi-spaces'                         : ['off'],
      'key-spacing'                             : ['off'],
      'camelcase'                               : ['off'],
      'no-useles-return'                        : ['off'],
      'standard/no-callback-literal'            : ["off"],
      'standard/object-curly-even-spacing'      : ["off"],
      'standard/computed-property-even-spacing' : ["off"],
      'standard/no-callback-literal'            : ['off'],
      'no-multiple-empty-lines'                 : ['off'],
      'space-in-parens'                         : ['off'],
      'no-trailing-spaces'                      : ['off'],
      'padded-blocks'                           : ['off'],
      'semi'                                    : ['warn'],
      'no-tabs'                                 : ['warn'],
      'no-irregular-whitespace'                 : ['warn'],
      'new-cap'                                 : ['warn'],
      'keyword-spacing'                         : ['warn'],
      'brace-style'                             : ['warn'],
      'comma-spacing'                           : ['warn'],
      'spaced-comment'                          : ['warn'],
      'no-mixed-spaces-and-tabs'                : ['warn'],
      'arrow-spacing'                           : ['warn'],
      'space-unary-ops'                         : ['warn'],
      'eol-last'                                : ['warn'],
      'comma-dangle'                            : ['warn'],
      'space-infix-ops'                         : ['warn'],
      'space-before-function-paren'             : ['warn'],
      'space-before-blocks'                     : ['warn'],
      'indent'                                  : ['warn']
  }
}
