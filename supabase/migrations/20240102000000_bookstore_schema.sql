-- ================================================
-- Bookstore Membership System — Full Schema
-- ================================================

-- Drop SaaS-specific table
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- -----------------------------------------------
-- 1. PROFILES (modify existing)
-- -----------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member' NOT NULL
    CHECK (role IN ('admin', 'staff', 'member')),
  ADD COLUMN IF NOT EXISTS member_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS membership_tier text DEFAULT 'silver' NOT NULL
    CHECK (membership_tier IN ('silver', 'gold', 'platinum')),
  ADD COLUMN IF NOT EXISTS total_spent numeric(12,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS available_points integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS note text;

-- -----------------------------------------------
-- 2. MEMBERSHIP_TIERS (configuration table)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_tiers (
  id text PRIMARY KEY,
  name_th text NOT NULL,
  name_en text NOT NULL,
  min_spent numeric(12,2) NOT NULL DEFAULT 0,
  points_multiplier numeric(3,2) NOT NULL DEFAULT 1.0,
  discount_percent numeric(5,2) NOT NULL DEFAULT 0,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

INSERT INTO public.membership_tiers (id, name_th, name_en, min_spent, points_multiplier, discount_percent, color, sort_order) VALUES
  ('silver', 'ซิลเวอร์', 'Silver', 0, 1.0, 0, '#C0C0C0', 1),
  ('gold', 'โกลด์', 'Gold', 5000, 1.5, 5, '#FFD700', 2),
  ('platinum', 'แพลทินัม', 'Platinum', 20000, 2.0, 10, '#E5E4E2', 3)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------
-- 3. BOOK_CATEGORIES
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.book_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES public.book_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- -----------------------------------------------
-- 4. BOOKS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn text UNIQUE,
  title text NOT NULL,
  author text NOT NULL,
  publisher text,
  category_id uuid REFERENCES public.book_categories(id) ON DELETE SET NULL,
  description text,
  cover_image_url text,
  price numeric(10,2) NOT NULL,
  cost_price numeric(10,2),
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  is_active boolean DEFAULT true NOT NULL,
  tags text[],
  published_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);

-- -----------------------------------------------
-- 5. PURCHASES (sales transactions)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.profiles(id) NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
  points_redeemed integer DEFAULT 0 NOT NULL,
  points_discount numeric(12,2) DEFAULT 0 NOT NULL,
  promotion_id uuid,
  total numeric(12,2) NOT NULL,
  points_earned integer DEFAULT 0 NOT NULL,
  payment_method text DEFAULT 'cash' NOT NULL
    CHECK (payment_method IN ('cash', 'card', 'transfer', 'qr')),
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchases_member ON public.purchases(member_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON public.purchases(created_at);

-- -----------------------------------------------
-- 6. PURCHASE_ITEMS (line items)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_book ON public.purchase_items(book_id);

-- -----------------------------------------------
-- 7. POINTS_TRANSACTIONS (ledger)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'adjust')),
  points integer NOT NULL,
  balance_after integer NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_points_member ON public.points_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_points_date ON public.points_transactions(created_at);

-- -----------------------------------------------
-- 8. PROMOTIONS
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN (
    'percent_discount',
    'fixed_discount',
    'buy_x_get_y',
    'spend_threshold',
    'bundle',
    'points_multiplier'
  )),
  config jsonb NOT NULL DEFAULT '{}',
  min_tier text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.purchases
  ADD CONSTRAINT fk_purchases_promotion
  FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE SET NULL;

-- -----------------------------------------------
-- 9. PROMOTION_BOOKS (which books a promotion applies to)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotion_books (
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, book_id)
);

-- -----------------------------------------------
-- 10. BOOK_PAIRS (cross-sell: co-purchase frequency)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.book_pairs (
  book_a_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  book_b_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  co_purchase_count integer DEFAULT 1 NOT NULL,
  last_purchased_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (book_a_id, book_b_id),
  CHECK (book_a_id < book_b_id)
);

-- -----------------------------------------------
-- 11. ACTIVITY_LOG (audit trail)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_log_date ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON public.activity_log(actor_id);

-- -----------------------------------------------
-- RLS POLICIES
-- -----------------------------------------------

-- Profiles: Update existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Admin/staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin/staff can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
    OR auth.uid() = id
  );

-- Books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active books"
  ON books FOR SELECT USING (true);

CREATE POLICY "Admin/staff can manage books"
  ON books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

-- Purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can manage purchases"
  ON purchases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Members can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = member_id);

-- Purchase items
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can manage purchase items"
  ON purchase_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Members can view own purchase items"
  ON purchase_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM purchases pu WHERE pu.id = purchase_items.purchase_id AND pu.member_id = auth.uid()
    )
  );

-- Points transactions
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/staff can manage points"
  ON points_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Members can view own points"
  ON points_transactions FOR SELECT
  USING (auth.uid() = member_id);

-- Promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  USING (is_active = true AND now() BETWEEN starts_at AND ends_at);

CREATE POLICY "Admin/staff can manage promotions"
  ON promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

-- Other tables
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON book_categories FOR SELECT USING (true);
CREATE POLICY "Admin/staff can manage categories" ON book_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tiers" ON membership_tiers FOR SELECT USING (true);

ALTER TABLE public.book_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view book pairs" ON book_pairs FOR SELECT USING (true);
CREATE POLICY "Admin/staff can manage book pairs" ON book_pairs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

ALTER TABLE public.promotion_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view promotion books" ON promotion_books FOR SELECT USING (true);
CREATE POLICY "Admin/staff can manage promotion books" ON promotion_books FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/staff can view activity log" ON activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));
CREATE POLICY "System can insert activity log" ON activity_log FOR INSERT WITH CHECK (true);

-- -----------------------------------------------
-- FUNCTIONS & TRIGGERS
-- -----------------------------------------------

-- Sequence for member codes
CREATE SEQUENCE IF NOT EXISTS member_code_seq START 1;

-- Update handle_new_user to assign member role and code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, role, membership_tier, member_code)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url',
    COALESCE(new.raw_user_meta_data ->> 'role', 'member'),
    'silver',
    'MEM-' || LPAD(nextval('member_code_seq')::text, 5, '0')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-upgrade membership tier based on total_spent
CREATE OR REPLACE FUNCTION public.check_tier_upgrade()
RETURNS trigger AS $$
DECLARE
  new_tier text;
BEGIN
  SELECT id INTO new_tier
  FROM public.membership_tiers
  WHERE NEW.total_spent >= min_spent
  ORDER BY min_spent DESC
  LIMIT 1;

  IF new_tier IS NOT NULL AND new_tier != NEW.membership_tier THEN
    NEW.membership_tier := new_tier;
    INSERT INTO public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.id, 'tier_upgraded', 'member', NEW.id,
      jsonb_build_object('old_tier', OLD.membership_tier, 'new_tier', new_tier, 'total_spent', NEW.total_spent));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER check_tier_on_spend_update
  BEFORE UPDATE OF total_spent ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_tier_upgrade();

-- Update co-purchase pairs after a purchase
CREATE OR REPLACE FUNCTION public.update_book_pairs()
RETURNS trigger AS $$
DECLARE
  book_ids uuid[];
  i integer;
  j integer;
  a uuid;
  b uuid;
BEGIN
  SELECT array_agg(DISTINCT book_id) INTO book_ids
  FROM public.purchase_items
  WHERE purchase_id = NEW.id;

  IF array_length(book_ids, 1) >= 2 THEN
    FOR i IN 1..array_length(book_ids, 1) LOOP
      FOR j IN (i+1)..array_length(book_ids, 1) LOOP
        IF book_ids[i] < book_ids[j] THEN
          a := book_ids[i]; b := book_ids[j];
        ELSE
          a := book_ids[j]; b := book_ids[i];
        END IF;

        INSERT INTO public.book_pairs (book_a_id, book_b_id, co_purchase_count, last_purchased_at)
        VALUES (a, b, 1, now())
        ON CONFLICT (book_a_id, book_b_id)
        DO UPDATE SET
          co_purchase_count = book_pairs.co_purchase_count + 1,
          last_purchased_at = now();
      END LOOP;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at triggers to new tables
CREATE OR REPLACE TRIGGER books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE OR REPLACE TRIGGER book_categories_updated_at BEFORE UPDATE ON public.book_categories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE OR REPLACE TRIGGER promotions_updated_at BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- -----------------------------------------------
-- VIEWS for Dashboard
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.low_stock_books AS
  SELECT id, title, author, stock_quantity, low_stock_threshold
  FROM public.books
  WHERE is_active = true AND stock_quantity <= low_stock_threshold
  ORDER BY stock_quantity ASC;

CREATE OR REPLACE VIEW public.daily_revenue AS
  SELECT
    date_trunc('day', created_at) AS date,
    COUNT(*) AS transaction_count,
    SUM(total) AS revenue,
    SUM(discount_amount) AS total_discounts
  FROM public.purchases
  GROUP BY date_trunc('day', created_at)
  ORDER BY date DESC;
