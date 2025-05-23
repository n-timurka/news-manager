'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SortAsc } from 'lucide-react';

interface SortSelectProps {
  value: 'latest' | 'oldest';
  onChange: (value: 'latest' | 'oldest') => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue>
          <SortAsc className='md:hidden inline w-4 h-4' />
          <span className="hidden md:inline">Sort By</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">
          Latest First
        </SelectItem>
        <SelectItem value="oldest">
          Oldest First
        </SelectItem>
      </SelectContent>
    </Select>
  );
}