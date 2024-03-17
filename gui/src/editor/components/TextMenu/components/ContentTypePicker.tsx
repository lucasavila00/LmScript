import { Icon } from "../../../../components/ui/Icon";
import { icons } from "lucide-react";
import { Surface } from "../../../../components/ui/Surface";
import {
  DropdownButton,
  DropdownCategoryTitle,
} from "../../../../components/ui/Dropdown";

export type ContentTypePickerOption = {
  label: string;
  id: string;
  type: "option";
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: keyof typeof icons;
};

export type ContentTypePickerCategory = {
  label: string;
  id: string;
  type: "category";
};

export type ContentPickerOptions = Array<
  ContentTypePickerOption | ContentTypePickerCategory
>;

export type ContentTypePickerProps = {
  options: ContentPickerOptions;
};

const isOption = (
  option: ContentTypePickerOption | ContentTypePickerCategory,
): option is ContentTypePickerOption => option.type === "option";
const isCategory = (
  option: ContentTypePickerOption | ContentTypePickerCategory,
): option is ContentTypePickerCategory => option.type === "category";

export const ContentTypePicker = ({ options }: ContentTypePickerProps) => {
  return (
    <Surface className="flex flex-col gap-1 px-2 py-4">
      {options.map((option) => {
        if (isOption(option)) {
          return (
            <DropdownButton
              key={option.id}
              onClick={option.onClick}
              isActive={option.isActive()}
            >
              <Icon name={option.icon} className="w-4 h-4 mr-1" />
              {option.label}
            </DropdownButton>
          );
        } else if (isCategory(option)) {
          return (
            <div className="mt-2 first:mt-0" key={option.id}>
              <DropdownCategoryTitle key={option.id}>
                {option.label}
              </DropdownCategoryTitle>
            </div>
          );
        }
      })}
    </Surface>
  );
};
