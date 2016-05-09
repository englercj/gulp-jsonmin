'use strict';

const tap = require('tap');
const assert = require("assert");
const File = require('gulp-util').File;
const jsonmin = require('../index');

tap.test('jsonmin() should minify json files', function (t) {

    const stream = jsonmin();
    const json = '{\n    "hello": "world"\n}';
    const expected = '{"hello":"world"}';

    stream.on("finish", function () {
        t.end();
    });

    stream.on("data", function (file) {
        assert.equal(file.contents.toString(), expected);
    });

    stream.write(new File({
        contents: new Buffer(json)
    }));
    stream.end();

});
