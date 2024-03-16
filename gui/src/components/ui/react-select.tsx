import { cn } from "@/lib/utils";
import ReactSelect, { ClassNamesConfig, GroupBase } from "react-select";
import CreatableSelect from "react-select/creatable";

const getClassNames = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  classNames: ClassNamesConfig<Option, IsMulti, Group> | undefined,
): ClassNamesConfig<Option, IsMulti, Group> => {
  return {
    ...classNames,
    control: (e) =>
      cn(
        `rounded-md border`,
        `border-input px-1 py-1 text-sm`,
        e.isFocused ? "ring-1 ring-ring" : "",
        classNames?.control?.(e),
      ),
    indicatorSeparator: (e) =>
      cn(
        "bg-gray-100 dark:bg-zinc-800 mr-1 !ml-0",
        classNames?.indicatorSeparator?.(e),
      ),
    dropdownIndicator: (e) =>
      cn(
        "text-gray-400 dark:text-gray-400",
        classNames?.dropdownIndicator?.(e),
      ),
    clearIndicator: (e) =>
      cn("text-gray-400 dark:text-gray-400", classNames?.clearIndicator?.(e)),
    menu: (e) =>
      cn(
        "absolute top-0 mt-1 text-sm z-10 w-full",
        "rounded-md border bg-popover shadow-md overflow-x-hidden",
        classNames?.menu?.(e),
      ),
    placeholder: (e) =>
      cn("text-muted-foreground pl-2", classNames?.placeholder?.(e)),
    option: (e) =>
      cn(
        "cursor-default",
        "rounded-sm py-1.5 m-1 px-2 text-sm outline-none",
        "focus:bg-gray-200 dark:focus:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-800 w-auto",
        classNames?.option?.(e),
      ),
    noOptionsMessage: (e) => cn("p-5", classNames?.noOptionsMessage?.(e)),
    multiValue: (e) =>
      cn(
        "bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded",
        classNames?.multiValue?.(e),
      ),
    input: (e) => cn("text-sm overflow-x-hidden", classNames?.input?.(e)),
    valueContainer: (e) =>
      cn("flex flex-wrap gap-1", classNames?.valueContainer?.(e)),
    container: (p) => cn(classNames?.container?.(p)),
  };
};
export const StyledCreatableReactSelect: typeof CreatableSelect = (props) => {
  return (
    <CreatableSelect
      //   styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      //   menuPortalTarget={document.body}
      {...props}
      classNames={getClassNames(props.classNames)}
      unstyled={true}
    />
  );
};

export const StyledReactSelect: typeof ReactSelect = (props) => {
  return (
    <ReactSelect
      //   styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      //   menuPortalTarget={document.body}
      {...props}
      classNames={getClassNames(props.classNames)}
      unstyled={true}
    />
  );
};
