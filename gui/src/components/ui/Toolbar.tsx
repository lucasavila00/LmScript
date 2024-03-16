import { ButtonHTMLAttributes, HTMLProps, forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Surface } from "./Surface";
import Tooltip from "./Tooltip";

export type ToolbarWrapperProps = {
  shouldShowContent?: boolean;
  isVertical?: boolean;
} & HTMLProps<HTMLDivElement>;

export const ToolbarWrapper = forwardRef<HTMLDivElement, ToolbarWrapperProps>(
  (
    {
      shouldShowContent = true,
      children,
      isVertical = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const toolbarClassName = cn(
      "text-black inline-flex h-full leading-none gap-0.5",
      isVertical ? "flex-col p-2" : "flex-row p-1 items-center",
      className,
    );

    return (
      shouldShowContent && (
        <Surface className={toolbarClassName} {...rest} ref={ref}>
          {children}
        </Surface>
      )
    );
  },
);

ToolbarWrapper.displayName = "Toolbar";

export type ToolbarDividerProps = {
  horizontal?: boolean;
} & HTMLProps<HTMLDivElement>;

export const ToolbarDivider = forwardRef<HTMLDivElement, ToolbarDividerProps>(
  ({ horizontal, className, ...rest }, ref) => {
    const dividerClassName = cn(
      "bg-neutral-200 dark:bg-neutral-800",
      horizontal
        ? "w-full min-w-[1.5rem] h-[1px] my-1 first:mt-0 last:mt-0"
        : "h-full min-h-[1.5rem] w-[1px] mx-1 first:ml-0 last:mr-0",
      className,
    );

    return <div className={dividerClassName} ref={ref} {...rest} />;
  },
);

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "ghost";
type ButtonSize = "medium" | "small" | "icon" | "iconSmall";

type ButtonProps = {
  variant?: ButtonVariant;
  active?: boolean;
  activeClassname?: string;
  buttonSize?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      active,
      buttonSize = "medium",
      children,
      disabled,
      variant = "primary",
      className,
      activeClassname,
      ...rest
    },
    ref,
  ) => {
    const buttonClassName = cn(
      "flex group items-center justify-center border border-transparent gap-2 text-sm font-semibold rounded-md disabled:opacity-50 whitespace-nowrap",

      variant === "primary" &&
        cn(
          "text-white bg-black border-black dark:text-black dark:bg-white dark:border-white",
          !disabled &&
            !active &&
            "hover:bg-neutral-800 active:bg-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-300",
          active && cn("bg-neutral-900 dark:bg-neutral-300", activeClassname),
        ),

      variant === "secondary" &&
        cn(
          "text-neutral-900 dark:text-white",
          !disabled &&
            !active &&
            "hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-900 dark:active:bg-neutral-800",
          active && "bg-neutral-200 dark:bg-neutral-800",
        ),

      variant === "tertiary" &&
        cn(
          "bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white dark:border-neutral-900",
          !disabled &&
            !active &&
            "hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
          active && cn("bg-neutral-200 dark:bg-neutral-800", activeClassname),
        ),

      variant === "ghost" &&
        cn(
          "bg-transparent border-transparent text-neutral-500 dark:text-neutral-400",
          !disabled &&
            !active &&
            "hover:bg-black/5 hover:text-neutral-700 active:bg-black/10 active:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-neutral-300 dark:active:text-neutral-200",
          active &&
            cn(
              "bg-black/10 text-neutral-800 dark:bg-white/20 dark:text-neutral-200",
              activeClassname,
            ),
        ),

      buttonSize === "medium" && "py-2 px-3",
      buttonSize === "small" && "py-1 px-2",
      buttonSize === "icon" && "w-8 h-8",
      buttonSize === "iconSmall" && "w-6 h-6",

      className,
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={buttonClassName}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

ToolbarDivider.displayName = "Toolbar.Divider";

export type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  activeClassname?: string;
  tooltip?: string;
  tooltipShortcut?: string[];
  buttonSize?: ButtonProps["buttonSize"];
  variant?: ButtonProps["variant"];
};

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      children,
      buttonSize = "icon",
      variant = "ghost",
      className,
      tooltip,
      tooltipShortcut,
      activeClassname,
      ...rest
    },
    ref,
  ) => {
    const buttonClass = cn("gap-1 min-w-[2rem] px-2 w-auto", className);

    const content = (
      <Button
        activeClassname={activeClassname}
        className={buttonClass}
        variant={variant}
        buttonSize={buttonSize}
        ref={ref}
        {...rest}
      >
        {children}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip title={tooltip} shortcut={tooltipShortcut}>
          {content}
        </Tooltip>
      );
    }

    return content;
  },
);

ToolbarButton.displayName = "ToolbarButton";
