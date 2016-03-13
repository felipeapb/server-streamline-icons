'use strict';

let Core = require('./index-core'),
    core = Core(),
    express = require('express'),
    bodyParser = require('body-parser'),
    JSZip = require('jszip'),
    zip = new JSZip();

core.fnc.checkSources((errorCheckSources) => {
    if (errorCheckSources) throw errorCheckSources;

    core.fnc.clearFolder(core.config.generatedZip, (errorClearFolder) => {
        if (errorClearFolder) throw errorClearFolder;

        core.npm.mkdirp(core.config.generatedZip, (errorMkdir) => {
            if (errorMkdir) throw errorMkdir;

            core.node.fs.writeFile(core.config.dataFile, JSON.stringify(core.fnc.readFilesObject()), (errorWriteData) => {
                if (errorWriteData) throw errorWriteData;

                var app = express();

                app.use(bodyParser.json());
                app.use(bodyParser.urlencoded({
                    extended: true
                }));

                app.use(express.static('public'));

                app.use(express.static('data'));

                app.post('/generate', function (req, res) {
                    if (req.body && req.body.length) {
                        let fileNameGenerated = 'streamline-' + new Date().getTime() + '.zip';

                        core.npm.async.each(req.body,
                            function (item, callback) {
                                let svgPathFileName = item.name + '.svg',
                                    svgPathLine = core.node.path.join(core.config.sources.svg.line, item.group, svgPathFileName),
                                    svgPathFilled = core.node.path.join(core.config.sources.svg.filled, item.group, svgPathFileName);

                                core.node.fs.stat(svgPathLine, function (errorLine, statLine) {
                                    core.node.fs.stat(svgPathFilled, function (errorFilled, statFilled) {
                                        if (errorLine) {
                                            console.error(errorLine);
                                        } else {
                                            if (statLine.isFile()) {
                                                zip.folder('line').file('line-' + item.group + '-' + svgPathFileName,
                                                    core.node.fs.readFileSync(svgPathLine));
                                            } else {
                                                console.error(svgPathLine, 'is not a file!');
                                            }
                                        }
                                        if (errorFilled) {
                                            console.error(errorFilled);
                                        } else {
                                            if (statFilled.isFile()) {
                                                zip.folder('filled').file('filled-' + item.group + '-' + svgPathFileName,
                                                    core.node.fs.readFileSync(svgPathFilled));
                                            } else {
                                                console.error(svgPathFilled, 'is not a file!');
                                            }
                                        }

                                        callback(null);
                                    });
                                });
                            },
                            function (error) {
                                if (error) {
                                    console.error(error);

                                    res.sendStatus(500);
                                } else {
                                    core.node.fs.writeFile(
                                        core.node.path.join(core.config.generatedZip, fileNameGenerated),
                                        zip.generate({
                                            type: 'nodebuffer'
                                        }), function (errorWriteZip) {
                                            if (errorWriteZip) {
                                                console.error(errorWriteZip);

                                                res.sendStatus(500);
                                            } else {
                                                res.status(200).send({
                                                    success: true,
                                                    generatedFile: '/generated/' + fileNameGenerated
                                                });
                                            }
                                        });
                                }
                            }
                        );
                    } else {
                        res.sendStatus(400);
                    }
                });

                app.listen(core.config.server.port, function () {
                    console.log('server listening on http://localhost:' + core.config.server.port + '/');
                });
            });
        });
    });
});