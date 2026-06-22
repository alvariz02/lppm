import { db } from './src/lib/db'

async function seed() {


  console.log('Seeding database...')

  // Create admin profiles
  await db.profile.upsert({
    where: { email: 'admin@lppm.ac.id' },
    update: {},
    create: {
      email: 'admin@lppm.ac.id',
      password: 'admin123',
      fullName: 'Admin LPPM',
      role: 'super_admin',
      isActive: true,
    },
  })
  await db.profile.upsert({
    where: { email: 'editor@lppm.ac.id' },
    update: {},
    create: {
      email: 'editor@lppm.ac.id',
      password: 'admin123',
      fullName: 'Editor LPPM',
      role: 'editor',
      isActive: true,
    },
  })

  // Create news categories
  const cat1 = await db.newsCategory.upsert({
    where: { slug: 'penelitian' },
    update: {},
    create: { name: 'Penelitian', slug: 'penelitian' },
  })
  const cat2 = await db.newsCategory.upsert({
    where: { slug: 'pengabdian' },
    update: {},
    create: { name: 'Pengabdian', slug: 'pengabdian' },
  })
  const cat3 = await db.newsCategory.upsert({
    where: { slug: 'hibah' },
    update: {},
    create: { name: 'Hibah', slug: 'hibah' },
  })

  // Create news
  const newsData = [
    {
      title: 'LPPM Luncurkan Program Riset Kolaboratif 2024',
      slug: 'lppm-luncurkan-program-riset-kolaboratif-2024',
      excerpt: 'Program riset kolaboratif terbaru LPPM membuka peluang bagi dosen dan peneliti untuk mengajukan proposal penelitian interdisipliner.',
      content: 'LPPM secara resmi meluncurkan program riset kolaboratif tahun 2024 yang bertujuan mendorong penelitian interdisipliner antar fakultas.',
      categoryId: cat1.id,
      status: 'published',
      isFeatured: true,
      publishedAt: new Date('2024-03-15'),
    },
    {
      title: 'Workshop Penulisan Proposal Hibah Nasional',
      slug: 'workshop-penulisan-proposal-hibah-nasional',
      excerpt: 'Workshop ini dirancang untuk membantu dosen dalam menyusun proposal hibah yang kompetitif dan berkualitas.',
      content: 'LPPM menyelenggarakan workshop penulisan proposal hibah nasional bagi dosen yang ingin mengajukan pendanaan penelitian.',
      categoryId: cat3.id,
      status: 'published',
      isFeatured: true,
      publishedAt: new Date('2024-03-10'),
    },
    {
      title: 'Pengabdian Masyarakat di Desa Binaan',
      slug: 'pengabdian-masyarakat-desa-binaan',
      excerpt: 'Tim pengabdian LPPM melaksanakan program pemberdayaan masyarakat di desa binaan untuk meningkatkan kesejahteraan warga.',
      content: 'Tim pengabdian dari LPPM telah melaksanakan program pemberdayaan masyarakat di Desa Sukamaju.',
      categoryId: cat2.id,
      status: 'published',
      isFeatured: true,
      publishedAt: new Date('2024-03-05'),
    },
  ]

  for (const news of newsData) {
    await db.news.upsert({
      where: { slug: news.slug },
      update: {},
      create: news,
    })
  }

  // Create announcements
  const announcementData = [
    {
      title: 'Pembukaan Pendaftaran Hibah Penelitian Internal 2024',
      slug: 'pembukaan-pendaftaran-hibah-penelitian-internal-2024',
      content: 'Pendaftaran hibah penelitian internal tahun 2024 telah dibuka. Batas akhir pendaftaran adalah 30 April 2024.',
      type: 'important',
      status: 'active',
      publishedAt: new Date('2024-03-01'),
    },
    {
      title: 'Jadwal Monev Penelitian Semester Genap 2023/2024',
      slug: 'jadwal-monev-penelitian-semester-genap-2023-2024',
      content: 'Monitoring dan evaluasi penelitian semester genap akan dilaksanakan pada bulan Juni 2024.',
      type: 'normal',
      status: 'active',
      publishedAt: new Date('2024-02-28'),
    },
    {
      title: 'Sosialisasi Pedoman Penelitian dan Pengabdian Baru',
      slug: 'sosialisasi-pedoman-penelitian-dan-pengabdian-baru',
      content: 'Pedoman baru penelitian dan pengabdian telah diterbitkan. Sosialisasi akan dilaksanakan pada 20 Maret 2024.',
      type: 'important',
      status: 'active',
      publishedAt: new Date('2024-02-25'),
    },
    {
      title: 'Pengumuman Hasil Seleksi Proposal Penelitian',
      slug: 'pengumuman-hasil-seleksi-proposal-penelitian',
      content: 'Hasil seleksi proposal penelitian semester genap 2023/2024 telah diumumkan.',
      type: 'normal',
      status: 'active',
      publishedAt: new Date('2024-02-20'),
    },
    {
      title: 'Deadline Pengunggahan Laporan Akhir Penelitian',
      slug: 'deadline-pengunggahan-laporan-akhir-penelitian',
      content: 'Batas akhir pengunggahan laporan akhir penelitian semester ganjil adalah 15 Maret 2024.',
      type: 'important',
      status: 'active',
      publishedAt: new Date('2024-02-15'),
    },
  ]

  for (const ann of announcementData) {
    await db.announcement.upsert({
      where: { slug: ann.slug },
      update: {},
      create: ann,
    })
  }

  // Create faculties and study programs
  const faculties = {
    fkip: await db.faculty.upsert({
      where: { slug: 'fkip' },
      update: {},
      create: { name: 'FKIP', slug: 'fkip' },
    }),
    ekonomi: await db.faculty.upsert({
      where: { slug: 'ekonomi' },
      update: {},
      create: { name: 'Ekonomi', slug: 'ekonomi' },
    }),
    mipa: await db.faculty.upsert({
      where: { slug: 'mipa' },
      update: {},
      create: { name: 'MIPA', slug: 'mipa' },
    }),
    pisifol: await db.faculty.upsert({
      where: { slug: 'pisifol' },
      update: {},
      create: { name: 'PISIFOL', slug: 'pisifol' },
    }),
    perikanan: await db.faculty.upsert({
      where: { slug: 'perikanan' },
      update: {},
      create: { name: 'Perikanan', slug: 'perikanan' },
    }),
    teknik: await db.faculty.upsert({
      where: { slug: 'teknik' },
      update: {},
      create: { name: 'Teknik', slug: 'teknik' },
    }),
  }

  const studyPrograms = {
    // Ekonomi
    akuntansi: await db.studyProgram.upsert({
      where: { slug: 'akuntansi' },
      update: {},
      create: {
        name: 'Akuntansi',
        slug: 'akuntansi',
        facultyId: faculties.ekonomi.id,
      },
    }),
    adm: await db.studyProgram.upsert({
      where: { slug: 'adm' },
      update: {},
      create: {
        name: 'ADM',
        slug: 'adm',
        facultyId: faculties.ekonomi.id,
      },
    }),

    // FKIP
    bahasaInggris: await db.studyProgram.upsert({
      where: { slug: 'bahasa-inggris' },
      update: {},
      create: {
        name: 'Bahasa Inggris',
        slug: 'bahasa-inggris',
        facultyId: faculties.fkip.id,
      },
    }),
    pgsd: await db.studyProgram.upsert({
      where: { slug: 'pgsd' },
      update: {},
      create: {
        name: 'PGSD',
        slug: 'pgsd',
        facultyId: faculties.fkip.id,
      },
    }),

    // MIPA
    matematika: await db.studyProgram.upsert({
      where: { slug: 'matematika' },
      update: {},
      create: {
        name: 'Matematika',
        slug: 'matematika',
        facultyId: faculties.mipa.id,
      },
    }),

    // Perikanan
    ilmuKelautan: await db.studyProgram.upsert({
      where: { slug: 'ilmu-kelautan' },
      update: {},
      create: {
        name: 'Ilmu Kelautan',
        slug: 'ilmu-kelautan',
        facultyId: faculties.perikanan.id,
      },
    }),

    // PISIFOL
    teknologiHasilPertanian: await db.studyProgram.upsert({
      where: { slug: 'teknologi-hasil-pertanian' },
      update: {},
      create: {
        name: 'Teknologi Hasil Pertanian',
        slug: 'teknologi-hasil-pertanian',
        facultyId: faculties.pisifol.id,
      },
    }),

    // Teknik
    teknikIndustri: await db.studyProgram.upsert({
      where: { slug: 'teknik-industri' },
      update: {},
      create: {
        name: 'Teknik Industri',
        slug: 'teknik-industri',
        facultyId: faculties.teknik.id,
      },
    }),
    teknikInformatika: await db.studyProgram.upsert({
      where: { slug: 'teknik-informatika' },
      update: {},
      create: {
        name: 'Teknik Informatika',
        slug: 'teknik-informatika',
        facultyId: faculties.teknik.id,
      },
    }),
    teknikLingkungan: await db.studyProgram.upsert({
      where: { slug: 'teknik-lingkungan' },
      update: {},
      create: {
        name: 'Teknik Lingkungan',
        slug: 'teknik-lingkungan',
        facultyId: faculties.teknik.id,
      },
    }),
    teknikSipil: await db.studyProgram.upsert({
      where: { slug: 'teknik-sipil' },
      update: {},
      create: {
        name: 'Teknik Sipil',
        slug: 'teknik-sipil',
        facultyId: faculties.teknik.id,
      },
    }),
  }

  // Backward-compatible references for existing seed data below
  const f1 = faculties.teknik
  const f2 = faculties.ekonomi

  const sp1 = studyPrograms.teknikInformatika
  const sp2 = studyPrograms.teknikIndustri
  const sp3 = studyPrograms.akuntansi


  // Create researchers
  const r1 = await db.researcher.upsert({
    where: { id: 'researcher-1' },
    update: {},
    create: {
      id: 'researcher-1',
      name: 'Dr. Ahmad Fauzi, M.Kom.',
      nidn: '0012345678',
      degree: 'M.Kom.',
      facultyId: f1.id,
      studyProgramId: sp1.id,
      expertise: 'Artificial Intelligence',
      email: 'ahmad.fauzi@kampus.ac.id',
      isActive: true,
    },
  })
  const r2 = await db.researcher.upsert({
    where: { id: 'researcher-2' },
    update: {},
    create: {
      id: 'researcher-2',
      name: 'Prof. Siti Nurhaliza, Ph.D.',
      nidn: '0012345679',
      degree: 'Ph.D.',
      facultyId: f1.id,
      studyProgramId: sp2.id,
      expertise: 'Renewable Energy',
      email: 'siti.nurhaliza@kampus.ac.id',
      isActive: true,
    },
  })
  const r3 = await db.researcher.upsert({
    where: { id: 'researcher-3' },
    update: {},
    create: {
      id: 'researcher-3',
      name: 'Dr. Budi Santoso, M.Si.',
      nidn: '0012345680',
      degree: 'M.Si.',
      facultyId: f2.id,
      studyProgramId: sp3.id,
      expertise: 'Public Policy',
      email: 'budi.santoso@kampus.ac.id',
      isActive: true,
    },
  })

  // Create funding schemes
  const fs1 = await db.fundingScheme.upsert({
    where: { slug: 'hibah-riset-internal-2024' },
    update: {},
    create: {
      name: 'Hibah Riset Internal 2024',
      slug: 'hibah-riset-internal-2024',
      source: 'Dana Internal Kampus',
      year: 2024,
      minBudget: 15000000,
      maxBudget: 50000000,
      status: 'active',
      openDate: new Date('2024-01-01'),
      deadline: new Date('2024-04-30'),
    },
  })

  // Create featured research
  const researchData = [
    {
      title: 'Pengembangan Sistem Deteksi Dini Banjir Berbasis IoT dan Machine Learning',
      slug: 'pengembangan-sistem-deteksi-dini-banjir-iot',
      abstract: 'Penelitian ini bertujuan mengembangkan sistem deteksi dini banjir yang mengintegrasikan teknologi IoT dan algoritma machine learning untuk meningkatkan akurasi prediksi banjir di daerah rawan bencana.',
      year: 2024,
      fundingSchemeId: fs1.id,
      leaderId: r1.id,
      facultyId: f1.id,
      studyProgramId: sp1.id,
      fundingSource: 'Hibah Internal',
      budget: 45000000,
      status: 'ongoing',
      isFeatured: true,
      isPublished: true,
    },
    {
      title: 'Optimalisasi Panel Surya Hibrida untuk Daerah Tropis',
      slug: 'optimalisasi-panel-surya-hibrida-tropis',
      abstract: 'Riset ini mengeksplorasi kombinasi teknologi photovoltaic dan thermal untuk memaksimalkan efisiensi energi surya di iklim tropis Indonesia.',
      year: 2024,
      fundingSchemeId: fs1.id,
      leaderId: r2.id,
      facultyId: f1.id,
      studyProgramId: sp2.id,
      fundingSource: 'BRIN',
      budget: 120000000,
      status: 'ongoing',
      isFeatured: true,
      isPublished: true,
    },
    {
      title: 'Analisis Kebijakan Mitigasi Perubahan Iklim di Kota Pesisir',
      slug: 'analisis-kebijakan-mitigasi-perubahan-iklim',
      abstract: 'Penelitian ini menganalisis efektivitas kebijakan mitigasi perubahan iklim yang diterapkan di kota-kota pesisir Indonesia.',
      year: 2023,
      leaderId: r3.id,
      facultyId: f2.id,
      studyProgramId: sp3.id,
      fundingSource: 'Kemendikbud',
      budget: 75000000,
      status: 'completed',
      isFeatured: true,
      isPublished: true,
    },
  ]

  for (const research of researchData) {
    await db.research.upsert({
      where: { slug: research.slug },
      update: {},
      create: research,
    })
  }

  // Create featured community services
  const serviceData = [
    {
      title: 'Pemberdayaan UMKM Melalui Digital Marketing di Kecamatan Cimanggis',
      slug: 'pemberdayaan-umkm-digital-marketing-cimanggis',
      summary: 'Program pengabdian masyarakat ini membantu UMKM lokal memanfaatkan platform digital untuk memperluas jangkauan pasar.',
      location: 'Kecamatan Cimanggis',
      village: 'Kelurahan Mekarsari',
      regency: 'Kota Depok',
      year: 2024,
      leaderId: r1.id,
      facultyId: f1.id,
      studyProgramId: sp1.id,
      partnerName: 'Diskominfo Kota Depok',
      fundingSource: 'Hibah Internal',
      budget: 25000000,
      status: 'ongoing',
      isFeatured: true,
      isPublished: true,
    },
    {
      title: 'Pelatihan Instalasi Panel Surya untuk Masyarakat Pedesaan',
      slug: 'pelatihan-instalasi-panel-surya-pedesaan',
      summary: 'Pelatihan keterampilan teknis instalasi dan pemeliharaan panel surya bagi masyarakat desa yang belum terjangkau listrik PLN.',
      location: 'Desa Sukamaju',
      regency: 'Kabupaten Lebak',
      year: 2024,
      leaderId: r2.id,
      facultyId: f1.id,
      studyProgramId: sp2.id,
      partnerName: 'Dinas ESDM Banten',
      fundingSource: 'Kemensetneg',
      budget: 50000000,
      status: 'ongoing',
      isFeatured: true,
      isPublished: true,
    },
    {
      title: 'Fasilitasi Musrenbang Digital di Kabupaten Bekasi',
      slug: 'fasilitasi-musrenbang-digital-bekasi',
      summary: 'Pendampingan proses musrenbang berbasis digital untuk meningkatkan partisipasi masyarakat dalam perencanaan pembangunan.',
      location: 'Kabupaten Bekasi',
      regency: 'Kabupaten Bekasi',
      year: 2023,
      leaderId: r3.id,
      facultyId: f2.id,
      studyProgramId: sp3.id,
      partnerName: 'Bappeda Kabupaten Bekasi',
      fundingSource: 'Kemendagri',
      budget: 35000000,
      status: 'completed',
      isFeatured: true,
      isPublished: true,
    },
  ]

  for (const service of serviceData) {
    await db.communityService.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }

  // Create publications
  const publicationData = [
    {
      title: 'IoT-Based Flood Early Warning System Using Machine Learning Approach',
      slug: 'iot-flood-early-warning-ml',
      publicationType: 'journal_international',
      authors: 'Ahmad Fauzi, Rina Wijaya, Budi Prasetyo',
      journalName: 'IEEE Internet of Things Journal',
      year: 2024,
      volume: '11',
      number: '3',
      pages: '2345-2358',
      doi: '10.1109/JIOT.2024.1234567',
      accreditation: 'Q1',
      isPublished: true,
    },
    {
      title: 'Optimasi Efisiensi Panel Surya Hibrida dengan Sistem Pelacak Matahari Otomatis',
      slug: 'optimasi-panel-surya-hibrida',
      publicationType: 'journal_national',
      authors: 'Siti Nurhaliza, Andi Pratama',
      journalName: 'Jurnal Teknik Elektro Indonesia',
      year: 2024,
      volume: '15',
      number: '1',
      pages: '45-56',
      issn: '2086-XXXX',
      accreditation: 'SINTA 2',
      isPublished: true,
    },
    {
      title: 'Analisis Efektivitas Kebijakan Mitigasi Perubahan Iklim di Wilayah Pesisir',
      slug: 'analisis-efektivitas-kebijakan-iklim-pesisir',
      publicationType: 'journal_national',
      authors: 'Budi Santoso, Dewi Lestari',
      journalName: 'Jurnal Kebijakan Publik',
      year: 2023,
      volume: '8',
      number: '2',
      pages: '112-125',
      issn: '2088-XXXX',
      accreditation: 'SINTA 3',
      isPublished: true,
    },
    {
      title: 'Digital Transformation of MSMEs in Post-Pandemic Indonesia',
      slug: 'digital-transformation-msme-post-pandemic',
      publicationType: 'proceeding',
      authors: 'Ahmad Fauzi, Siti Nurhaliza',
      journalName: 'Proceedings of ICITSI 2024',
      year: 2024,
      doi: '10.1145/XXXXX.XXXXX',
      isPublished: true,
    },
    {
      title: 'Community-Based Solar Panel Installation Training for Rural Electrification',
      slug: 'community-solar-panel-training',
      publicationType: 'journal_international',
      authors: 'Siti Nurhaliza, Budi Santoso, Rina Wijaya',
      journalName: 'Energy for Sustainable Development',
      year: 2024,
      volume: '76',
      pages: '89-101',
      doi: '10.1016/j.esd.2024.123456',
      accreditation: 'Q2',
      isPublished: true,
    },
  ]

  for (const pub of publicationData) {
    await db.publication.upsert({
      where: { slug: pub.slug },
      update: {},
      create: pub,
    })
  }

  // Create partners
  const partnerData = [
    {
      name: 'BRIN (Badan Riset dan Inovasi Nasional)',
      slug: 'brin',
      partnerType: 'government',
      cooperationType: 'Penelitian Kolaboratif',
      status: 'active',
    },
    {
      name: 'PT. Telkom Indonesia',
      slug: 'pt-telkom-indonesia',
      partnerType: 'industry',
      cooperationType: 'Riset dan Pengembangan',
      status: 'active',
    },
    {
      name: 'Universitas Indonesia',
      slug: 'universitas-indonesia',
      partnerType: 'university',
      cooperationType: 'Penelitian Bersama',
      status: 'active',
    },
    {
      name: 'Dinas Komunikasi dan Informatika Kota Depok',
      slug: 'diskominfo-depok',
      partnerType: 'government',
      cooperationType: 'Pengabdian Masyarakat',
      status: 'active',
    },
    {
      name: 'Yayasan Lingkungan Hidup Indonesia',
      slug: 'ylhi',
      partnerType: 'ngo',
      cooperationType: 'Advokasi Kebijakan Lingkungan',
      status: 'active',
    },
    {
      name: 'Pemerintah Kabupaten Lebak',
      slug: 'pemkab-lebak',
      partnerType: 'government',
      cooperationType: 'Pemberdayaan Masyarakat',
      status: 'active',
    },
  ]

  for (const partner of partnerData) {
    await db.partner.upsert({
      where: { slug: partner.slug },
      update: {},
      create: partner,
    })
  }

  console.log('Seeding completed successfully!')
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
