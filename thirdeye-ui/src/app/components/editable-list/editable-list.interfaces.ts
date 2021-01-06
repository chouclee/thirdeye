import { ValidationResult } from "../../utils/validation-util/validation-util";

export interface EditableListProps {
    list?: string[];
    inputLabel: string;
    buttonLabel: string;
    validateFn?: (listItem: string) => ValidationResult; // Function that shall validate list item
    onChange?: (list: string[]) => void;
}