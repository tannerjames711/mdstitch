function extractFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\n---\r?\n([\s\S]*)$/);
    if (match) {
        return { frontmatter: `---\n${match[1]}\n---`, body: match[2] };
    }
    return { frontmatter: null, body: content };
}

function parseFile(file) {
    let splitFile = file.split(/\r?\n/)
    let mapedFile = splitFile.map((line, index) => ({
        index,
        raw: line,
        text: line.trim(),
    }));
    return mapedFile
}

function normalizeStructure(lines) {
    const result = [];
    let inCodeBlock = false;
    let codeBlockLang = "";
    let codeBlockLines = [];

    for (const line of lines) {
        if (!inCodeBlock && line.text === "") continue;

        if (!inCodeBlock && /^```/.test(line.text)) {
            inCodeBlock = true;
            codeBlockLang = line.text.slice(3).trim();
            codeBlockLines = [];
            continue;
        }

        if (inCodeBlock) {
            if (/^```\s*$/.test(line.text)) {
                result.push({ type: "code", lang: codeBlockLang, value: codeBlockLines.join("\n") });
                inCodeBlock = false;
                codeBlockLines = [];
                codeBlockLang = "";
            } else {
                codeBlockLines.push(line.raw);
            }
            continue;
        }

        if (/^#{1,6}\s+/.test(line.text)) {
            const level = line.text.match(/^#+/)[0].length;
            result.push({ type: "heading", level, value: line.text.replace(/^#{1,6}\s+/, "") });
            continue;
        }

        if (/^- \[[ x]\]\s+/.test(line.text)) {
            result.push({ type: "bullet", value: line.text.replace(/^- \[[ x]\]\s+/, "") });
            continue;
        }

        if (/^[-*]\s+/.test(line.text)) {
            result.push({ type: "bullet", value: line.text.replace(/^[-*]\s+/, "") });
            continue;
        }

        result.push({ type: "paragraph", value: line.text });
    }

    // flush unclosed code block
    if (inCodeBlock && codeBlockLines.length > 0) {
        result.push({ type: "code", lang: codeBlockLang, value: codeBlockLines.join("\n") });
    }

    return result;
}

const fluffy = [
    "so that",
    "in order to",
    "to ensure",
    "to make sure",
    "to allow",
    "to avoid",
    "to prevent",
    "to help",
    "to enable",
    "make sure to",
    "be sure to",
    "don't forget to",
    "always remember to",
    "remember to",
    "try to",
    "feel free to",
    "just",
    "simply",
    "easily",
    "quickly",
    "even if nobody asked",
    "before you merge",
    "and then",
    "after that",
    "from there",
    "at that point",
    "the",
    "a",
    "an",
];

function stripContent(text) {
    let s = text
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\s*\([^)]{10,}\)/g, "");

    for (const word of fluffy) {
        const pattern = new RegExp(`\\b${word}\\b\\s*`, "gi");
        s = s.replace(pattern, "");
    }

    return s.replace(/\s{2,}/g, " ").trim().replace(/[.,;]+$/, "");
}

function buildCompressed(nodes) {
    let title = "";
    const sections = [];
    let currentSection = null;

    let headingPath = [];

    for (const node of nodes) {
        if (node.type === "heading" && node.level === 1) {
            title = `[${node.value}]`;
            continue;
        }

        if (node.type === "heading") {
            headingPath = headingPath.slice(0, node.level - 2);
            headingPath.push(node.value.replace(/:$/, ""));

            currentSection = { name: headingPath.join(">"), items: [] };
            sections.push(currentSection);
            continue;
        }

        if (node.type === "code" && currentSection) {
            // \x01 = newline placeholder, \x02 = semicolon placeholder (safe in compressed format)
            const encoded = node.value.replace(/\n/g, "\x01").replace(/;/g, "\x02");
            currentSection.items.push(`§${node.lang}§${encoded}`);
            continue;
        }

        if ((node.type === "bullet" || node.type === "numbered") && currentSection) {
            currentSection.items.push(stripContent(node.value));
            continue;
        }

        if (node.type === "paragraph" && currentSection) {
            currentSection.items.push(stripContent(node.value));
            continue;
        }
    }

    const lines = sections
        .filter(section => section.items.length > 0)
        .map(section => {
            const items = section.items.join(";");
            return `|${section.name}:{${items}}`;
        });

    return [title, ...lines].join("\n");
}

function compressFile(fileContent) {
    const { frontmatter, body } = extractFrontmatter(fileContent);
    const lines = parseFile(body);
    const nodes = normalizeStructure(lines);
    const compressed = buildCompressed(nodes);
    return frontmatter ? `${frontmatter}\n${compressed}` : compressed;
}

module.exports = { compressFile };
