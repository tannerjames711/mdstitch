const fs = require('fs');
const path = require('path');

function writePackageFile(name, content) {
    const outputPath = path.resolve(process.cwd(), `${name}.md`);
    fs.writeFileSync(outputPath, content, 'utf8');
    return outputPath;
}

module.exports = { writePackageFile };
