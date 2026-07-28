"use client";

import { useState } from "react";

import {
  updateRepertoireResources,
  type RepertoireResourcesData,
} from "@/services/repertoireService";

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

  const [
    isSavingResources,
    setIsSavingResources,
  ] = useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  async function saveResources(
    id: number,
    resources: RepertoireResourcesData,
  ): Promise<boolean> {
    setIsSavingResources(true);
    setMessage("");

    try {
      await updateRepertoireResources(
        id,
        resources,
      );

      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            score_url:
              resources.scoreUrl.trim() ||
              null,
            audio_url:
              resources.audioUrl.trim() ||
              null,
            video_url:
              resources.videoUrl.trim() ||
              null,
            translation:
              resources.translation.trim() ||
              null,
            pronunciation:
              resources.pronunciation.trim() ||
              null,
            director_notes:
              resources.directorNotes.trim() ||
              null,
          };
        }),
      );

      setMessage(
        "Recursos guardados correctamente.",
      );

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No fue posible guardar los recursos.";

      setMessage(errorMessage);

      return false;
    } finally {
      setIsSavingResources(false);
    }
  }

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

    isSavingResources,
    setIsSavingResources,

    isFormOpen,
    setIsFormOpen,

    processingId,
    setProcessingId,

    message,
    setMessage,

    saveResources,
  };
}