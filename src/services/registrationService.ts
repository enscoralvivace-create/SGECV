import { supabase } from "@/lib/supabase";

export interface RegisterMemberInput {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  voice: string;
  password: string;
}

export interface RegisterMemberResult {
  email: string;
  requiresEmailConfirmation: boolean;
}

export async function registerMemberAccount(
  input: RegisterMemberInput,
): Promise<RegisterMemberResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/activar-cuenta`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        last_name: input.lastName.trim(),
        phone: input.phone.trim(),
        voice: input.voice.trim(),
      },
      emailRedirectTo,
    },
  });

  if (error) {
    throw new Error(
      `No fue posible crear la cuenta: ${error.message}`,
    );
  }

  return {
    email: normalizedEmail,
    requiresEmailConfirmation: !data.session,
  };
}