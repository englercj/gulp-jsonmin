var through = require('through2'),
    gutil = require('gulp-util'),
    prettyBytes = require('pretty-bytes'),
    chalk = require('chalk');

module.exports = function (options) {
    options = options || {};
    options.verbose = options.verbose !== undefined ? options.verbose : (process.argv.indexOf('--verbose') !== -1);

    var totalBytes = 0,
        totalSavedBytes = 0,
        totalFiles = 0;

    return through.obj(function (file, encoding, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-jsonmin', 'Streaming not supported'));
            return cb();
        }

        try {
            var originalSize = file.contents.length;

            file.contents = new Buffer(JSON.stringify(JSON.parse(file.contents.toString())));

            var optimizedSize = file.contents.length,
                saved = originalSize - optimizedSize;

            totalBytes += originalSize;
            totalSavedBytes += saved;
            totalFiles++;

            if (options.verbose) {
                var percent = originalSize > 0 ? (saved / originalSize) * 100 : 0,
                    msg = saved > 0 ? savedMsg(saved, percent) : 'already minified';

                gutil.log('gulp-jsonmin:', chalk.green('✔ ') + file.relative + chalk.gray(' (' + msg + ')'));
            }
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-jsonmin', err));
        }

        this.push(file);
        cb();
    }, function (cb) {

        if (options.verbose) {
            var percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0,
                msg = 'Minified ' + totalFiles + ' json ';

            msg += totalFiles === 1 ? 'file' : 'files';
            msg += chalk.gray(' (' + savedMsg(totalSavedBytes, percent) + ')');

            gutil.log('gulp-jsonmin:', msg);
        }

        cb();
    });
};

function savedMsg(saved, percent) {
    return 'saved ' + prettyBytes(saved) + ' - ' + percent.toFixed(1).replace(/\.0$/, '') + '%';
}
