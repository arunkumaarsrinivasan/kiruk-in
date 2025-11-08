-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip VARCHAR(45),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interaction logs table (for analytics)
CREATE TABLE IF NOT EXISTS interaction_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  data JSONB,
  user_agent TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio views tracking table
CREATE TABLE IF NOT EXISTS portfolio_views (
  id BIGSERIAL PRIMARY KEY,
  page VARCHAR(100) NOT NULL,
  session_id VARCHAR(255),
  user_agent TEXT,
  ip VARCHAR(45),
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_session_id ON interaction_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_action ON interaction_logs(action);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_created_at ON interaction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_page ON portfolio_views(page);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_created_at ON portfolio_views(created_at);

-- Instagram cache table
CREATE TABLE IF NOT EXISTS instagram_cache (
  id BIGSERIAL PRIMARY KEY,
  instagram_id VARCHAR(255) UNIQUE NOT NULL,
  post_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Instagram cache
CREATE INDEX IF NOT EXISTS idx_instagram_cache_instagram_id ON instagram_cache(instagram_id);
CREATE INDEX IF NOT EXISTS idx_instagram_cache_created_at ON instagram_cache(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_cache ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert data (for contact forms and analytics)
CREATE POLICY "Allow anonymous inserts on contact_submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on interaction_logs" ON interaction_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on portfolio_views" ON portfolio_views
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service role to read/write everything (for admin operations)
CREATE POLICY "Allow service role full access on contact_submissions" ON contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on interaction_logs" ON interaction_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on portfolio_views" ON portfolio_views
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on instagram_cache" ON instagram_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anonymous read access to Instagram cache
CREATE POLICY "Allow anonymous read on instagram_cache" ON instagram_cache
  FOR SELECT TO anon USING (true);
