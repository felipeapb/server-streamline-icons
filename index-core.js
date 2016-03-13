'use strict';

module.exports = function () {
    let path = require('path'),
        fs = require('fs'),
        mkdirp = require('mkdirp'),
        _ = require('underscore'),
        async = require('async'),
    // custom config
        config = require('./index-config')(path),
    // custom functions
        walk = function (dir) {
            let results = [],
                list = fs.readdirSync(dir);

            list.forEach(function (file) {
                file = path.join(dir, file);
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(walk(file));
                } else {
                    results.push(file);
                }
            });

            return results;
        },
        readAllFiles = function (readFilledToo) {
            let files = [],
                idx;

            for (idx = 0; idx < config.filePaths.length; idx++) {
                files = files.concat(walk(config.filePaths[idx]));
            }

            if (readFilledToo) {
                files = files.concat(walk(path.join(__dirname, 'data', 'filled/SVG')));
            }

            return files;
        },
        readFilesObject = function () {
            let files = _.map(readAllFiles(), function (filepath, idx) {
                let pathRelative = path.relative(config.rootPath, filepath),
                    pathParts = pathRelative.split(path.sep);

                return {
                    group: pathParts[2],
                    name: path.basename(pathParts[3], '.svg'),
                    path: {
                        line: pathRelative,
                        filled: pathRelative.replace('line', 'filled')
                    }
                };
            });

            files = _.groupBy(files, 'group');

            files = _.mapObject(files, function (icons, group) {
                return {
                    name: group,
                    icons: icons
                };
            });

            files = _.values(files);

            return files;
        },
        clearFolder = function (pathFolder, callback) {
            fs.stat(pathFolder, function (err, stats) {
                if (!err && stats.isDirectory()) {
                    fs.readdir(pathFolder, function (err, files) {
                        async.each(files, function (file, cb) {
                            file = pathFolder + '/' + file;
                            fs.stat(file, function (err, stat) {
                                if (err) {
                                    return cb(err);
                                }
                                if (stat.isDirectory()) {
                                    removeFolder(file, cb);
                                } else {
                                    fs.unlink(file, function (err) {
                                        if (err) {
                                            return cb(err);
                                        }
                                        return cb();
                                    })
                                }
                            })
                        }, function (err) {
                            if (err) return callback(err);
                            fs.rmdir(pathFolder, function (err) {
                                return callback(err);
                            })
                        })
                    });
                } else {
                    callback(null);
                }
            });
        },
        checkSources = function (callback) {
            fs.stat(config.sources.svg.filled, function (err, stats) {
                if (!err && stats.isDirectory()) {
                    fs.stat(config.sources.svg.line, function (err, stats) {
                        if (!err && stats.isDirectory()) {
                            callback(null);
                        } else {
                            callback('Could not load sourefiles for `config.sources.svg.line`: ' + config.sources.svg.line);
                        }
                    });
                } else {
                    callback('Could not load sourefiles for `config.sources.svg.filled`: ' + config.sources.svg.filled);
                }
            });
        };

    return {
        node: {
            path: path,
            fs: fs
        },
        npm: {
            _: _,
            async: async,
            mkdirp: mkdirp
        },
        config: config,
        fnc: {
            readAllFiles: readAllFiles,
            readFilesObject: readFilesObject,
            clearFolder: clearFolder,
            checkSources: checkSources
        }
    };
};