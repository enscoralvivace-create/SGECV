import { supabase } from "@/lib/supabase";

import type {
  Trip,
  TripFormData,
  TripStatus,
} from "@/types/trip";

interface TripPayload {
  name: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  responsible_member_id: number | null;
  estimated_budget: number | null;
  status: TripStatus;
}

function formToPayload(
  form: TripFormData,
): TripPayload {
  return {
    name: form.name.trim(),
    destination: form.destination.trim(),

    start_date:
      form.startDate || null,

    end_date:
      form.endDate || null,

    description:
      form.description.trim() || null,

    responsible_member_id:
      form.responsibleMemberId
        ? Number(form.responsibleMemberId)
        : null,

    estimated_budget:
      form.estimatedBudget
        ? Number(form.estimatedBudget)
        : null,

    status: form.status,
  };
}

export async function getTrips(): Promise<
  Trip[]
> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Trip[];
}

export async function createTrip(
  form: TripFormData,
): Promise<void> {
  const payload =
    formToPayload(form);

  const { error } = await supabase
    .from("trips")
    .insert(payload);

  if (error) {
    throw error;
  }
}

export async function updateTrip(
  id: string,
  form: TripFormData,
): Promise<void> {
  const payload =
    formToPayload(form);

  const { error } = await supabase
    .from("trips")
    .update({
      ...payload,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateTripStatus(
  id: string,
  status: TripStatus,
): Promise<void> {
  const { error } = await supabase
    .from("trips")
    .update({
      status,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}