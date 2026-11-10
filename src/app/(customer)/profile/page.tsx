import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Мой профиль</CardTitle>
          <CardDescription>Управление вашим аккаунтом</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Имя</p>
              <p className="text-lg">Иван Иванов (Заглушка)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">ivan@example.com (Заглушка)</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="destructive">Выйти из аккаунта</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Профиль пользователя. Сейчас это заглушка. Страница должна отвечать за композицию личного кабинета по макету,
// получение данных необходимо будет вынести в серверный слой соответствующей бизнес-сущности.
// Будещие сценарии: просмотр профиля; редактирование имени, телефона и почты?; загрузка аватара(ну а чё нет, пускай комменты оставляют,
// чатиться будут по преколу в каждом ресторане); управление адремаси доставки; выход из аккаунта. Функционал операций реализовать отдельно от этой страницы.
