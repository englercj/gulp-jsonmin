'use strict';

const assert = require('assert');
const tap = require('tap');
const File = require('vinyl');

const jsonmin = require('..');

tap.test('jsonmin() should minify json files', test => {
    const json = '{\n    "hello": "world"\n}';
    const expected = '{"hello":"world"}';

    const stream = jsonmin();
    stream
        .on('data', file => {
            assert.strictEqual(file.contents.toString(), expected);
        })
        .on('finish', () => {
            test.end();
        });
    stream.end(new File({ contents: Buffer.from(json) }));
});
