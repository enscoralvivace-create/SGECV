import { createCharge } from "@/services/feeService";

import type {
  CreateTripChargesPayload,
  CreateTripChargesResult,
} from "@/types/tripCharge";

interface SupabaseLikeError {
  code?: string;
  message?: string;
}

function isDuplicateChargeError(
  error: unknown,
): boolean {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  const possibleError =
    error as SupabaseLikeError;

  return (
    possibleError.code === "23505" ||
    possibleError.message
      ?.toLowerCase()
      .includes("duplicate key") === true
  );
}

export async function createTripCharges(
  payload: CreateTripChargesPayload,
): Promise<CreateTripChargesResult> {
  const uniqueMemberIds = Array.from(
    new Set(payload.memberIds),
  );

  if (uniqueMemberIds.length === 0) {
    return {
      createdCount: 0,
      skippedCount: 0,
    };
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const memberId of uniqueMemberIds) {
    try {
      await createCharge({
        member_id: memberId,
        fee_type_id: payload.feeTypeId,
        amount: payload.amount,
        billing_period: null,
        due_date: payload.dueDate,
        notes: payload.notes,
        trip_id: payload.tripId,
      });

      createdCount += 1;
    } catch (error) {
      if (isDuplicateChargeError(error)) {
        skippedCount += 1;
        continue;
      }

      console.error(
        "Error creando cargo del viaje:",
        memberId,
        error,
      );

      throw error;
    }
  }

  return {
    createdCount,
    skippedCount,
  };
}