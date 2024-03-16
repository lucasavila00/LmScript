import { Button } from "@/components/ui/button";
import { FC, useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { EditorContext } from "@/editor/context/editor";

export const PopoverNameEditor: FC<{
  name: string;
  onChangeName: (name: string) => void;
}> = ({ name, onChangeName }) => {
  const [editableName, setEditableName] = useState(name);
  const [isEditing, setIsEditing_] = useState(false);
  const editor = useContext(EditorContext);
  const setIsEditing = (isOpen: boolean) => {
    setIsEditing_(isOpen);
    if (!isOpen) {
      onChangeName(editableName);
      setTimeout(() => {
        editor?.commands.focus();
      }, 1);
    }
  };
  return (
    <Popover open={isEditing} onOpenChange={setIsEditing}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="rounded-none rounded-r-md items-center border-0 border-r border-y"
          variant="outline"
        >
          As: {name}
          <Pencil1Icon className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            setIsEditing(false);
          }}
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Name</h4>
              <p className="text-sm text-muted-foreground">Set the name</p>
            </div>
            <input type="submit" hidden />
            <Input
              value={editableName}
              onChange={(e) => {
                setEditableName(e.target.value);
              }}
              className="h-8"
            />
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
