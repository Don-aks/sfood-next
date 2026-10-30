'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

type ActionResult = {
  error: string | null;
};

export async function signUp(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email');
  const password = formData.get('password');
  const fullName = formData.get('full_name');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof fullName !== 'string' ||
    !email.trim() ||
    !password ||
    !fullName.trim()
  ) {
    return { error: 'Пожалуйста, заполните все поля.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    // TODO: use error.code for i18n
    return { error: error.message };
  }

  redirect('/');
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return { error: 'Пожалуйста введите Ваш email и пароль.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  redirect('/');
}
