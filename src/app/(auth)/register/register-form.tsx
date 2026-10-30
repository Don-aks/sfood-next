'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Схема валидации с помощью Zod
const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Имя должно быть не менее 2 символов' }),
  email: z.string().email({ message: 'Введите корректный email' }),
  password: z.string().min(6, { message: 'Пароль должен быть не менее 6 символов' }),
});

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // ЗАГЛУШКА: Позже здесь будет вызов Server Action от коллеги
    console.log('Отправка данных:', values);

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)), // Имитация запроса
      {
        loading: 'Регистрация...',
        success: () => 'Успешная регистрация! (Это пока заглушка)',
        error: 'Ошибка регистрации',
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Заполните данные, чтобы создать аккаунт</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Имя</Label>
            <Input id="fullName" placeholder="Иван Иванов" {...register('fullName')} />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="mail@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
