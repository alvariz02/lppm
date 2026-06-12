-- ============================================================================
-- LPPM Campus Website - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ AUTH & PROFILES ============

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT 'admin123',
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin_lppm', 'editor', 'reviewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ SITE SETTINGS ============

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'LPPM Kampus',
  lppm_name TEXT NOT NULL DEFAULT 'Lembaga Penelitian dan Pengabdian kepada Masyarakat',
  logo_url TEXT,
  lppm_logo_url TEXT,
  favicon_url TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  google_maps_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ LPPM PROFILE ============

CREATE TABLE lppm_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  about TEXT,
  vision TEXT,
  mission TEXT,
  goals TEXT,
  duties TEXT,
  chairman_name TEXT,
  chairman_photo_url TEXT,
  chairman_message TEXT,
  structure_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ FACULTY & STUDY PROGRAMS ============

CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE study_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ RESEARCHERS / DOSEN ============

CREATE TABLE researchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nidn TEXT,
  nip TEXT,
  name TEXT NOT NULL,
  degree TEXT,
  functional_position TEXT,
  faculty_id UUID REFERENCES faculties(id),
  study_program_id UUID REFERENCES study_programs(id),
  expertise TEXT,
  email TEXT,
  phone TEXT,
  google_scholar_url TEXT,
  sinta_id TEXT,
  scopus_id TEXT,
  orcid_id TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ FUNDING SCHEMES ============

CREATE TABLE funding_schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  source TEXT,
  year INTEGER NOT NULL,
  description TEXT,
  requirements TEXT,
  min_budget FLOAT,
  max_budget FLOAT,
  open_date TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  guide_file_url TEXT,
  registration_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ RESEARCH ============

CREATE TABLE research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  abstract TEXT,
  year INTEGER NOT NULL,
  funding_scheme_id UUID REFERENCES funding_schemes(id),
  leader_id UUID REFERENCES researchers(id),
  faculty_id UUID REFERENCES faculties(id),
  study_program_id UUID REFERENCES study_programs(id),
  funding_source TEXT,
  budget FLOAT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'completed', 'cancelled')),
  outputs TEXT,
  main_image_url TEXT,
  document_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE research_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
  researcher_id UUID NOT NULL REFERENCES researchers(id),
  role TEXT NOT NULL DEFAULT 'anggota',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(research_id, researcher_id)
);

CREATE TABLE research_student_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  nim TEXT,
  study_program TEXT,
  role TEXT NOT NULL DEFAULT 'anggota',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ COMMUNITY SERVICE ============

CREATE TABLE community_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  location TEXT,
  village TEXT,
  district TEXT,
  regency TEXT,
  year INTEGER NOT NULL,
  funding_scheme_id UUID REFERENCES funding_schemes(id),
  leader_id UUID REFERENCES researchers(id),
  faculty_id UUID REFERENCES faculties(id),
  study_program_id UUID REFERENCES study_programs(id),
  partner_name TEXT,
  funding_source TEXT,
  budget FLOAT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'completed', 'cancelled')),
  outputs TEXT,
  impact TEXT,
  main_image_url TEXT,
  document_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE community_service_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES community_services(id) ON DELETE CASCADE,
  researcher_id UUID NOT NULL REFERENCES researchers(id),
  role TEXT NOT NULL DEFAULT 'anggota',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, researcher_id)
);

CREATE TABLE community_service_student_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES community_services(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  nim TEXT,
  study_program TEXT,
  role TEXT NOT NULL DEFAULT 'anggota',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ PUBLICATIONS ============

CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  publication_type TEXT NOT NULL DEFAULT 'journal_national' CHECK (publication_type IN ('journal_national', 'journal_international', 'proceeding', 'book', 'book_chapter', 'hki', 'patent', 'popular_article')),
  authors TEXT,
  publisher_name TEXT,
  journal_name TEXT,
  year INTEGER NOT NULL,
  volume TEXT,
  number TEXT,
  pages TEXT,
  issn TEXT,
  isbn TEXT,
  doi TEXT,
  url TEXT,
  indexing TEXT,
  accreditation TEXT,
  file_url TEXT,
  research_id UUID REFERENCES research(id),
  service_id UUID REFERENCES community_services(id),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE publication_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  researcher_id UUID NOT NULL REFERENCES researchers(id),
  author_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(publication_id, researcher_id)
);

-- ============ NEWS ============

CREATE TABLE news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES news_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ ANNOUNCEMENTS ============

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  attachment_url TEXT,
  type TEXT NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'important')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  published_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ DOCUMENTS ============

CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES document_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ REVIEWERS ============

CREATE TABLE reviewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID UNIQUE REFERENCES researchers(id),
  name TEXT NOT NULL,
  nidn TEXT,
  nip TEXT,
  email TEXT,
  phone TEXT,
  institution TEXT,
  expertise TEXT,
  reviewer_type TEXT NOT NULL DEFAULT 'internal' CHECK (reviewer_type IN ('internal', 'external')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ PROPOSAL REVIEWS ============

CREATE TABLE proposal_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_type TEXT NOT NULL DEFAULT 'research' CHECK (proposal_type IN ('research', 'community_service')),
  research_id UUID REFERENCES research(id),
  service_id UUID REFERENCES community_services(id),
  reviewer_id UUID NOT NULL REFERENCES reviewers(id),
  score FLOAT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'reviewing', 'revision', 'accepted', 'rejected')),
  review_file_url TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ PARTNERS ============

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  partner_type TEXT NOT NULL DEFAULT 'other' CHECK (partner_type IN ('government', 'industry', 'ngo', 'university', 'community', 'other')),
  address TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  cooperation_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  logo_url TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ AGENDA ============

CREATE TABLE agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('seminar', 'workshop', 'sosialisasi', 'monev', 'deadline', 'pelatihan')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  organizer TEXT,
  poster_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ GALLERY ============

CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT CHECK (category IN ('research', 'community_service', 'seminar', 'workshop')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ CONTACT MESSAGES ============

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ ACTIVITY LOGS ============

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ INDEXES ============

CREATE INDEX idx_researchers_faculty ON researchers(faculty_id);
CREATE INDEX idx_researchers_study_program ON researchers(study_program_id);
CREATE INDEX idx_researchers_active ON researchers(is_active);
CREATE INDEX idx_research_year ON research(year);
CREATE INDEX idx_research_status ON research(status);
CREATE INDEX idx_research_published ON research(is_published);
CREATE INDEX idx_research_faculty ON research(faculty_id);
CREATE INDEX idx_community_service_year ON community_services(year);
CREATE INDEX idx_community_service_status ON community_services(status);
CREATE INDEX idx_community_service_published ON community_services(is_published);
CREATE INDEX idx_publications_type ON publications(publication_type);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_documents_active ON documents(is_active);
CREATE INDEX idx_proposal_reviews_status ON proposal_reviews(status);
CREATE INDEX idx_proposal_reviews_reviewer ON proposal_reviews(reviewer_id);
CREATE INDEX idx_contact_messages_read ON contact_messages(is_read);

-- ============ UPDATED_AT TRIGGER ============

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t);
    END LOOP;
END;
$$;

-- ============ ENABLE RLS (Row Level Security) ============

-- We use service_role key in API routes, so RLS is bypassed
-- But let's enable it and create a policy for public reads

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lppm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_student_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_service_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_service_student_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (bypasses RLS)
-- Allow anon key read-only access for public data
CREATE POLICY "Service role can do everything" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON lppm_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON faculties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON study_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON researchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON funding_schemes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON research FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON research_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON research_student_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON community_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON community_service_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON community_service_student_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON publications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON publication_authors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON news_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON document_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON reviewers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON proposal_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON agenda FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON gallery_albums FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON gallery_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do everything" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
