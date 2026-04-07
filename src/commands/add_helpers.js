const fs = require('fs');
const path = require('path');

function writePackageFolder(name, content, type, refs) {
    const folderPath = path.resolve(process.cwd(), name);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    const mdFilename = (type === 'agent' || type === 'skill') ? `${type}.md` : `${name}.md`;
    const mdPath = path.join(folderPath, mdFilename);
    fs.writeFileSync(mdPath, content, 'utf8');

    for (const ref of refs) {
        const refPath = path.join(folderPath, ref.filename);
        fs.writeFileSync(refPath, ref.content, 'utf8');
    }

    return folderPath;
}

module.exports = { writePackageFolder };
