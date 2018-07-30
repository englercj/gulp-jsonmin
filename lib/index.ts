import chalk from 'chalk';
import log from 'fancy-log';
import PluginError from 'plugin-error';
import prettyBytes from 'pretty-bytes';
import stream from 'stream';
import through from 'through2';

interface Options {
    verbose?: boolean;
}

const defaultOptions: Options = {
    verbose: process.argv.includes('--verbose')
};

export = (options: Options = defaultOptions): stream.Transform => {
    let totalFiles = 0;
    let totalFilesSize = 0;
    let totalSavedBytes = 0;

    return through.obj((file, encoding, callback) => {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            return callback(new PluginError('gulp-jsonmin', 'Streaming not supported'));
        }

        try {
            const fileSize = file.contents.length;
            file.contents = Buffer.from(minifyJSON(file.contents));

            const minifiedFileSize = file.contents.length;
            const savedBytes = fileSize - minifiedFileSize;

            totalFiles += 1;
            totalFilesSize += fileSize;
            totalSavedBytes += savedBytes;

            if (options.verbose) {
                const savedPercentage = fileSize ? savedBytes / fileSize * 100 : 0;
                const savedMessage = savedBytes ? buildSavedMessage(savedBytes, savedPercentage) : 'already minified';
                log('gulp-jsonmin:', `${chalk.green('✔')} ${file.relative} (${chalk.gray(savedMessage)})`);
            }
        } catch (error) {
            return callback(new PluginError('gulp-jsonmin', error));
        }

        callback(null, file);
    }, callback => {
        if (options.verbose) {
            const savedPercentage = totalFilesSize ? totalSavedBytes / totalFilesSize * 100 : 0;
            const savedMessage = buildSavedMessage(totalSavedBytes, savedPercentage);
            log('gulp-jsonmin:', `Minified ${totalFiles} json file(s) ${chalk.gray(savedMessage)}`);
        }
        callback();
    });
}

function buildSavedMessage(savedBytes: number, savedPercentage: number): string {
    return `saved ${prettyBytes(savedBytes)} - ${savedPercentage.toFixed(1)}%`;
}

function minifyJSON(input: string | Buffer): string {
    if (input instanceof Buffer) {
        input = input.toString();
    }
    return JSON.stringify(JSON.parse(input));
}
