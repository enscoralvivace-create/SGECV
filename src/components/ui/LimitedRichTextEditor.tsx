"use client";

import { useEffect, useRef } from "react";

import {
  prepareRichText,
  sanitizeRichText,
} from "@/utils/richText";

interface LimitedRichTextEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeightClassName?: string;
}

const toolbarActions = [
  { command: "bold", label: "Negrita", content: "B" },
  { command: "italic", label: "Cursiva", content: "I" },
  { command: "insertUnorderedList", label: "Lista con viñetas", content: "• Lista" },
  { command: "insertOrderedList", label: "Lista numerada", content: "1. Lista" },
] as const;

export default function LimitedRichTextEditor({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  minHeightClassName = "min-h-36",
}: LimitedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || editor === document.activeElement) {
      return;
    }

    const prepared = sanitizeRichText(value);

    if (editor.innerHTML !== prepared) {
      editor.innerHTML = prepared;
    }
  }, [value]);

  function publishValue(): void {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    onChange(sanitizeRichText(editor.innerHTML));
  }

  function runCommand(command: string, commandValue?: string): void {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    publishValue();
  }

  function addLink(): void {
    const url = window.prompt("Dirección del enlace (https:// o mailto:)");

    if (!url || !/^(https?:|mailto:)/i.test(url.trim())) {
      return;
    }

    runCommand("createLink", url.trim());
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white transition focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-100">
      <div
        className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2"
        role="toolbar"
        aria-label="Formato de texto"
      >
        {toolbarActions.map((action) => (
          <button
            key={action.command}
            type="button"
            disabled={disabled}
            aria-label={action.label}
            title={action.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(action.command)}
            className={`min-h-10 rounded-lg px-3 text-sm text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
              action.command === "bold"
                ? "font-bold"
                : action.command === "italic"
                  ? "italic"
                  : "font-medium"
            }`}
          >
            {action.content}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled}
          aria-label="Agregar enlace"
          title="Agregar enlace"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
          className="min-h-10 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enlace
        </button>
      </div>

      <div
        ref={editorRef}
        id={id}
        role="textbox"
        aria-label={label}
        aria-multiline="true"
        aria-disabled={disabled}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={publishValue}
        onBlur={(event) => {
          const sanitized = sanitizeRichText(event.currentTarget.innerHTML);
          event.currentTarget.innerHTML = sanitized;
          onChange(sanitized);
        }}
        onPaste={(event) => {
          event.preventDefault();
          const clipboard = event.clipboardData;
          const html = clipboard.getData("text/html");
          const safeContent = html
            ? sanitizeRichText(html)
            : prepareRichText(clipboard.getData("text/plain"));

          document.execCommand("insertHTML", false, safeContent);
          publishValue();
        }}
        className={`${minHeightClassName} max-h-80 overflow-y-auto px-4 py-3 text-base leading-6 text-slate-900 outline-none sm:text-sm [&:empty:before]:pointer-events-none [&:empty:before]:text-slate-400 [&:empty:before]:content-[attr(data-placeholder)] [&_a]:text-sky-700 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6`}
      />
    </div>
  );
}
