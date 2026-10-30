import { LoginForm } from './login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center">Вход в аккаунт</h1>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
