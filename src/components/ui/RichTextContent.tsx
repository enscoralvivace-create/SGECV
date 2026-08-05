"use client";

import { useEffect, useState } from "react";

import {
  richTextToPlainText,
  sanitizeRichText,
} from "@/utils/richText";

interface RichTextContentProps {
  content: string;
  className?: string;
}

export default function RichTextContent({
  content,
  className = "",
}: RichTextContentProps) {
  const [safeHtml, setSafeHtml] = useState<string | null>(null);

  useEffect(() => {
    setSafeHtml(sanitizeRichText(content));
  }, [content]);

  const styles = `leading-7 text-slate-700 [&_a]:font-medium [&_a]:text-sky-700 [&_a]:underline [&_a]:underline-offset-2 [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 ${className}`;

  if (safeHtml === null) {
    return <p className={`whitespace-pre-wrap ${styles}`}>{richTextToPlainText(content)}</p>;
  }

  return (
    <div
      className={styles}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
