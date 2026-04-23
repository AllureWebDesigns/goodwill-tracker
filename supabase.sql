-- Create donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  value NUMERIC(10,2) NOT NULL,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index on date for faster queries
CREATE INDEX donations_date_idx ON donations(date DESC);

-- Enable Row Level Security (optional, for multi-user)
-- For now, we'll keep it simple (public access)
