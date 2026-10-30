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
