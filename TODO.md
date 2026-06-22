# TODO

- [x] Perbaiki `seed.ts` agar konsisten dengan mekanisme DB yang dipakai project (Prisma `db.*.upsert`) , hilangkan campuran Supabase.

- [ ] Update `seed.ts` section `faculty` & `studyProgram` sesuai daftar:
  - Fakultas: FKIP, Ekonomi, MIPA, PISIFOL, Perikanan, Teknik
  - Prodi: Akuntansi, ADM, Bahasa Inggris, PGSD, Matematika, Ilmu Kelautan, Teknologi Hasil Pertanian, Teknik Industri, Teknik Informatika, Teknik Lingkungan, Teknik Sipil
- [ ] Sesuaikan referensi `facultyId`/`studyProgramId` pada seed data `researcher`, `research`, dan `communityService` agar tidak mengacu ke slug lama yang sudah diganti.
- [ ] Jalankan `npm run lint`/`tsc` (jika memungkinkan) dan pastikan build tidak error.

