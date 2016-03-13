'use strict';

let Core = require('./index-core'),
    core = Core(),
    SVGSpriter = require('svg-sprite'),
    spriter = new SVGSpriter({
        dest: 'data/sprite',
        mode: {
            css: {
                dest: '',
                dimensions: false,
                sprite: 'sprite.svg',
                bust: false,
                render: {
                    css: true
                },
                layout: 'horizontal'
            }
        }
    });

core.npm._.each(core.fnc.readAllFiles(true), function (filepath, idx) {
    spriter.add(filepath, core.node.path.relative(core.config.rootPath, filepath), core.node.fs.readFileSync(filepath, {encoding: 'utf-8'}));
});

// ##################################################
// spriter compile
// ##################################################
console.time('svg-spriter');
spriter.compile(function (error, result, data) {
    for (var type in result.css) {
        core.npm.mkdirp.sync(core.node.path.dirname(result.css[type].path));
        core.node.fs.writeFileSync(result.css[type].path, result.css[type].contents);
    }
    console.timeEnd('svg-spriter');
});