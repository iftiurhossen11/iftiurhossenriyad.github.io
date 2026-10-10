const projectsData = {
  featured: [
    {
      name: 'APON', status: 'prototype', statusKey: 'projects_status_prototype',
      roleKey: 'project_apon_role', descriptionKey: 'project_apon_desc',
      features: [{ key: 'project_apon_feature_identity' }, { key: 'project_apon_feature_bazar' }, { key: 'project_apon_feature_services' }, { key: 'project_apon_feature_student_community_agro' }, { key: 'project_apon_feature_master_ai' }, { key: 'project_apon_feature_agents' }],
      tech: ['AI', { key: 'project_tag_security' }, { key: 'project_tag_ecosystem' }], contextKey: 'project_apon_context',
      visualType: 'mockup', screenshots: ['screenshots/mockups/apon.svg']
    },
    {
      name: 'CampusNet', status: 'prototype', statusKey: 'projects_status_prototype',
      roleKey: 'project_campusnet_role', descriptionKey: 'project_campusnet_desc',
      features: [{ key: 'project_campusnet_feature_identity' }, { key: 'project_campusnet_feature_verification' }, { key: 'project_campusnet_feature_privacy' }, { key: 'project_campusnet_feature_discovery' }, { key: 'project_campusnet_feature_ctf' }, { key: 'project_campusnet_feature_files' }],
      tech: [{ key: 'project_tag_security_first' }, { key: 'project_tag_networking' }],
      visualType: 'mockup', screenshots: ['screenshots/mockups/campusnet.svg']
    },
    {
      name: 'IR Prohori', status: 'working', statusKey: 'projects_status_working',
      roleKey: 'project_prohori_role', descriptionKey: 'project_prohori_desc',
      features: [{ key: 'project_prohori_feature_rag' }, { key: 'project_prohori_feature_sources' }, { key: 'project_prohori_feature_laws' }, { key: 'project_prohori_feature_helpline_toolkit' }, { key: 'project_prohori_feature_ambassadors' }],
      tech: ['RAG', 'AI', { key: 'project_tag_social_impact' }], contextKey: 'project_prohori_context',
      githubLink: 'https://github.com/iftiurhossenriyad/IR-Prohori',
      screenshots: [
        'screenshots/ir-prohori/ir-prohori-01.jpg',
        'screenshots/ir-prohori/ir-prohori-02.jpg',
        'screenshots/ir-prohori/ir-prohori-03.jpg',
        'screenshots/ir-prohori/ir-prohori-04.jpg'
      ]
    },
    {
      name: 'NOJORGHOR', status: 'working', statusKey: 'projects_status_working',
      roleKey: 'project_nojorghor_role', descriptionKey: 'project_nojorghor_desc',
      features: [{ key: 'project_nojorghor_feature_agents' }, { key: 'project_nojorghor_feature_rules' }, { key: 'project_nojorghor_feature_isolation' }, { key: 'project_nojorghor_feature_alerts' }, { key: 'project_nojorghor_feature_context' }, { key: 'project_nojorghor_feature_blocking' }],
      tech: ['scikit-learn', 'IDS', 'ML'], contextKey: 'project_nojorghor_context',
      visualType: 'mockup', screenshots: ['screenshots/mockups/nojorghor.svg']
    },
    {
      name: 'SURAKSHA', status: 'proposal', statusKey: 'projects_status_proposal',
      roleKey: 'project_suraksha_role', descriptionKey: 'project_suraksha_desc',
      features: [{ key: 'project_suraksha_feature_sos' }, { key: 'project_suraksha_feature_location' }, { key: 'project_suraksha_feature_lifecycle' }, { key: 'project_suraksha_feature_dashboard' }, { key: 'project_suraksha_feature_privacy' }, { key: 'project_suraksha_feature_audit' }],
      tech: [{ key: 'project_tag_emergency' }, { key: 'project_tag_privacy' }, { key: 'project_tag_tracking' }],
      contextKey: 'project_suraksha_context',
      visualType: 'mockup', screenshots: ['screenshots/mockups/suraksha.svg']
    }
  ],
  classic: [
    {
      name: 'ThreatGuard', roleKey: 'project_threatguard_role', descriptionKey: 'project_threatguard_desc',
      tech: ['C++', 'Cryptography', 'OOP'], contextKey: 'project_threatguard_context',
      githubLink: 'https://github.com/iftiurhossenriyad/ThreatGuard-Intrusion-Detection-System',
      screenshots: ['screenshots/cropped/threatguard-build.jpg']
    },
    {
      name: 'SecureAudit', roleKey: 'project_secureaudit_role', descriptionKey: 'project_secureaudit_desc',
      tech: ['Java', 'SQLite', 'Nmap', 'Lynis', 'Nikto'], contextKey: 'project_secureaudit_context',
      githubLink: 'https://github.com/iftiurhossenriyad/SecureAudRT',
      screenshots: [
        'screenshots/cropped/secureaudit-overview.jpg',
        'screenshots/cropped/secureaudit-scan.jpg',
        'screenshots/cropped/secureaudit-ledger.jpg'
      ]
    },
    {
      name: 'Buy & Sell Platform', roleKey: 'project_buysell_role', descriptionKey: 'project_buysell_desc',
      tech: ['C++', 'OOP', { key: 'project_tag_file_io' }, 'DSA'], contextKey: 'project_buysell_context',
      githubLink: 'https://github.com/iftiurhossenriyad/Buy-And-Sell-Platform',
      screenshots: [
        'screenshots/cropped/buysell-search-product.jpg',
        'screenshots/cropped/buysell-add-product.jpg',
        'screenshots/cropped/buysell-admin-menu.jpg',
        'screenshots/cropped/buysell-products.jpg'
      ]
    },
    {
      name: 'EduQuiz', roleKey: 'project_eduquiz_role', descriptionKey: 'project_eduquiz_desc',
      tech: ['PHP', 'MySQL', 'Bootstrap', 'Java/Kotlin'], contextKey: 'project_eduquiz_context',
      githubLink: 'https://github.com/iftiurhossenriyad/eduquiz',
      screenshots: [
        'screenshots/cropped/eduquiz-admin-dashboard.jpg',
        'screenshots/cropped/eduquiz-login.jpg',
        'screenshots/cropped/eduquiz-student-dashboard.jpg'
      ]
    }
  ],
  publicRepositories: [
    { name: 'MyGenie', url: 'https://github.com/iftiurhossenriyad/MyGenie' },
    { name: 'IR Prohori', url: 'https://github.com/iftiurhossenriyad/IR-Prohori' },
    { name: 'EduQuiz', url: 'https://github.com/iftiurhossenriyad/eduquiz' },
    { name: 'Ortho Mess Management', url: 'https://github.com/iftiurhossenriyad/ortho-mess-management' },
    { name: 'SecureAudit', url: 'https://github.com/iftiurhossenriyad/SecureAudRT' },
    { name: 'ThreatGuard', url: 'https://github.com/iftiurhossenriyad/ThreatGuard-Intrusion-Detection-System' },
    { name: 'Buy & Sell Platform', url: 'https://github.com/iftiurhossenriyad/Buy-And-Sell-Platform' }
  ]
};
