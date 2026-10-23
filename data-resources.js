const textNoteResources = [
  {
    titleEn: 'Artificial Intelligence Research',
    titleBn: 'কৃত্রিম বুদ্ধিমত্তা গবেষণা',
    file: 'course-note-artificial-intelligence-research.txt'
  },
  {
    titleEn: 'Cyber Security Architecture',
    titleBn: 'সাইবার নিরাপত্তা আর্কিটেকচার',
    file: 'course-note-cyber-security-architecture.txt'
  },
  {
    titleEn: 'Cybersecurity for Kids',
    titleBn: 'শিশুদের জন্য সাইবার নিরাপত্তা',
    file: 'course-note-cybersecurity-for-kids.txt'
  },
  {
    titleEn: 'Cybersecurity Fundamentals and Insights',
    titleBn: 'সাইবার নিরাপত্তার মৌলিক বিষয় ও ধারণা',
    file: 'course-note-cybersecurity-fundamentals.txt'
  },
  {
    titleEn: 'Cybersecurity Concepts — English',
    titleBn: 'সাইবার নিরাপত্তার ধারণা — ইংরেজি',
    file: 'course-note-cybersecurity-concepts.txt'
  },
  {
    titleEn: 'Cybersecurity Concepts — Bangla',
    titleBn: 'সাইবার নিরাপত্তার ধারণা — বাংলা',
    file: 'course-note-cybersecurity-concepts-bangla.txt'
  },
  {
    titleEn: 'Cybersecurity Concepts — Riyad Edition',
    titleBn: 'সাইবার নিরাপত্তার ধারণা — রিয়াদ সংস্করণ',
    file: 'course-note-cybersecurity-concepts-riyad.txt'
  },
  {
    titleEn: 'Foundations of Log Analysis for Cyber Defense',
    titleBn: 'সাইবার প্রতিরক্ষায় লগ বিশ্লেষণের ভিত্তি',
    file: 'course-note-defensive-log-analysis.txt'
  },
  {
    titleEn: 'HTML Introduction',
    titleBn: 'HTML পরিচিতি',
    file: 'course-note-html-introduction.txt'
  },
  {
    titleEn: 'Introduction to Microsoft Security Solutions',
    titleBn: 'মাইক্রোসফট নিরাপত্তা সমাধানের পরিচিতি',
    file: 'course-note-microsoft-security-solutions.txt'
  },
  {
    titleEn: 'Introduction to Python for Defensive Security',
    titleBn: 'প্রতিরক্ষামূলক নিরাপত্তায় Python পরিচিতি',
    file: 'course-note-python-defensive-security.txt'
  },
  {
    titleEn: 'Introduction to Security, Compliance, and Identity',
    titleBn: 'নিরাপত্তা, কমপ্লায়েন্স ও পরিচিতি ব্যবস্থাপনার পরিচিতি',
    file: 'course-note-security-compliance-identity.txt'
  }
].map((note) => ({
  icon: '📝',
  titleEn: note.titleEn,
  titleBn: note.titleBn,
  descriptionEn: 'Read the plain-text edition of this personal study note.',
  descriptionBn: 'এই ব্যক্তিগত অধ্যয়ন-নোটের টেক্সট সংস্করণ পড়ুন।',
  fileType: 'TXT · UTF-8',
  downloadUrl: `resources/${note.file}`,
  actionKey: 'resource_read_text_note',
  featured: false
}));

const resourcesData = [
  {
    icon: '📄',
    titleEn: 'Bilingual Cyber Safety Checklist',
    titleBn: 'দ্বিভাষিক সাইবার নিরাপত্তা চেকলিস্ট',
    descriptionEn: 'A practical English and Bangla guide to stronger accounts, safer devices, backups, and recovery after an account incident.',
    descriptionBn: 'অ্যাকাউন্ট সুরক্ষা, ডিভাইস নিরাপত্তা, ব্যাকআপ এবং অ্যাকাউন্ট-সংক্রান্ত ঘটনার পর করণীয় নিয়ে বাংলা ও ইংরেজির ব্যবহারিক গাইড।',
    fileType: 'HTML · EN/বাংলা',
    downloadUrl: 'resources/cyber-safety-guide.html',
    actionKey: 'resource_read_guide',
    featured: true
  },
  {
    icon: '📚',
    titleEn: 'Course Notes Collection (28 DOCX)',
    titleBn: 'কোর্স নোটের সংকলন (২৮টি DOCX)',
    descriptionEn: 'Download 28 personal study notes covering cybersecurity foundations, defensive security, AI, and related topics. These are not official course materials; use offensive-security topics only in authorized labs.',
    descriptionBn: 'সাইবার নিরাপত্তার ভিত্তি, প্রতিরক্ষামূলক নিরাপত্তা, AI ও সংশ্লিষ্ট বিষয়ে ২৮টি ব্যক্তিগত অধ্যয়ন-নোট একসঙ্গে ডাউনলোড করুন। এগুলো কোনো কোর্সের অফিসিয়াল উপকরণ নয়; আক্রমণাত্মক নিরাপত্তাসংক্রান্ত বিষয় কেবল অনুমোদিত ল্যাবেই চর্চা করুন।',
    fileType: 'ZIP · 28 DOCX',
    fileSize: '63.0 MiB',
    downloadUrl: 'resources/course-notes.zip',
    actionKey: 'resource_download_notes',
    featured: false
  },
  ...textNoteResources,
  {
    icon: '🛡️',
    titleEn: 'Secure Our World — CISA',
    titleBn: 'Secure Our World — CISA',
    descriptionEn: 'Official guidance on strong passwords, multifactor authentication, software updates, and recognizing phishing.',
    descriptionBn: 'শক্তিশালী পাসওয়ার্ড, মাল্টি-ফ্যাক্টর অথেনটিকেশন, সফটওয়্যার আপডেট এবং ফিশিং চেনার সরকারি নির্দেশিকা।',
    fileType: 'Official website',
    downloadUrl: 'https://www.cisa.gov/secure-our-world',
    actionKey: 'resource_open_source',
    external: true,
    featured: false
  },
  {
    icon: '🔎',
    titleEn: 'Have I Been Pwned',
    titleBn: 'Have I Been Pwned',
    descriptionEn: 'Check whether an email address appears in known breach records. Never enter a password into a breach-checking site.',
    descriptionBn: 'কোনো ইমেইল ঠিকানা পরিচিত ডেটা ফাঁসের তালিকায় আছে কি না দেখুন। breach-checking সাইটে কখনো পাসওয়ার্ড দেবেন না।',
    fileType: 'Breach lookup',
    downloadUrl: 'https://haveibeenpwned.com/',
    actionKey: 'resource_open_source',
    external: true,
    featured: false
  }
];
