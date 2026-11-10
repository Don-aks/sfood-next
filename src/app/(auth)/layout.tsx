export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

// Общая оболочка страницы авторизации. Сейчас она централизует содержимое, в будущем можно будет также добавить лишь визуальные фичи, особенно, если будем переносить её на модалку
