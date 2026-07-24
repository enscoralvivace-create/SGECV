"use client";

import { useState } from "react";

import type {
  RepertoireFormData,
  RepertoireItem,
} from "@/types/repertoire";

import { emptyRepertoireForm } from "@/utils/repertoire";

export function useRepertoire() {
  const [items, setItems] =
    useState<RepertoireItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState<RepertoireFormData>(
      emptyRepertoireForm,
    );

  const [editingItem, setEditingItem] =
    useState<RepertoireItem | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  return {
    items,
    setItems,

    search,
    setSearch,

    form,
    setForm,

    editingItem,
    setEditingItem,

    isLoading,
    setIsLoading,

    isSaving,
    setIsSaving,

    isFormOpen,
    setIsFormOpen,

    processingId,
    setProcessingId,

    message,
    setMessage,
  };
}