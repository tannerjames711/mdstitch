const fs = require('fs');
const path = require('path');

function readPackageFile(file, uploadName) {
    const inputPath = path.resolve(file);
    if (!fs.existsSync(inputPath)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
    }
    const name = uploadName || path.basename(inputPath, '.md');
    const raw = fs.readFileSync(inputPath, 'utf8');
    const content = raw.replace(/@secret\(start\)[\s\S]*?@secret\(end\)/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return { name, content };
}

module.exports = { readPackageFile };
