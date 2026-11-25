CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_lower_idx
  ON app_users (lower(email));

CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_sessions_expires_at_idx
  ON app_sessions (expires_at);

CREATE TABLE IF NOT EXISTS cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'سيرتي الذاتية',
  language text NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  template text NOT NULL DEFAULT 'modern' CHECK (template IN ('modern', 'minimal')),
  data jsonb NOT NULL DEFAULT '{
    "personalInfo": {
      "fullName": "",
      "jobTitle": "",
      "email": "",
      "phone": "",
      "location": "",
      "linkedin": "",
      "website": "",
      "summary": ""
    },
    "experiences": [],
    "education": [],
    "skills": [],
    "languages": [],
    "projects": [],
    "certificates": []
  }'::jsonb,
  theme_settings jsonb NOT NULL DEFAULT '{
    "primaryColor": "#1e40af",
    "fontFamily": "Noto Kufi Arabic",
    "fontSize": "medium",
    "layout": "double",
    "showPhoto": true,
    "photoShape": "circle",
    "backgroundColor": "#ffffff",
    "accentColor": "#3b82f6"
  }'::jsonb,
  photo_url text,
  background_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cvs_user_updated_at_idx
  ON cvs (user_id, updated_at DESC);
