-- ============================================================================
-- LPPM Campus Website - Seed Data
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- ============================================================================

-- ============ DEFAULT ADMIN ACCOUNT ============

INSERT INTO profiles (email, password, full_name, role, is_active)
VALUES
  ('admin@lppm.ac.id', 'admin123', 'Super Admin', 'super_admin', true),
  ('editor@lppm.ac.id', 'editor123', 'Editor LPPM', 'editor', true),
  ('adminlppm@lppm.ac.id', 'adminlppm123', 'Admin LPPM', 'admin_lppm', true),
  ('reviewer@lppm.ac.id', 'reviewer123', 'Reviewer', 'reviewer', true);

-- ============ SITE SETTINGS ============

INSERT INTO site_settings (site_name, lppm_name, email, phone, address, seo_title, seo_description)
VALUES (
  'LPPM Kampus',
  'Lembaga Penelitian dan Pengabdian kepada Masyarakat',
  'lppm@kampus.ac.id',
  '+62 123 456 7890',
  'Jl. Pendidikan No. 1, Kota, Indonesia',
  'LPPM Kampus - Penelitian dan Pengabdian Masyarakat',
  'Website resmi Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) Kampus'
);

-- ============ LPPM PROFILE ============

INSERT INTO lppm_profiles (about, vision, mission, goals, duties, chairman_name, chairman_message)
VALUES (
  'LPPM merupakan lembaga yang bertanggung jawab dalam mengkoordinasikan, memfasilitasi, dan mengawasi kegiatan penelitian dan pengabdian kepada masyarakat di lingkungan kampus.',
  'Menjadi lembaga penelitian dan pengabdian kepada masyarakat yang unggul dan berdaya saing di tingkat nasional maupun internasional.',
  '1. Mengembangkan budaya riset yang inovatif dan berkualitas.
2. Meningkatkan kontribusi penelitian dalam pengembangan ilmu pengetahuan, teknologi, dan seni.
3. Memfasilitasi pengabdian kepada masyarakat yang berkelanjutan dan berdampak.
4. Membangun jejaring kolaborasi dengan institusi nasional dan internasional.
5. Meningkatkan kapasitas sumber daya manusia dalam penelitian dan pengabdian.',
  '1. Meningkatkan kuantitas dan kualitas penelitian.
2. Meningkatkan jumlah publikasi ilmiah terindeks.
3. Meningkatkan dampak pengabdian kepada masyarakat.
4. Membangun ekosistem riset yang kondusif.',
  '1. Merumuskan kebijakan dan program penelitian.
2. Mengkoordinasikan kegiatan penelitian dan pengabdian.
3. Memfasilitasi pendanaan penelitian.
4. Melakukan monitoring dan evaluasi.
5. Membina jejungan kerjasama.',
  'Dr. Prof. Ahmad Susanto, M.Sc.',
  'Selamat datang di website LPPM. Kami berkomitmen untuk terus meningkatkan kualitas penelitian dan pengabdian kepada masyarakat demi kemajuan ilmu pengetahuan dan kesejahteraan masyarakat.'
);
