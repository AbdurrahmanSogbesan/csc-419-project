import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DayPickerSingleProps } from "react-day-picker";
import { FormControl, FormField, FormItem, FormLabel } from "./form";
import { Control, FieldValues } from "react-hook-form";

type DatePickerProps = {
  name: string;
  label?: string;
  calendarProps?: Omit<Partial<DayPickerSingleProps>, "onSelect">;
  control: Control<FieldValues>;
  className?: string;
};

export function DatePicker({
  name,
  label,
  control,
  calendarProps,
  className,
}: DatePickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon />
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className={"w-auto p-0"} align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
                {...calendarProps}
              />
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}
