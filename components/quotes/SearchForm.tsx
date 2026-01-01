
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    // PERFORMANCE: Debounce search input to 300ms to minimize filtering logic overhead
    const handler = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(handler);
  }, [value, onSearch]);

  return (
    <div className="relative group w-full">
      <Search 
        className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" 
        size={18} 
      />
      <input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Query ledger by identity or ID..."} 
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner"
      />
    </div>
  );
};

export default SearchForm;
