function parseCompressed(content) {
    let frontmatter = null;
    let rest = content;

    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\n---\r?\n([\s\S]*)$/);
    if (fmMatch) {
        frontmatter = `---\n${fmMatch[1]}\n---`;
        rest = fmMatch[2];
    }

    const result = { frontmatter, title: "", sections: [] };
    const entries = rest.split(/\n(?=\||\[)/);

    for (const entry of entries) {
        const trimmed = entry.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            result.title = trimmed.slice(1, -1);
            continue;
        }

        if (!trimmed.startsWith("|")) continue;

        const body = trimmed.slice(1);

        const match = body.match(/^(.+?):\{(.+)\}$/s);
        if (match) {
            result.sections.push({
                name: match[1].trim(),
                items: match[2].split(";").map(i => i.trim()).filter(Boolean),
            });
            continue;
        }

        result.sections.push({ name: body.trim(), items: [] });
    }

    return result;
}

function buildPretty(parsed) {
    const blocks = [];
    let lastPath = [];

    if (parsed.frontmatter) {
        blocks.push(parsed.frontmatter);
    }

    if (parsed.title) {
        blocks.push(`# ${parsed.title}`);
    }

    for (const section of parsed.sections) {
        const parts = section.name.split(">");

        for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i] !== lastPath[i]) {
                // Only h2 gets a blank line before it
                const prefix = i === 0 ? "\n" : "";
                blocks.push(`${prefix}${"#".repeat(i + 2)} ${parts[i]}`);
            }
        }

        const depth = parts.length;
        const prefix = depth === 1 ? "\n" : "";
        blocks.push(`${prefix}${"#".repeat(depth + 1)} ${parts[parts.length - 1]}`);

        lastPath = parts;

        if (section.items.length > 0) {
            const itemLines = section.items.map(item => {
                if (item.startsWith("§")) {
                    const rest = item.slice(1);
                    const sepIdx = rest.indexOf("§");
                    const lang = rest.slice(0, sepIdx);
                    const code = rest.slice(sepIdx + 1).replace(/\x01/g, "\n").replace(/\x02/g, ";");
                    return `\`\`\`${lang}\n${code}\n\`\`\``;
                }
                return `- ${item}`;
            });
            blocks.push(itemLines.join("\n"));
        }
    }

    return blocks.join("\n");
}

module.exports = { parseCompressed, buildPretty };
