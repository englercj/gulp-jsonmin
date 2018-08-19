const chalk = require('chalk');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const prettyBytes = require('pretty-bytes');
const trough = require('through2');

const buildSavedMessage = (savedBytes, savedPercentage) => {
    return `saved ${prettyBytes(savedBytes)} - ${savedPercentage.toFixed(1)}%`;
};
const minifyJson = input => {
    if (input instanceof Buffer) {
        input = input.toString();
    }
    return JSON.stringify(JSON.parse(input));
};

const DEFAULT_OPTIONS = {
    verbose: process.argv.includes('--verbose')
};
const PLUGIN_NAME = 'gulp-jsonmin';

module.exports = options => {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    let totalFiles = 0;
    let totalFilesSize = 0;
    let totalSavedBytes = 0;

    return trough.obj((file, encoding, callback) => {
        if (file.isNull()) {
            return callback(null, file);
        } else if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        try {
            const fileSize = file.contents.length;
            file.contents = Buffer.from(minifyJson(file.contents));
            const minifiedFileSize = file.contents.length;
            const savedBytes = fileSize - minifiedFileSize;

            totalFiles += 1;
            totalFilesSize += fileSize;
            totalSavedBytes += savedBytes;

            if (options.verbose) {
                const savedPercentage = fileSize ? savedBytes / fileSize * 100 : 0;
                const savedMessage = savedBytes ? buildSavedMessage(savedBytes, savedPercentage) : 'already minified';
                log(`${PLUGIN_NAME}:`, `${chalk.green('✔')} ${file.relative} ${chalk.gray(`(${savedMessage})`)}`);
            }

            callback(null, file);
        } catch (error) {
            callback(new PluginError(PLUGIN_NAME, error), file);
        }
    }, callback => {
        if (options.verbose) {
            const savedPercentage = totalFilesSize ? totalSavedBytes / totalFilesSize * 100 : 0;
            const savedMessage = buildSavedMessage(totalSavedBytes, savedPercentage);
            log(`${PLUGIN_NAME}:`, `Minified ${totalFiles} json file(s) ${chalk.gray(`(${savedMessage})`)}`);
        }

        callback();
    });
};
