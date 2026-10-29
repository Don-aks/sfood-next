'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function TestAuthPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(`Ошибка регистрации: ${error.message}`);
    else
      setMessage(
        'Успешная регистрация! Проверьте почту (или сразу войдите, если подтверждение отключено).'
      );
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(`Ошибка входа: ${error.message}`);
    else setMessage('Успешный вход! Теперь смотрите куки.');
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-sm">
      <h1 className="text-xl font-bold">Тест Авторизации</h1>
      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль (мин. 6 символов)"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={handleSignUp} className="bg-blue-500 text-white p-2 rounded">
          Зарегистрироваться
        </button>
        <button onClick={handleSignIn} className="bg-green-500 text-white p-2 rounded">
          Войти
        </button>
      </div>
      {message && <p className="text-sm font-bold text-red-500">{message}</p>}
    </div>
  );
}
