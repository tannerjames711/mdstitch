const fs = require("fs");
const path = require("path");
const { resolveExcelPath, describeSheet } = require("./run_helpers");

function run(file) {
    const inputPath = path.resolve(file);
    const outputPath = inputPath;
    const dir = path.dirname(inputPath);

    let content = fs.readFileSync(inputPath, "utf8");

    const pattern = /@excel\(([^)]+)\)/g;
    let found = 0;

    content = content.replace(pattern, (original, args) => {
        const [fileRef, sheetName, range] = args.split(",").map(s => s.trim());

        if (!fileRef || !sheetName || !range) {
            console.warn(`  Warning: @excel() requires all 3 arguments — @excel(filename, sheet, range)`);
            return original;
        }

        const excelPath = resolveExcelPath(dir, fileRef);
        if (!excelPath) {
            console.warn(`  Warning: Excel file not found — ${fileRef}`);
            return `[Excel file not found: ${fileRef}]`;
        }

        found++;
        console.log(`  Processing: ${fileRef} | sheet: ${sheetName} | range: ${range}`);
        return describeSheet(excelPath, sheetName, range);
    });

    fs.writeFileSync(outputPath, content, "utf8");
    console.log(`\nProcessed ${found} @excel() reference(s) in-place: ${inputPath}`);
}

module.exports = { run };
