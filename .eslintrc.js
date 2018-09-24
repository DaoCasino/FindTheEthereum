module.exports = {
    globals:{ 
        "process":true,
        "DCLib":true,
        "PIXI": true
    },
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "no-console": [
            "off"
        ],

        "indent": [
            "off",
            "tab"
        ],
        "linebreak-style": [
            "off",
            "unix"
        ],
        "quotes": [
            "off",
            "double"
        ],
        "semi": [
            "off",
            "always"
        ]
    }
};