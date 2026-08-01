"use client";

import { Search, X } from "lucide-react";
import { type InputHTMLAttributes } from "react";

interface VivaceSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>,"type"> {
  onClear?: () => void;
}

export default function VivaceSearch({
  value,
  onChange,
  onClear,
  placeholder="Buscar...",
  className="",
  ...props
}: VivaceSearchProps){
  const hasValue = typeof value==="string" && value.length>0;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100 ${className}`}>
      <Search className="h-5 w-5 text-slate-400"/>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none"
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4"/>
        </button>
      )}
    </div>
  );
}