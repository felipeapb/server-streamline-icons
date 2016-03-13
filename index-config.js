'use strict';

module.exports = function (path) {
    let rootPath = path.join(__dirname, 'data'),
        sources = {
            svg: {
                line: path.join(rootPath, 'line', 'SVG'),
                filled: path.join(rootPath, 'filled', 'SVG')
            }
        };

    return {
        server: {
            port: 12345
        },
        rootPath: rootPath,
        filePaths: [
            sources.svg.line
        ],
        dataFile: path.join(rootPath, 'icons.json'),
        generatedZip: path.join(rootPath, 'generated'),
        sources: sources
    };
};