const fs = require("fs");
const path = require("path");
const { parseCompressed, buildPretty } = require("./pretty_helpers");

function pretty(file) {
    const inputPath = path.resolve(file);
    const outputPath = inputPath;

    const content = fs.readFileSync(inputPath, "utf8");
    const parsed = parseCompressed(content);
    const result = buildPretty(parsed);

    fs.writeFileSync(outputPath, result, "utf8");
    console.log(`Prettified in-place: ${inputPath}`);
}

module.exports = { pretty };
