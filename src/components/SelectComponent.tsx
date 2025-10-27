import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectComponentProps = {
  onValueChange: (value: string) => void;
  value: string;
  placeholder?: string;
  options: SelectOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
};

const SelectComponent = ({
  onValueChange,
  value,
  placeholder = "Selecione uma opção",
  options,
  label,
  required,
  disabled = false,
  className,
  size = "md",
}: SelectComponentProps) => {
  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  };

  const validOptions = options.filter((option) => option.value !== "");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select onValueChange={onValueChange} value={value} disabled={disabled}>
        <SelectTrigger className={`${sizeClasses[size]} ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectComponent;
