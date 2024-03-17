import { Icon } from "../../components/ui/Icon";
import { ToolbarButton } from "../../components/ui/Toolbar";

export type EditorHeaderProps = {
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;

  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
};

export const EditorHeader = ({
  isRightSidebarOpen,
  toggleRightSidebar,
  isLeftSidebarOpen,
  toggleLeftSidebar,
}: EditorHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-white border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <ToolbarButton
            tooltip={isLeftSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleLeftSidebar}
            active={isLeftSidebarOpen}
            className={isLeftSidebarOpen ? "bg-transparent" : ""}
          >
            <Icon name={"Play"} />
          </ToolbarButton>
        </div>
      </div>
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <ToolbarButton
            tooltip={isRightSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleRightSidebar}
            active={isRightSidebarOpen}
            className={isRightSidebarOpen ? "bg-transparent" : ""}
          >
            <Icon
              name={isRightSidebarOpen ? "PanelRightClose" : "PanelRight"}
            />
          </ToolbarButton>
        </div>
      </div>
      {/* <EditorInfo characters={characters} words={words} collabState={collabState} users={users} /> */}
    </div>
  );
};
