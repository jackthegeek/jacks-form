/*
  # Form Builder Schema

  ## Summary
  Creates the complete database schema for the Form Builder application.

  ## New Tables

  ### profiles
  - Extends Supabase auth.users with display name and avatar
  - Automatically created on user signup via trigger

  ### forms
  - Stores form definitions including fields (JSON), settings, and theme
  - `fields`: JSON array of field objects with type, label, validation, etc.
  - `settings`: JSON object with success_message, redirect_url, password_hash, etc.
  - `theme`: JSON object with colors, fonts, button styles
  - `slug`: Unique public URL identifier
  - `is_published`: Controls public visibility
  - `is_enabled`: Controls whether form accepts new responses
  - `total_views`: View counter for analytics

  ### form_responses
  - Stores all form submissions
  - `data`: JSON object mapping field_id to submitted value
  - `metadata`: JSON with browser/device info
  - `completion_time`: Time in seconds to complete the form

  ## Security
  - RLS enabled on all tables
  - Users can only manage their own forms
  - Public can submit to published, enabled forms
  - Public can view published forms
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Form',
  description text DEFAULT '',
  fields jsonb NOT NULL DEFAULT '[]',
  settings jsonb NOT NULL DEFAULT '{"success_message": "Thank you for your response!", "redirect_url": "", "is_password_protected": false, "password": ""}',
  theme jsonb NOT NULL DEFAULT '{"primary_color": "#3b82f6", "background_color": "#ffffff", "text_color": "#111827", "font": "Inter", "button_style": "rounded"}',
  is_published boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  slug text UNIQUE,
  total_views integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forms"
  ON forms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published forms"
  ON forms FOR SELECT
  TO anon
  USING (is_published = true AND is_enabled = true);

CREATE POLICY "Users can insert own forms"
  ON forms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
  ON forms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
  ON forms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Form responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  completion_time integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form owners can view responses"
  ON form_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit to published forms"
  ON form_responses FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.is_published = true
      AND forms.is_enabled = true
    )
  );

CREATE POLICY "Authenticated users can submit to published forms"
  ON form_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.is_published = true
      AND forms.is_enabled = true
    )
  );

CREATE POLICY "Form owners can delete responses"
  ON form_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS forms_user_id_idx ON forms(user_id);
CREATE INDEX IF NOT EXISTS forms_slug_idx ON forms(slug);
CREATE INDEX IF NOT EXISTS forms_is_published_idx ON forms(is_published);
CREATE INDEX IF NOT EXISTS form_responses_form_id_idx ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS form_responses_submitted_at_idx ON form_responses(submitted_at);

-- Function to generate a unique slug
CREATE OR REPLACE FUNCTION generate_form_slug()
RETURNS TRIGGER AS $$
DECLARE
  new_slug text;
  slug_exists boolean;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    LOOP
      new_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
      new_slug := regexp_replace(new_slug, '\s+', '-', 'g');
      new_slug := new_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
      new_slug := substr(new_slug, 1, 60);
      SELECT EXISTS(SELECT 1 FROM forms WHERE slug = new_slug) INTO slug_exists;
      EXIT WHEN NOT slug_exists;
    END LOOP;
    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_form_slug
  BEFORE INSERT ON forms
  FOR EACH ROW
  EXECUTE FUNCTION generate_form_slug();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
