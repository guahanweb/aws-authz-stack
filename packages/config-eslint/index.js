module.exports = {
    env: {
        es6: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["dist", "node_modules", "lib"],
    rules: {
        // specify the maximum length of a line in our program
        // We're increasing the default of 80 to 120
        // Allowing max-len to be longer for a wide number of things like urls/strings/etc
        // http://eslint.org/docs/rules/max-len
        "max-len": [
            "error",
            {
                code: 120,
                ignoreComments: true,
                ignoreRegExpLiterals: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreTrailingComments: true,
                ignoreUrls: true,
            },
        ],

        // Kinda meh about this one turning it off because - kinda like it... it's old-school-hip
        // we could debate this rule... let's fight...
        "no-extra-boolean-cast": "off",

        // This one generally makes working with code more annoying when you DO want to change the value of a param
        // bugs introduced by this may be difficult to track down, but are so rare that the benefits can outweigh the negatives
        "no-param-reassign": "off",

        // since we enforce semicolons - this rule is not as tragic as they make it seem.
        "no-plusplus": "off",

        // Prefer destructuring from arrays and objects
        // http://eslint.org/docs/rules/prefer-destructuring
        "prefer-destructuring": [
            "off",
            {
                VariableDeclarator: {
                    array: false,
                    object: true,
                },
                AssignmentExpression: {
                    array: true,
                    object: true,
                },
            },
            {
                enforceForRenamedProperties: false,
            },
        ],

        // Helps to keep our codebase formatting inline.
        // Allows the eslint auto-formatter on save to take over.
        "padding-line-between-statements": [
            "error",
            { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
            {
                blankLine: "any",
                prev: ["const", "let", "var"],
                next: ["const", "let", "var"],
            },
            { blankLine: "always", prev: "*", next: "return" },
            { blankLine: "always", prev: "import", next: "*" },
            { blankLine: "any", prev: "import", next: "import" },
        ],
    },
};
