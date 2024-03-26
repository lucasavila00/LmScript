import { FC, useEffect } from "react";
import { Icon } from "../../components/ui/Icon";
import { ToolbarButton } from "../../components/ui/Toolbar";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "../../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export type FileManagerProps = {
  filePath: string | undefined;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveAsFile: () => void;
};
const getFileNameFromPath = (path: string | undefined) => {
  if (path == null) {
    return "Untitled";
  }
  // split for unix and windows
  return path.split(/[\\/]/).pop();
};
export const EditorHeader: FC<{
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  isExecuting: boolean;
  toggleExecuting: () => void;
  fileManagement: FileManagerProps;
  onExportToTasks: () => void;
}> = ({
  onExportToTasks,
  isRightSidebarOpen,
  toggleRightSidebar,
  isExecuting,
  toggleExecuting,
  fileManagement,
}) => {
  useEffect(() => {
    const keyboardListener = (e: KeyboardEvent) => {
      if (fileManagement.filePath != null && e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fileManagement.onSaveFile();
        return;
      }

      if (e.key === "o" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        fileManagement.onOpenFile();
        return;
      }
    };

    window.addEventListener("keydown", keyboardListener);

    return () => {
      window.removeEventListener("keydown", keyboardListener);
    };
  }, [fileManagement]);
  return (
    <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-white border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <ToolbarButton
            tooltip={isExecuting ? "Edit Mode" : "Execute"}
            onClick={toggleExecuting}
            active={isExecuting}
            className={isExecuting ? "bg-transparent" : ""}
          >
            <Icon name={"Play"} />
          </ToolbarButton>
        </div>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              {getFileNameFromPath(fileManagement.filePath)}{" "}
              {fileManagement.filePath == null ? " *" : ""} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Manage Files</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={fileManagement.onOpenFile}>
                Open
                <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
              </DropdownMenuItem>
              {fileManagement.filePath != null ? (
                <DropdownMenuItem onClick={fileManagement.onSaveFile}>
                  Save
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              ) : (
                <></>
              )}
              <DropdownMenuItem onClick={fileManagement.onSaveAsFile}>
                Save as
                {/* <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportToTasks}>Export to Tasks</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <ToolbarButton
            tooltip={isRightSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleRightSidebar}
            active={isRightSidebarOpen}
            className={isRightSidebarOpen ? "bg-transparent" : ""}
          >
            <Icon name={isRightSidebarOpen ? "PanelRightClose" : "PanelRight"} />
          </ToolbarButton>
        </div>
      </div>
      {/* <EditorInfo characters={characters} words={words} collabState={collabState} users={users} /> */}
    </div>
  );
};
