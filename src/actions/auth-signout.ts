'use server';

import { signOut } from '@/lib/auth';

export async function signOutAction(formData: FormData) {
  const callbackUrl = String(formData.get('callbackUrl') ?? '/');
  await signOut({ redirectTo: callbackUrl });
}
