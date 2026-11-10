-- 1. Создаем ENUM для статусов заказа (чтобы избежать опечаток)
CREATE TYPE order_status AS ENUM (
  'pending',      -- Ожидает подтверждения рестораном
  'accepted',     -- Принят рестораном
  'cooking',      -- Готовится
  'delivering',   -- В пути (курьер везет)
  'delivered',    -- Доставлен
  'cancelled'     -- Отменен
);

-- 2. Таблица профилей (расширяет стандартную auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('customer', 'restaurant_admin', 'courier')) DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблица ресторанов
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Владелец (админ)
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Категории меню (привязаны к ресторану)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- 5. Блюда (привязаны к ресторану и категории)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Заказы
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE RESTRICT NOT NULL,
  courier_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Назначается позже
  status order_status DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_lat DECIMAL(10,7),
  delivery_lng DECIMAL(10,7),
  payment_method TEXT, -- 'card', 'cash'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Состав заказа (корзина на момент покупки)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10,2) NOT NULL -- Фиксируем цену на момент покупки
);

-- 8. Локации курьеров (для Real-time)
CREATE TABLE courier_locations (
  courier_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ВКЛЮЧАЕМ БЕЗОПАСНОСТЬ (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_locations ENABLE ROW LEVEL SECURITY;

-- Базовые политики (упрощенные для старта)
-- 1. Профили: все могут читать базовую инфу, редактировать только свой

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Рестораны, категории и блюда: все могут читать
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- 3. Заказы: пользователь видит только свои
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
-- (Позже добавим политики для админов ресторанов и курьеров)

-- 4. Локации курьеров: все авторизованные могут читать
CREATE POLICY "Anyone can view courier locations" ON courier_locations FOR SELECT USING (true);


-- Проблемы: 

-- profiles - отсутствует platform_admin, роль хранится непосредственно в профиле, 
-- пользователь может обновить собственную роль через существующую UPDATE policy, поля профиля доступны всем через публичную SELECT policy.
-- Что необходимо: не использовать profiles.role как единственный источник полномочий. Нужно разделить пользовательский профиль, полномочия платформенного админа, 
-- членство в конкретном ресторане, роль курьера. restourant_admin должен опреледяться через связь пользователя с рестораном в restourant_members -это позволит 
-- одному пользователю управлять несколькими ресторанами, а также иметь разные права в разных ресторанах. Наличие platform_admin должно происходить исключительно доверенным 
-- серверным механизмом. user_metadata для назначения привелегий использовать нельзя. 

-- restourant - owner_id не должен становиться единым механизмом управления рестораном.
-- Необходимо разделить 2 понятия: публикация ресторана на платформе; операционная доступность ресторана. Ресторан может быть опубликован, но временно не принимать заказы.
-- Ресторан, который не прошёл модерацию, не должен отображаться в публичном каталоге.

-- categories - необходимо обеспечить, чтобы категория действительно принадлежала тому же ресторану, что и блюдо. Сейчас SQL допускает создание блюда, у которого restourant_id 
-- относится к одному ресторану, а category_id - к другому. Это можно защитить составным внешним ключом.

-- products - необходимо изменить: запретить отрицательные цены через CHECK; определить правила удаления и архивирования блюд; обеспечить принадлежность категории ресторану;
-- разделить доступность блюда и его публикацию; предусмотреть сохранение исторической информации в заказе. Последнее особенно важно: order_items должен хранить снимок 
-- необходимых данных товара на момент покупки.

-- orders - это центральная бизнес-сущность SimpleFood. База норм, но необходимо предусмотреть: отдельные правила изменений статусов; защиту от изменений чужого заказа;
-- разграничение доступа клиента, ресторана и курьера; фиксацию стоимости заказа на момент создания; отдельный статус оплаты; историю изменения статусов; 
-- корректно обновление update_at. В будщем добавить order_status_history для отслеживания всей истории заказа.

-- orders_items - добавить снимок названия товара и, при необходимости, других характеристик, которые нужны для отображения исторического заказа. 
-- Также нужна отдельная RLS-политика. Политика доступа к orders автоматически не распространяется на order_items

-- courier_locations - для MVP тут допустимая структура хранения текущей позиции курьера, но политику необходимо исправить, ибо она разрешает публичное чтение координат.
-- координаты должны быть доступны только участникам соответствующего заказа, которым действительно необходим доступ.
-- В будущем потребуется: запись координат только назначенным курьером; чтение координат владельцем заказа; доступ ресторану в рамках соответствующего заказа, если 
-- это предусмотрено бизнес-логикой; подписка клиента на изменения через Supabase Realtime. Для истории перемещений в будущем можно будет добавить отдельную таблицу событий геолокации.

-- Отдельно о RLS - сейчас включено для всех семи таблиц, но сейчас защита описана некорректно(Политика - проблема): Public profiles - открывает чтение профилей, включая телефон;
-- Users update own profile - не запрещает изменение роли; Restourants public select - не отделяет опубликованные рестораны от неопубликованных; Categories public select - 
-- не проверяет публикацию ресторана; Products public select - не проверяет публикацию ресторана; Users view own orders - не учитывает ресторан и курьера; 
-- Anyone view courier locations - открывает геолокацию всем. +для order_item необходима SELECT-политика. Подход такой: разрешать доступ исходя из матрицы полномочий.


-- Какие таблицы ещё необходимы: restourant_application - заявки на подключение ресторанов; restourant_members - связь пользователя с рестораном; 
-- Тоже нужны, но хз: order_status_history - история измениния заказов; addresses - адреса доставки клиентов; payments - информация об оплате; 
-- platform_admins - доверенное назначение платформенных администраторов.
