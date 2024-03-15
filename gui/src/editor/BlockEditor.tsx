import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import "./styles/index.css";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { useRef } from "react";

export const BlockEditor = () => {
  const { editor, characterCount: _ } = useBlockEditor();
  const menuContainerRef = useRef(null);

  if (editor == null) {
    // throw new Error("Editor is null");
    return <></>;
  }

  return (
    <div className="flex h-full w-full" ref={menuContainerRef}>
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        {/* <EditorHeader
      characters={characterCount.characters()}
      collabState={collabState}
      users={displayedUsers}
      words={characterCount.words()}
      isSidebarOpen={leftSidebar.isOpen}
      toggleSidebar={leftSidebar.toggle}
    /> */}
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <ContentItemMenu editor={editor} />
        {/* 
    <LinkMenu editor={editor} appendTo={menuContainerRef} />
    <TextMenu editor={editor} />
    <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
    <TableRowMenu editor={editor} appendTo={menuContainerRef} />
    <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
    <ImageBlockMenu editor={editor} appendTo={menuContainerRef} /> */}
      </div>
    </div>
  );
};
