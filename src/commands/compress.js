const fs = require("fs");
const path = require("path");
const { compressFile } = require("./compress_helpers");

function compress(file) {
  const inputPath = path.resolve(file);
  const outputPath = inputPath;

  const content = fs.readFileSync(inputPath, "utf8");
  const compressed = compressFile(content);

  fs.writeFileSync(outputPath, compressed, "utf8");

  const originalSize = Buffer.byteLength(content, "utf8");
  const compressedSize = Buffer.byteLength(compressed, "utf8");
  const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

  console.log(`Compressed in-place: ${inputPath}`);
  console.log(`Size: ${originalSize} bytes → ${compressedSize} bytes (${reduction}% reduction)`);
}

module.exports = { compress };
