import { Icon } from "@/components/ui/Icon";
import { ToolbarButton } from "@/components/ui/Toolbar";

export type EditorHeaderProps = {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
};

export const EditorHeader = ({
  isSidebarOpen,
  toggleSidebar,
}: EditorHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-white border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
      <div></div>
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <ToolbarButton
            tooltip={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleSidebar}
            active={isSidebarOpen}
            className={isSidebarOpen ? "bg-transparent" : ""}
          >
            <Icon name={isSidebarOpen ? "PanelRightClose" : "PanelRight"} />
          </ToolbarButton>
        </div>
      </div>
      {/* <EditorInfo characters={characters} words={words} collabState={collabState} users={users} /> */}
    </div>
  );
};
