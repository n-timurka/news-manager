'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue("");
  }

  return (
    <div className="relative w-72">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search by title..."
        value={inputValue}
        onChange={handleChange}
        className="pl-8"
      />
      {inputValue && (
        <Button variant="ghost" size={"icon"} className="absolute right-0 top-0" onClick={handleClear}>
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      )}
    </div>
  );
}