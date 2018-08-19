const assert = require('assert');
const File = require('vinyl');
const tap = require('tap');

const jsonmin = require('..');

tap.test('jsonmin() should minify json files', test => {
    const json = '{\n "hello": "world" \n}';
    const expected = '{"hello":"world"}';

    const stream = jsonmin()
        .on('data', file => {
            assert.strictEqual(file.contents.toString(), expected);
        })
        .on('finish', () => {
            test.end();
        });
    stream.write(new File({ contents: Buffer.from(json) }));
    stream.end();
});
