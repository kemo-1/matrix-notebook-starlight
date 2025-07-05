import ReactDOM from "react-dom/client";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import React, { useEffect, useRef } from "react";
//@ts-ignore
export default function BlockNoteEditor({ blocks }) {
  const editor = useCreateBlockNote({
    
initialContent: blocks
  });


  return <BlockNoteView  editable={false} editor={editor} />;
}


