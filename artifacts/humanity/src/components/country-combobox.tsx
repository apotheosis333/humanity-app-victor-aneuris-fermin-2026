import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type CountryLike = {
  code: string;
  name: string;
  flagUrl?: string | null;
};

interface CountryComboboxProps {
  countries: CountryLike[] | undefined;
  value: string;
  onChange: (value: string) => void;
  valueKey?: "code" | "name";
  placeholder?: string;
  triggerClassName?: string;
  dark?: boolean;
}

export function CountryCombobox({
  countries,
  value,
  onChange,
  valueKey = "code",
  placeholder = "Select a country",
  triggerClassName,
  dark = false,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = countries?.find((c) => c[valueKey] === value);
  const flagFor = (c: CountryLike) =>
    c.flagUrl || `https://flagcdn.com/w80/${c.code.toLowerCase()}.png`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            dark &&
              "bg-white/10 border-white/20 text-white hover:bg-white/15 hover:text-white",
            triggerClassName,
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <img
                src={flagFor(selected)}
                alt=""
                className="w-6 h-4 object-cover rounded-sm shrink-0"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            <span className={cn(dark ? "text-white/50" : "text-muted-foreground")}>
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search countries..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries?.map((c) => (
                <CommandItem
                  key={c.code}
                  value={c.name}
                  onSelect={() => {
                    onChange(c[valueKey]);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <img
                    src={flagFor(c)}
                    alt=""
                    className="w-6 h-4 object-cover rounded-sm shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <span className="flex-1 truncate">{c.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === c[valueKey] ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
