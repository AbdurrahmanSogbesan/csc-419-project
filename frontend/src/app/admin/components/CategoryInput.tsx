import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategoryInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  className?: string;
}

export const CategoryInput = <T extends FieldValues>({
  control,
  name,
  label,
  className,
}: CategoryInputProps<T>) => {
  const [inputValue, setInputValue] = useState("");

  const { field, fieldState } = useController({
    name,
    control,
  });

  const handleAddCategory = () => {
    const category = inputValue.trim().toLowerCase();
    if (category && !field.value.includes(category)) {
      field.onChange([...field.value, category]);
      setInputValue("");
    } else {
      toast.error(
        !inputValue ? "Category is required" : "Category already in the list",
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    field.onChange(
      field.value.filter((cat: string) => cat !== categoryToRemove),
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none text-slate-900">
          {label}
        </label>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            containerClassName="w-full"
            placeholder="Type a category and press Enter"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" onClick={handleAddCategory} variant="default">
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {field.value.map((category: string) => (
            <Badge
              key={category}
              variant="default"
              className="flex items-center gap-1 capitalize"
            >
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="hover:text-destructive"
              >
                <X size={14} />
              </button>
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {fieldState.error && (
        <p className="text-sm text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
};
