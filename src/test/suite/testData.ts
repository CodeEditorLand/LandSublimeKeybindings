export const sublimeSettings = {
    mapped: {
        "tab_size$test": 12,
        "word_separators$test": "./\\()\"'-:,.;<>~!@#$%^&*|+=[]{}`~?",
        "ensure_newline_at_eof_on_save$test": false,
        "draw_white_space$test": "selection",
    },
    mappedSpecialCases: {
        sameKeyVal: { "sameKeySameValue": true },
        sameKeyDiffVal: { "sameKeyDiffVal": 'asdfjadfsla' },
    },
    noMapping: { "noMapping": 'someVal' },
};

export const testMappings = {
    "tab_size$test": "editor.tabSize$test", // Number
    "word_separators$test": "editor.wordSeparators$test", // String
    "ensure_newline_at_eof_on_save$test": "files.insertFinalNewline$test", // Boolean
    "draw_white_space$test": {
        "all": {
            "editor.renderWhitespace$test": "all"
        },
        "none": {
            "editor.renderWhitespace$test": "none"
        },
        "selection": {
            "editor.renderWhitespace$test": "boundary"
        },
    },
    "sameKeySameValue": "editor.sameKeySameValue",
    "sameKeyDiffVal": "editor.sameKeyDiffVal",
};

