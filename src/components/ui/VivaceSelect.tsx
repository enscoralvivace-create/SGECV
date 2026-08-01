"use client";

import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export interface VivaceSelectOption {
  value: string;
  label: string;
}

interface VivaceSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: VivaceSelectOption[];
  leftIcon?: ReactNode;
}

const VivaceSelect = forwardRef<HTMLSelectElement, VivaceSelectProps>(function VivaceSelect(
{label,description,error,options,leftIcon,className="",id,...props},ref){
 const generated=useId();
 const selectId=id??generated;
 const helpId=`${selectId}-help`;
 return (
  <div className="space-y-2">
   {label && <label htmlFor={selectId} className="text-sm font-semibold text-slate-700">{label}</label>}
   {description && <p id={helpId} className="text-xs text-slate-500">{description}</p>}
   <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100">
    {leftIcon && <span className="text-slate-400">{leftIcon}</span>}
    <select ref={ref} id={selectId} aria-invalid={!!error} aria-describedby={description?helpId:undefined}
      className={`flex-1 appearance-none bg-transparent outline-none ${className}`} {...props}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="h-4 w-4 text-slate-400"/>
   </div>
   {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
  </div>
 );
});
export default VivaceSelect;