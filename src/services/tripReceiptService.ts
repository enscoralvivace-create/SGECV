import { supabase } from "@/lib/supabase";

export interface TripBudgetReceipt {
  id: string;
  tripBudgetItemId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string | null;
  createdAt: string;
}

export interface TripBudgetReceiptCount {
  tripBudgetItemId: string;
  receiptCount: number;
}

interface TripBudgetReceiptRow {
  id: string;
  trip_budget_item_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string | null;
  created_at: string;
}

const RECEIPTS_BUCKET = "trip-budget-receipts";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/xml",
  "text/xml",
];

function mapReceiptRow(
  row: TripBudgetReceiptRow,
): TripBudgetReceipt {
  return {
    id: row.id,
    tripBudgetItemId: row.trip_budget_item_id,
    fileName: row.file_name,
    filePath: row.file_path,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

function sanitizeFileName(
  fileName: string,
): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateFile(
  file: File,
): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      "Formato no permitido. Utiliza PDF, JPG, PNG o XML.",
    );
  }

  if (file.size <= 0) {
    throw new Error(
      "El archivo seleccionado está vacío.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "El archivo supera el límite de 10 MB.",
    );
  }
}

export async function getTripBudgetReceipts(
  tripBudgetItemId: string,
): Promise<TripBudgetReceipt[]> {
  const { data, error } = await supabase
    .from("trip_budget_receipts")
    .select("*")
    .eq(
      "trip_budget_item_id",
      tripBudgetItemId,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No fue posible cargar los comprobantes: ${error.message}`,
    );
  }

  return (
    (data as TripBudgetReceiptRow[] | null) ??
    []
  ).map(mapReceiptRow);
}

export async function uploadTripBudgetReceipt(
  tripBudgetItemId: string,
  file: File,
): Promise<TripBudgetReceipt> {
  validateFile(file);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "No fue posible identificar al usuario autenticado.",
    );
  }

  const safeFileName =
    sanitizeFileName(file.name) ||
    "comprobante";

  const uniqueFileName =
    `${crypto.randomUUID()}-${safeFileName}`;

  const filePath =
    `${tripBudgetItemId}/${uniqueFileName}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(
      filePath,
      file,
      {
        contentType: file.type,
        upsert: false,
      },
    );

  if (uploadError) {
    throw new Error(
      `No fue posible subir el archivo: ${uploadError.message}`,
    );
  }

  const {
    data,
    error: insertError,
  } = await supabase
    .from("trip_budget_receipts")
    .insert({
      trip_budget_item_id:
        tripBudgetItemId,
      file_name: file.name,
      file_path: filePath,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([filePath]);

    throw new Error(
      `El archivo se subió, pero no fue posible registrar el comprobante: ${insertError.message}`,
    );
  }

  return mapReceiptRow(
    data as TripBudgetReceiptRow,
  );
}

export async function createTripReceiptSignedUrl(
  filePath: string,
): Promise<string> {
  const {
    data,
    error,
  } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(
      filePath,
      60 * 10,
    );

  if (error) {
    throw new Error(
      `No fue posible abrir el comprobante: ${error.message}`,
    );
  }

  return data.signedUrl;
}

export async function deleteTripBudgetReceipt(
  receipt: TripBudgetReceipt,
): Promise<void> {
  const {
    error: storageError,
  } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .remove([receipt.filePath]);

  if (storageError) {
    throw new Error(
      `No fue posible eliminar el archivo: ${storageError.message}`,
    );
  }

  const {
    error: databaseError,
  } = await supabase
    .from("trip_budget_receipts")
    .delete()
    .eq("id", receipt.id);

  if (databaseError) {
    throw new Error(
      `El archivo fue eliminado, pero no fue posible borrar su registro: ${databaseError.message}`,
    );
  }
}

export async function getTripBudgetReceiptCounts(
  tripBudgetItemIds: string[],
): Promise<TripBudgetReceiptCount[]> {
  if (tripBudgetItemIds.length === 0) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("trip_budget_receipts")
    .select("trip_budget_item_id")
    .in(
      "trip_budget_item_id",
      tripBudgetItemIds,
    );

  if (error) {
    throw new Error(
      `No fue posible consultar los comprobantes del presupuesto: ${error.message}`,
    );
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const tripBudgetItemId =
      row.trip_budget_item_id as string;

    counts.set(
      tripBudgetItemId,
      (counts.get(tripBudgetItemId) ?? 0) + 1,
    );
  }

  return tripBudgetItemIds.map(
    (tripBudgetItemId) => ({
      tripBudgetItemId,
      receiptCount:
        counts.get(tripBudgetItemId) ?? 0,
    }),
  );
}