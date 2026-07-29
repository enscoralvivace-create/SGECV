import { createCharge } from "@/services/feeService";

import type {
  CreateTripChargesPayload,
  CreateTripChargesResult,
} from "@/types/tripCharge";

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

  const tripReference =
    `Viaje: ${payload.tripId}`;

  const notes = payload.notes
    ? `${tripReference}\n${payload.notes}`
    : tripReference;

  for (const memberId of uniqueMemberIds) {
    try {
      await createCharge({
        member_id: memberId,
        fee_type_id: payload.feeTypeId,
        amount: payload.amount,
        billing_period: null,
        due_date: payload.dueDate,
        notes,
      });

      createdCount += 1;
    } catch (error) {
      console.error(
        "Error creando cargo del viaje:",
        memberId,
        error,
      );

      skippedCount += 1;
    }
  }

  return {
    createdCount,
    skippedCount,
  };
}