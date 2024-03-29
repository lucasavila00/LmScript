import { Button } from "../../components/ui/button";
import { FC, useContext, useState } from "react";
import { Input } from "../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { EditorContext } from "../context/editor";
import { ChevronDownIcon } from "lucide-react";

export const PopoverMaxTokens: FC<{
  max: number;
  onChangeMax: (max: number) => void;
}> = ({ max, onChangeMax }) => {
  const [editableMax, setEditableMax] = useState(max);
  const [isEditing, setIsEditing_] = useState(false);
  const editor = useContext(EditorContext);
  const setIsEditing = (isOpen: boolean) => {
    setIsEditing_(isOpen);
    if (!isOpen) {
      onChangeMax(editableMax);
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
          className="rounded-none items-center border-0 border-r border-y"
          variant="outline"
        >
          <span className="text-muted-foreground">Max:</span>&nbsp;{max}
          <ChevronDownIcon className="h-4 w-4 shrink-0 ml-1 text-muted-foreground" />
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
              <h4 className="font-medium leading-none">Max Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Set the maximum tokens the model will generate
              </p>
            </div>
            <input type="submit" hidden />
            <Input
              value={editableMax}
              type="number"
              step="1"
              onChange={(e) => {
                setEditableMax(Math.floor(Number(e.target.value)));
              }}
              className="h-8"
            />
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
