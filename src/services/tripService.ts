import { supabase } from "@/lib/supabase";

import type {
  Trip,
  TripFormData,
  TripStatus,
} from "@/types/trip";

import type {
  TripFinancialSummary,
  TripMemberFinancialStatus,
} from "@/types/tripFinancial";

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

interface TripChargePaymentRow {
  amount: number | string | null;
}

interface TripChargeRow {
  id: string;
  member_id: number;
  fee_type_id: string;
  amount: number | string | null;
  status: string;
  payments:
    | TripChargePaymentRow[]
    | null;
}

interface TripMemberRow {
  id: number;
  name: string;
  last_name: string | null;
}

interface TripFeeTypeRow {
  id: string;
  name: string;
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

function getMemberFinancialStatus(
  totalCharged: number,
  totalPaid: number,
): TripMemberFinancialStatus {
  if (
    totalCharged > 0 &&
    totalPaid >= totalCharged
  ) {
    return "paid";
  }

  if (totalPaid > 0) {
    return "partial";
  }

  return "pending";
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

export async function getTripById(
  tripId: string,
): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error) {
    throw error;
  }

  return data as Trip;
}

export async function getTripFinancialSummary(
  tripId: string,
): Promise<TripFinancialSummary> {
  const {
    data: tripData,
    error: tripError,
  } = await supabase
    .from("trips")
    .select("estimated_budget")
    .eq("id", tripId)
    .single();

  if (tripError) {
    throw tripError;
  }

  const {
    data: chargesData,
    error: chargesError,
  } = await supabase
    .from("member_charges")
    .select(`
      id,
      member_id,
      fee_type_id,
      amount,
      status,
      payments (
        amount
      )
    `)
    .eq("trip_id", tripId);

  if (chargesError) {
    throw chargesError;
  }

  const validCharges = (
    (chargesData ?? []) as TripChargeRow[]
  ).filter(
    (charge) =>
      charge.status !== "cancelled",
  );

  const memberIds = [
    ...new Set(
      validCharges.map(
        (charge) => charge.member_id,
      ),
    ),
  ];

  const feeTypeIds = [
    ...new Set(
      validCharges.map(
        (charge) => charge.fee_type_id,
      ),
    ),
  ];

  let membersData: TripMemberRow[] = [];

  if (memberIds.length > 0) {
    const {
      data,
      error: membersError,
    } = await supabase
      .from("members")
      .select("id, name, last_name")
      .in("id", memberIds);

    if (membersError) {
      throw membersError;
    }

    membersData =
      (data ?? []) as TripMemberRow[];
  }

  let feeTypesData: TripFeeTypeRow[] = [];

  if (feeTypeIds.length > 0) {
    const {
      data,
      error: feeTypesError,
    } = await supabase
      .from("fee_types")
      .select("id, name")
      .in("id", feeTypeIds);

    if (feeTypesError) {
      throw feeTypesError;
    }

    feeTypesData =
      (data ?? []) as TripFeeTypeRow[];
  }

  const memberNames = new Map(
    membersData.map((member) => {
      const fullName = [
        member.name,
        member.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return [
        member.id,
        fullName ||
          `Integrante ${member.id}`,
      ];
    }),
  );

  const feeTypeNames = new Map(
    feeTypesData.map((feeType) => [
      feeType.id,
      feeType.name,
    ]),
  );

  const members =
    validCharges.map((charge) => {
      const totalCharged = Number(
        charge.amount ?? 0,
      );

      const totalPaid = (
        charge.payments ?? []
      ).reduce(
        (total, payment) =>
          total +
          Number(payment.amount ?? 0),
        0,
      );

      const totalPending = Math.max(
        totalCharged - totalPaid,
        0,
      );

      return {
        chargeId: charge.id,
        memberId: charge.member_id,

        memberName:
          memberNames.get(
            charge.member_id,
          ) ??
          `Integrante ${charge.member_id}`,

        feeTypeName:
          feeTypeNames.get(
            charge.fee_type_id,
          ) ??
          "Cargo de viaje",

        totalCharged,
        totalPaid,
        totalPending,

        status:
          getMemberFinancialStatus(
            totalCharged,
            totalPaid,
          ),
      };
    });

  members.sort(
    (firstItem, secondItem) => {
      const nameComparison =
        firstItem.memberName.localeCompare(
          secondItem.memberName,
          "es",
        );

      if (nameComparison !== 0) {
        return nameComparison;
      }

      return firstItem.feeTypeName.localeCompare(
        secondItem.feeTypeName,
        "es",
      );
    },
  );

  const estimatedBudget = Number(
    tripData.estimated_budget ?? 0,
  );

  const totalCharged = members.reduce(
    (total, member) =>
      total + member.totalCharged,
    0,
  );

  const totalPaid = members.reduce(
    (total, member) =>
      total + member.totalPaid,
    0,
  );

  const totalPending = Math.max(
    totalCharged - totalPaid,
    0,
  );

  const recoveryPercentage =
    totalCharged > 0
      ? Math.min(
          Math.round(
            (totalPaid / totalCharged) *
              1000,
          ) / 10,
          100,
        )
      : 0;

  return {
    estimatedBudget,
    totalCharged,
    totalPaid,
    totalPending,
    recoveryPercentage,
    members,
  };
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