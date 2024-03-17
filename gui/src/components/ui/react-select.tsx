import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";
import { ReactNode, createContext, useContext } from "react";
import ReactSelect, {
  ClassNamesConfig,
  ControlProps,
  GroupBase,
  SelectComponentsConfig,
  StylesConfig,
  components as reactSelectComponents,
} from "react-select";
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
    container: (p) => cn("!min-h-8", classNames?.container?.(p)),
    control: (e) =>
      cn(
        `rounded-md border !min-h-8`,
        `border-input px-1 pl-2 pr-1 text-sm bg-background shadow-sm`,
        e.isFocused ? "ring-1 ring-ring" : "",
        classNames?.control?.(e),
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
        // ""
        classNames?.multiValue?.(e),
      ),
    input: (e) => cn("text-sm overflow-x-hidden", classNames?.input?.(e)),
    valueContainer: (e) => cn("flex gap-1", classNames?.valueContainer?.(e)),
  };
};
const getStyles = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  styles: StylesConfig<Option, IsMulti, Group> | undefined,
): StylesConfig<Option, IsMulti, Group> => ({
  ...styles,
  menu: ({ width, ...css }) => ({
    ...styles?.menu,
    ...css,
    width: "max-content",
    minWidth: "100%",
  }),
});

export const ControlLabelContext = createContext<ReactNode>("");

function CustomControl<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({ children, ...rest }: ControlProps<Option, IsMulti, Group>) {
  const label = useContext(ControlLabelContext);
  return (
    <>
      <reactSelectComponents.Control {...rest}>
        {label}
        {children}
      </reactSelectComponents.Control>
    </>
  );
}
const getComponents = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  components: SelectComponentsConfig<Option, IsMulti, Group> | undefined,
): SelectComponentsConfig<Option, IsMulti, Group> => {
  return {
    ...components,
    IndicatorSeparator: () => <></>,
    DropdownIndicator: () => (
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    ),
    Control: CustomControl,
  };
};

export const StyledCreatableReactSelect: typeof CreatableSelect = (props) => {
  return (
    <CreatableSelect
      // styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      //   menuPortalTarget={document.body}
      {...props}
      classNames={getClassNames(props.classNames)}
      styles={getStyles(props.styles)}
      components={getComponents(props.components)}
      blurInputOnSelect={true}
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
      styles={getStyles(props.styles)}
      components={getComponents(props.components)}
      blurInputOnSelect={true}
      unstyled={true}
    />
  );
};
