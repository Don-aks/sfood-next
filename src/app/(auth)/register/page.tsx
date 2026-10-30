import { RegisterForm } from './register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center">Создать аккаунт</h1>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
