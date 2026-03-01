// utils/parsePptx.js
import JSZip from "jszip";

// ── Compress extracted images so they fit in localStorage ──
async function compressImage(base64DataUrl, maxWidth = 800, maxHeight = 600, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(null);
    img.src = base64DataUrl;
  });
}

// ── Filter out PowerPoint placeholder text ──
const PLACEHOLDER_TEXTS = [
  "click to add title",
  "click to add text",
  "click to add subtitle",
  "click to edit master title style",
  "click to edit master text styles",
  "click to add notes",
  "click to edit master subtitle style",
];

function isPlaceholder(text) {
  return PLACEHOLDER_TEXTS.includes(text.toLowerCase().trim());
}

// ══════════════════════════════════════════════════════
// 🚀 MAIN PARSER — Extracts slides from a .pptx file
// ══════════════════════════════════════════════════════
export async function parsePptxFile(file) {
  const zip = await JSZip.loadAsync(file);

  // XML Namespaces used in PPTX
  const P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main";
  const A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
  const R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  // ── Find all slide XML files and sort by number ──
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.match(/slide(\d+)/)[1]);
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error("No slides found in the uploaded file.");
  }

  const domParser = new DOMParser();
  const slides = [];

  for (const slideFile of slideFiles) {
    const slideNum = slideFile.match(/slide(\d+)/)[1];
    const xml = await zip.files[slideFile].async("text");
    const doc = domParser.parseFromString(xml, "application/xml");

    let title = "";
    let contentLines = [];
    let imageUrl = null;

    // ── 1. Parse relationship file to find image references ──
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const imageRels = {};

    if (zip.files[relsPath]) {
      try {
        const relsXml = await zip.files[relsPath].async("text");
        const relsDoc = domParser.parseFromString(relsXml, "application/xml");
        const relationships = relsDoc.getElementsByTagName("Relationship");

        for (let i = 0; i < relationships.length; i++) {
          const rel = relationships[i];
          const rId = rel.getAttribute("Id");
          const target = rel.getAttribute("Target") || "";
          const type = rel.getAttribute("Type") || "";

          if (type.includes("image")) {
            let imgPath;
            if (target.startsWith("../")) {
              imgPath = "ppt/" + target.substring(3);
            } else if (target.startsWith("/")) {
              imgPath = target.substring(1);
            } else {
              imgPath = "ppt/slides/" + target;
            }
            imageRels[rId] = imgPath;
          }
        }
      } catch (e) {
        console.warn(`Failed to parse rels for slide ${slideNum}:`, e);
      }
    }

    // ── 2. Extract text from all shapes ──
    const shapes = doc.getElementsByTagNameNS(P_NS, "sp");

    for (let s = 0; s < shapes.length; s++) {
      const shape = shapes[s];

      // Check placeholder type (title, subtitle, body, etc.)
      const phElements = shape.getElementsByTagNameNS(P_NS, "ph");
      let phType = "";
      if (phElements.length > 0) {
        phType = (phElements[0].getAttribute("type") || "").toLowerCase();
      }

      // Extract paragraphs from this shape
      const pElements = shape.getElementsByTagNameNS(A_NS, "p");
      const paragraphs = [];

      for (let p = 0; p < pElements.length; p++) {
        const tElements = pElements[p].getElementsByTagNameNS(A_NS, "t");
        let paraText = "";
        for (let t = 0; t < tElements.length; t++) {
          paraText += tElements[t].textContent;
        }
        const trimmed = paraText.trim();
        if (trimmed && !isPlaceholder(trimmed)) {
          paragraphs.push(trimmed);
        }
      }

      if (paragraphs.length === 0) continue;

      // Classify: title vs content
      if ((phType === "title" || phType === "ctrtitle") && !title) {
        title = paragraphs.join(" ");
      } else if (phType === "subtitle") {
        contentLines.unshift(...paragraphs);
      } else {
        contentLines.push(...paragraphs);
      }
    }

    // Also check group shapes for text
    const groupShapes = doc.getElementsByTagNameNS(P_NS, "grpSp");
    for (let g = 0; g < groupShapes.length; g++) {
      const pElements = groupShapes[g].getElementsByTagNameNS(A_NS, "p");
      for (let p = 0; p < pElements.length; p++) {
        const tElements = pElements[p].getElementsByTagNameNS(A_NS, "t");
        let paraText = "";
        for (let t = 0; t < tElements.length; t++) {
          paraText += tElements[t].textContent;
        }
        const trimmed = paraText.trim();
        if (trimmed && !isPlaceholder(trimmed) && trimmed !== title && !contentLines.includes(trimmed)) {
          contentLines.push(trimmed);
        }
      }
    }

    // ── 3. Extract first image from the slide ──
    const blips = doc.getElementsByTagNameNS(A_NS, "blip");
    for (let b = 0; b < blips.length && !imageUrl; b++) {
      let embed = blips[b].getAttributeNS(R_NS, "embed");
      if (!embed) embed = blips[b].getAttribute("r:embed");

      if (embed && imageRels[embed]) {
        const imgPath = imageRels[embed];
        const ext = imgPath.split(".").pop().toLowerCase();

        // Skip unsupported formats
        if (["emf", "wmf", "tiff", "tif"].includes(ext)) continue;

        const imgFile = zip.files[imgPath];
        if (imgFile) {
          try {
            const imgBase64 = await imgFile.async("base64");
            const mimeTypes = {
              png: "image/png",
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              gif: "image/gif",
              svg: "image/svg+xml",
              webp: "image/webp",
              bmp: "image/bmp",
            };
            const mime = mimeTypes[ext] || "image/png";
            const rawDataUrl = `data:${mime};base64,${imgBase64}`;

            // Compress to save storage space
            const compressed = await compressImage(rawDataUrl);
            if (compressed) imageUrl = compressed;
          } catch (e) {
            console.warn(`Failed to extract image from slide ${slideNum}:`, e);
          }
        }
      }
    }

    // ── 4. Fallback: use first content line as title ──
    if (!title && contentLines.length > 0) {
      title = contentLines.shift();
    }

    // Only add slide if it has content
    if (title || contentLines.length > 0) {
      slides.push({
        title: title || `Slide ${slides.length + 1}`,
        content: contentLines.join("\n"),
        imageUrl,
      });
    }
  }

  if (slides.length === 0) {
    throw new Error("No text content found in the uploaded presentation.");
  }

  return slides;
}