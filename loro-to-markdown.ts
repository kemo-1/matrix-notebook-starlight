import { promises as fs, type PathLike } from "fs";
import { LoroDoc, LoroMap, LoroText, LoroTree } from "loro-crdt";
import path from "path";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { createNodeFromLoroObj } from "loro-prosemirror";
const editor = ServerBlockNoteEditor.create();

// Convert to HTML
async function loadSnapshot(filePath: PathLike | fs.FileHandle) {
  try {
    // Read file as buffer
    const buffer = await fs.readFile(filePath);

    // Convert buffer to Uint8Array
    const snapshot = new Uint8Array(buffer);

    return snapshot;
  } catch (error) {
    console.error("Error loading file:", error);
    throw error;
  }
}

// Usage
await loadSnapshot("./MyNoteBook.bin").then((snapshot) => {
  let doc = LoroDoc.fromSnapshot(snapshot);
  let tree = doc.getTree("tree");
  let data = tree.toArray()[0];

  // Create folders and files recursively
  async function createStructure(
    node: {
      id: any;
      parent?: `${number}@${number}`;
      index?: number;
      fractionalIndex?: string;
      meta: LoroMap;
      children: any;
    },
    basePath = "./"
  ) {
    if (!node.meta || !node.meta.get("name")) {
      console.warn(
        "Skipping node with missing meta or name:",
        node.meta.entries()
      );
      return;
    }
    let name = node.meta.get("name") as string;
    let trimmed_name = name.trim();

    let name_slug = trimmed_name.replace(/\s+/g, "-");

    const currentPath = path.join(basePath, name_slug);

    if (node.meta.get("item_type") === "folder") {
      try {
        await fs.mkdir(currentPath, { recursive: true });
        console.log(`Created folder: ${currentPath}`);

        // Process children after creating the folder
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            await createStructure(child, currentPath);
          }
        }
      } catch (error) {
        console.error(`Error creating folder ${currentPath}:`, error);
      }
    } else {
      try {
        // Ensure parent directory exists before creating file
        await fs.mkdir(path.dirname(currentPath), { recursive: true });
        const filePath = currentPath + ".md";

        let container = doc.getMap(node.id);

        const schema = editor.editor.pmSchema;

        let prosemirrorNode = createNodeFromLoroObj(
          schema, //@ts-ignore
          container,
          new Map()
        );
        // console.log(test);
        let name = node.meta.get("name") as string;
        let trimmed_name = name.trim();
        let blocks = editor._prosemirrorNodeToBlocks(prosemirrorNode);
        //@ts-ignore
        let html = await editor.blocksToFullHTML(blocks);

        await fs.writeFile(
          filePath,
          `---
title: ${trimmed_name}      
slug: ${
            //@ts-ignore
            trimmed_name.toLowerCase().replace(/\s+/g, "-")
          }      

---

<div class="bn-container">
<divclass="bn-default-styles">
${html
  // .replace(
  //   /<div class="bn-block-content" data-content-type="toggleListItem">\s*<p class="([^"]*)">(.*?)<\/p>\s*<\/div>\s*(<div class="bn-block-group"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/gs,
  //   `<details>\n  <summary class="$1">$2</summary>\n$3\n</details>`
  // )
  .replace(
    /<h([1-6])([^>]*)>(.*?)<\/h\1>/g,
    (_, level, attrs, content) =>
      `<span${attrs}>\n\n${"#".repeat(level)} ${content}\n\n</span>`
  )}
  </div>
  </div>
          
        
          
          


`
        );

        console.log(`Created file: ${filePath}`);
      } catch (error) {
        console.error(
          `Error creating file for node ${node.meta.get("name")}:`,
          error
        );
      }
    }
  }

  // Start creation from root children, ignoring root node
  (async () => {
    try {
      if (data.children) {
        for (const child of data.children) {
          await createStructure(child, "./src/content/docs/");
        }
        console.log("Folder structure created successfully!");
      } else {
        console.log("No children found in data structure");
      }
    } catch (error) {
      console.error("Error creating folder structure:", error);
    }
  })();
});
