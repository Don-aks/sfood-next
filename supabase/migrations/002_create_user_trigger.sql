-- Создаем функцию, которая будет срабатывать при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Создаем сам триггер
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Назначение файла: автоматически создавать профиль при регистрации пользователя в Supabase Auth.
-- Правила: Оставить создание профиля через триггер; не принимать роль из raw_user_meta_data; явно квалифицировать обращения к объектам схемы;
-- использовать современный синтаксис "execute function"; добавить тестироваие сценария регистрации и создания профиля.
-- В дальнейшем этот триггер должен отвечать исключительно за первоначальное создание профиля. Создание ресторанов, заявок и членства в ресторанах в него помещать нельзя.