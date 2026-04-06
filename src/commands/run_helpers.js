const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

function resolveExcelPath(dir, name) {
    const candidates = [
        path.resolve(dir, name),
        path.resolve(dir, `${name}.xlsx`),
        path.resolve(dir, `${name}.xls`),
    ];
    return candidates.find(fs.existsSync) || null;
}

function colToIndex(col) {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
        index = index * 26 + col.charCodeAt(i) - 64;
    }
    return index - 1;
}

function humanizeFormula(formula, headers, rangeColStart, sheetName) {
    return formula
        .replace(/([A-Za-z0-9_]+)!([A-Z]+)(\d+)/g, (_, sheet) => {
            return `value from ${sheet}`;
        })
        .replace(/([A-Z]+)(\d+)/g, (match, col) => {
            const idx = colToIndex(col) - rangeColStart;
            const header = headers[idx];
            return header ? `[${header}]` : `from ${sheetName}`;
        })
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " - ");
}

function describeSheet(filePath, sheetName, range) {
    const workbook = XLSX.readFile(filePath, { cellFormula: true });

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
        const available = workbook.SheetNames.join(", ");
        return `[Sheet "${sheetName}" not found in ${path.basename(filePath)}. Available: ${available}]`;
    }

    const opts = { header: 1, defval: "" };
    if (range) opts.range = range;

    const rows = XLSX.utils.sheet_to_json(sheet, opts);
    if (rows.length === 0) return `[No data found in ${sheetName}${range ? ` (${range})` : ""}]`;

    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.some(cell => cell !== ""));
    const rowCount = dataRows.length;

    const decodedRange = range ? XLSX.utils.decode_range(range) : XLSX.utils.decode_range(sheet["!ref"]);
    const rangeColStart = decodedRange.s.c;
    const rangeRowStart = decodedRange.s.r;

    const formulaMap = {};
    for (let R = decodedRange.s.r; R <= decodedRange.e.r; R++) {
        for (let C = decodedRange.s.c; C <= decodedRange.e.c; C++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell && cell.f) {
                const relRow = R - rangeRowStart;
                const relCol = C - rangeColStart;
                if (!formulaMap[relRow]) formulaMap[relRow] = {};
                formulaMap[relRow][relCol] = cell.f;
            }
        }
    }

    const colFormulas = {};
    Object.entries(formulaMap).forEach(([relRow, cols]) => {
        if (Number(relRow) === 0) return;
        Object.entries(cols).forEach(([relCol, formula]) => {
            const humanised = humanizeFormula(formula, headers, rangeColStart, sheetName);
            const generalised = humanised.replace(/\b([A-Z]+)(\d+)\b/g, "$1n");
            if (!colFormulas[relCol]) colFormulas[relCol] = new Set();
            colFormulas[relCol].add(generalised);
        });
    });

    const calcLogic = [];
    Object.entries(colFormulas).forEach(([relCol, formulas]) => {
        const header = headers[Number(relCol)] || `Col ${Number(relCol) + 1}`;
        formulas.forEach(f => {
            calcLogic.push(`  ${header} = ${f}`);
        });
    });

    const columnRows = headers.map((header, colIndex) => {
        const values = dataRows.map(row => row[colIndex]).filter(v => v !== "" && v != null);
        const numeric = values.filter(v => typeof v === "number");
        const isNumeric = numeric.length > 0 && numeric.length > values.length * 0.8;
        if (isNumeric) {
            const min = Math.min(...numeric);
            const max = Math.max(...numeric);
            return `| ${header} | number | ${min}–${max} |`;
        }
        const unique = [...new Set(values.map(String))].slice(0, 3);
        return `| ${header} | text | e.g. ${unique.join(", ")} |`;
    });

    const separator = headers.map(() => "---").join(" | ");
    const headerRow = `| ${headers.join(" | ")} |`;
    const allRows = dataRows.map(row =>
        `| ${headers.map((_, i) => row[i] ?? "").join(" | ")} |`
    );

    const lines = [
        `**Excel:** ${path.basename(filePath)} | **Sheet:** ${sheetName}${range ? ` | **Range:** ${range}` : ""} | ${rowCount} rows × ${headers.length} columns`,
        ``,
        `**Columns:**`,
        `| Column | Type | Values |`,
        `| --- | --- | --- |`,
        ...columnRows,
    ];

    if (calcLogic.length > 0) {
        lines.push(``);
        lines.push(`**Calculation logic:**`);
        lines.push(...calcLogic.map(l => `- ${l.trim()}`));
    }

    lines.push(``);
    lines.push(`**Rows:**`);
    lines.push(headerRow);
    lines.push(`| ${separator} |`);
    lines.push(...allRows);

    return lines.join("\n");
}

module.exports = { resolveExcelPath, describeSheet };
