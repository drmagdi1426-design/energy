import type { QuadrantKey, BehavioralItemCodeKey } from '@/lib/scoring';

export interface Dictionary {
  common: {
    appName: string;
    tagline: string;
    languageToggle: string;
    back: string;
    next: string;
    submit: string;
    submitting: string;
    optional: string;
    minutes: string;
  };
  landing: {
    title: string;
    intro: string;
    purposeTitle: string;
    purpose: string;
    /** Contains a literal "{minutes}" token — see lib/i18n/format.ts#fillTemplate. */
    estimatedTimeLabel: string;
    /** Contains a literal "{items}" token. */
    itemCountNote: string;
    startButton: string;
    adminLink: string;
  };
  consent: {
    title: string;
    intro: string;
    collectTitle: string;
    collectItems: string[];
    purposeTitle: string;
    purposeText: string;
    retentionTitle: string;
    /** Contains a literal "{months}" token. */
    retentionText: string;
    accessTitle: string;
    accessText: string;
    anonymityTitle: string;
    anonymityText: string;
    checkboxLabel: string;
    continueButton: string;
    requiredNote: string;
  };
  sectionA: {
    title: string;
    instructions: string;
    quadrant: Record<QuadrantKey, { label: string; descriptor: string }>;
    totalLabel: string;
    totalHint: string;
    errorSum: string;
  };
  sectionB: {
    title: string;
    instructions: string;
    scale: Record<'1' | '2' | '3' | '4' | '5', string>;
    items: Record<BehavioralItemCodeKey, string>;
  };
  optionalFields: {
    title: string;
    helper: string;
    teamLabel: string;
    departmentLabel: string;
    cycleLabel: string;
    cycleHelper: string;
  };
  confirmation: {
    title: string;
    body: string;
    note: string;
    homeLink: string;
  };
  errors: {
    generic: string;
    rateLimited: string;
    validation: string;
  };
  admin: {
    loginTitle: string;
    usernameLabel: string;
    passwordLabel: string;
    loginButton: string;
    invalidCredentials: string;
    lockedOut: string;
    logout: string;
    dashboardTitle: string;
    navDashboard: string;
    navResponses: string;
    filterFrom: string;
    filterTo: string;
    filterTeam: string;
    filterDepartment: string;
    filterCycle: string;
    filterApply: string;
    filterClear: string;
    totalResponses: string;
    avgDistributionTitle: string;
    dominantBreakdownTitle: string;
    trendTitle: string;
    riskFlagsTitle: string;
    noRiskFlags: string;
    quadrant: Record<QuadrantKey, string>;
    zone: Record<QuadrantKey, string>;
    dominantTie: string;
    exportCsv: string;
    responsesTitle: string;
    columnDate: string;
    columnTeam: string;
    columnDepartment: string;
    columnCycle: string;
    columnDominant: string;
    columnAudit: string;
    viewDetail: string;
    detailTitle: string;
    deleteResponse: string;
    deleteConfirm: string;
    anonymized: string;
    auditLogTitle: string;
    submissionInfoTitle: string;
    computedScoresTitle: string;
    itemColumn: string;
    quadrantColumn: string;
    ratingColumn: string;
    localeLabel: string;
  };
}

const en: Dictionary = {
  common: {
    appName: 'Team Energy Matrix',
    tagline: 'Tharwah HR Diagnostic',
    languageToggle: 'العربية',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    submitting: 'Submitting…',
    optional: 'Optional',
    minutes: 'minutes',
  },
  landing: {
    title: 'Team Energy Matrix',
    intro:
      'A short, confidential diagnostic that shows where your working hours and energy actually go — across four quadrants: Performance, Survival, Burnout, and Renewal.',
    purposeTitle: 'Why we ask',
    purpose:
      'Your responses are combined with your team\'s to help leadership see patterns — like sustained overload or burnout risk — that are hard to spot from individual conversations alone. Individual results are not shown to you; only aggregated, admin-reviewed analysis is used for decisions.',
    estimatedTimeLabel: 'Estimated time: {minutes} minutes',
    itemCountNote: '{items} short items — no essay answers.',
    startButton: 'Start the assessment',
    adminLink: 'Admin login',
  },
  consent: {
    title: 'Before you begin',
    intro:
      'This tool is provided by Tharwah for internal HR diagnostic purposes and is processed in line with Saudi Arabia\'s Personal Data Protection Law (PDPL).',
    collectTitle: 'What we collect',
    collectItems: [
      'Your allocation of working-hours across four energy quadrants (percentages)',
      'Your ratings on 8 short behavioral statements (1–5 scale)',
      'Optionally, and only if you choose to provide it: team/department and a submission-cycle label',
    ],
    purposeTitle: 'Why we collect it',
    purposeText:
      'Solely to produce aggregate, team-level analysis of energy distribution and burnout risk for HR and leadership decision-making. Responses are anonymous by default — no name, email, or employee ID is collected.',
    retentionTitle: 'Retention period',
    retentionText:
      'Raw responses are retained for {months} months, after which optional team/department fields are automatically anonymized. Aggregate statistics may be retained longer for trend reporting.',
    accessTitle: 'Access & your rights',
    accessText:
      'Only authorized, password-protected Tharwah admin accounts can view response data. Every view or export is logged. Because responses are anonymous, Tharwah generally cannot identify or produce a single individual\'s data on request — see the README for the documented process if named tracking is ever enabled.',
    anonymityTitle: 'Anonymity',
    anonymityText:
      'This submission is anonymous by default. The optional team/department fields below are the only identifying-adjacent information collected, and you may leave them blank.',
    checkboxLabel: 'I have read this notice and I consent to my responses being processed as described above.',
    continueButton: 'Continue to the assessment',
    requiredNote: 'You must provide consent to continue — this cannot be skipped.',
  },
  sectionA: {
    title: 'Section A — Quadrant Time-Distribution Audit',
    instructions:
      'Thinking about your last 30 working days, estimate what share of your working hours fell into each quadrant below. The four values must add up to 100%.',
    quadrant: {
      SURVIVAL: {
        label: 'Survival',
        descriptor:
          'Reacting under pressure — firefighting, urgent demands, defensive decisions made just to get through the day.',
      },
      PERFORMANCE: {
        label: 'Performance',
        descriptor: 'Focused and effective — meaningful progress, engaged work, sustainable output.',
      },
      BURNOUT: {
        label: 'Burnout',
        descriptor: 'Running on empty — exhaustion, disengagement, going through the motions.',
      },
      RENEWAL: {
        label: 'Renewal',
        descriptor: 'Recovering — rest, reflection, and activities that restore your energy.',
      },
    },
    totalLabel: 'Total',
    totalHint: 'Must equal 100%',
    errorSum: 'The four percentages must add up to 100%.',
  },
  sectionB: {
    title: 'Section B — Behavioral Diagnostic',
    instructions: 'How often has each statement been true for you over the last 30 days?',
    scale: { '1': 'Never', '2': 'Rarely', '3': 'Sometimes', '4': 'Often', '5': 'Always' },
    items: {
      S1: 'I make decisions from urgency and pressure rather than clear thinking.',
      S2: 'I feel like I\'m reacting to demands rather than in control of my day.',
      P1: 'I feel focused, capable, and in control of my workload.',
      P2: 'I get meaningful results without pushing myself to the edge to achieve them.',
      B1: 'I feel physically or mentally exhausted, even after resting.',
      B2: 'I find it hard to care about work that used to matter to me.',
      R1: 'I take real breaks that help me recover during the workday.',
      R2: 'I feel calm and re-energized, not just "getting by".',
    },
  },
  optionalFields: {
    title: 'Optional context',
    helper: 'These fields are optional and only used for team-level reporting. Leave them blank to stay fully anonymous.',
    teamLabel: 'Team',
    departmentLabel: 'Department',
    cycleLabel: 'Submission cycle',
    cycleHelper: 'e.g. "2026-Q1" — helps group this with future check-ins',
  },
  confirmation: {
    title: 'Thank you',
    body: 'Your response has been recorded. There is nothing else to do.',
    note:
      'Results are not shown here — Tharwah HR reviews aggregated, team-level analysis rather than individual scores, to keep interpretation consistent and avoid self-diagnosis.',
    homeLink: 'Return to start',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    rateLimited: 'Too many submissions from this network. Please try again later.',
    validation: 'Please check the highlighted fields.',
  },
  admin: {
    loginTitle: 'Admin sign-in',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginButton: 'Sign in',
    invalidCredentials: 'Invalid username or password.',
    lockedOut: 'Too many failed attempts. Please wait 15 minutes and try again.',
    logout: 'Sign out',
    dashboardTitle: 'Dashboard',
    navDashboard: 'Dashboard',
    navResponses: 'Responses',
    filterFrom: 'From',
    filterTo: 'To',
    filterTeam: 'Team',
    filterDepartment: 'Department',
    filterCycle: 'Cycle',
    filterApply: 'Apply filters',
    filterClear: 'Clear',
    totalResponses: 'Total responses',
    avgDistributionTitle: 'Average quadrant time-distribution',
    dominantBreakdownTitle: 'Dominant behavioral baseline',
    trendTitle: 'Trend across cycles',
    riskFlagsTitle: 'Risk flags',
    noRiskFlags: 'No risk thresholds currently exceeded.',
    quadrant: {
      SURVIVAL: 'Survival',
      PERFORMANCE: 'Performance',
      BURNOUT: 'Burnout',
      RENEWAL: 'Renewal',
    },
    zone: {
      SURVIVAL: 'Overload Zone',
      PERFORMANCE: 'Optimization Zone',
      BURNOUT: 'Crisis Zone',
      RENEWAL: 'Preservation Zone',
    },
    dominantTie: 'Tied',
    exportCsv: 'Export CSV',
    responsesTitle: 'Responses',
    columnDate: 'Date',
    columnTeam: 'Team',
    columnDepartment: 'Department',
    columnCycle: 'Cycle',
    columnDominant: 'Dominant',
    columnAudit: 'Audit (S/P/B/R %)',
    viewDetail: 'View',
    detailTitle: 'Response detail',
    deleteResponse: 'Delete (erasure request)',
    deleteConfirm: 'Permanently delete this response? This cannot be undone.',
    anonymized: 'Anonymized',
    auditLogTitle: 'Recent admin activity',
    submissionInfoTitle: 'Submission info',
    computedScoresTitle: 'Computed scores',
    itemColumn: 'Item',
    quadrantColumn: 'Quadrant',
    ratingColumn: 'Rating',
    localeLabel: 'Language used',
  },
};

const ar: Dictionary = {
  common: {
    appName: 'مصفوفة طاقة الفريق',
    tagline: 'أداة ثروة التشخيصية للموارد البشرية',
    languageToggle: 'English',
    back: 'رجوع',
    next: 'التالي',
    submit: 'إرسال',
    submitting: 'جارٍ الإرسال…',
    optional: 'اختياري',
    minutes: 'دقائق',
  },
  landing: {
    title: 'مصفوفة طاقة الفريق',
    intro:
      'تشخيص سريع وسرّي يوضح إلى أين تذهب ساعات عملك وطاقتك فعليًا، عبر أربعة أرباع: الأداء، البقاء، الاحتراق الوظيفي، والتجدد.',
    purposeTitle: 'لماذا نسأل',
    purpose:
      'تُجمع إجاباتك مع إجابات فريقك لمساعدة الإدارة على رصد أنماط — مثل الحمل الزائد المستمر أو مخاطر الاحتراق الوظيفي — يصعب ملاحظتها من المحادثات الفردية وحدها. لا تُعرض عليك نتائجك الفردية؛ يُستخدم فقط التحليل المجمّع الذي تراجعه الإدارة في اتخاذ القرارات.',
    estimatedTimeLabel: 'الوقت المتوقع: {minutes} دقائق',
    itemCountNote: '{items} عناصر قصيرة — بدون إجابات مقالية.',
    startButton: 'ابدأ التقييم',
    adminLink: 'دخول المسؤول',
  },
  consent: {
    title: 'قبل أن تبدأ',
    intro: 'تقدّم ثروة هذه الأداة لأغراض التشخيص الداخلي للموارد البشرية، وتتم معالجتها وفقًا لنظام حماية البيانات الشخصية السعودي (PDPL).',
    collectTitle: 'ما الذي نجمعه',
    collectItems: [
      'توزيعك لساعات العمل عبر أربعة أرباع للطاقة (نسب مئوية)',
      'تقييماتك على 8 عبارات سلوكية قصيرة (مقياس من 1 إلى 5)',
      'اختياريًا، وفقط إذا اخترت تقديمها: الفريق/القسم وتسمية دورة الإرسال',
    ],
    purposeTitle: 'لماذا نجمعها',
    purposeText:
      'فقط لإعداد تحليل مجمّع على مستوى الفريق لتوزيع الطاقة ومخاطر الاحتراق الوظيفي، لدعم قرارات الموارد البشرية والإدارة. الإجابات مجهولة الهوية افتراضيًا — لا يُجمع أي اسم أو بريد إلكتروني أو رقم وظيفي.',
    retentionTitle: 'مدة الاحتفاظ بالبيانات',
    retentionText:
      'يُحتفظ بالإجابات الخام لمدة {months} شهرًا، وبعدها تُخفى هوية الحقول الاختيارية (الفريق/القسم) تلقائيًا. يمكن الاحتفاظ بالإحصاءات المجمّعة لفترة أطول لأغراض تقارير الاتجاهات.',
    accessTitle: 'الوصول وحقوقك',
    accessText:
      'يمكن فقط لحسابات إدارة ثروة المصرَّح لها والمحمية بكلمة مرور الاطلاع على بيانات الإجابات. تُسجَّل كل عملية عرض أو تصدير. ولأن الإجابات مجهولة الهوية، لا تستطيع ثروة عمومًا تحديد هوية فرد بعينه أو استخراج بياناته بناءً على طلب — راجع ملف README للاطلاع على العملية الموثّقة في حال تفعيل التتبع بالاسم مستقبلًا.',
    anonymityTitle: 'إخفاء الهوية',
    anonymityText: 'هذا الإرسال مجهول الهوية افتراضيًا. حقلا الفريق/القسم أدناه هما المعلومتان الوحيدتان شبه التعريفية التي تُجمع، ويمكنك تركهما فارغين.',
    checkboxLabel: 'لقد قرأت هذا الإشعار وأوافق على معالجة إجاباتي على النحو الموضح أعلاه.',
    continueButton: 'المتابعة إلى التقييم',
    requiredNote: 'يجب تقديم الموافقة للمتابعة — لا يمكن تخطي هذه الخطوة.',
  },
  sectionA: {
    title: 'القسم أ — تدقيق توزيع الوقت عبر الأرباع',
    instructions: 'بالتفكير في آخر 30 يوم عمل، قدّر النسبة التي شكّلها كل ربع أدناه من ساعات عملك. يجب أن يكون مجموع القيم الأربع 100٪.',
    quadrant: {
      SURVIVAL: {
        label: 'البقاء',
        descriptor: 'التفاعل تحت الضغط: إخماد الحرائق، والمطالب العاجلة، وقرارات دفاعية هدفها فقط تجاوز اليوم.',
      },
      PERFORMANCE: {
        label: 'الأداء',
        descriptor: 'التركيز والفعالية: تقدّم ذو معنى، وعمل متفاعل، وإنتاجية مستدامة.',
      },
      BURNOUT: {
        label: 'الاحتراق الوظيفي',
        descriptor: 'العمل دون طاقة: الإرهاق، والانفصال عن العمل، وأداء المهام بشكل آلي.',
      },
      RENEWAL: {
        label: 'التجدد',
        descriptor: 'التعافي: الراحة، والتأمل، والأنشطة التي تجدد طاقتك.',
      },
    },
    totalLabel: 'المجموع',
    totalHint: 'يجب أن يساوي 100٪',
    errorSum: 'يجب أن يكون مجموع النسب الأربع 100٪.',
  },
  sectionB: {
    title: 'القسم ب — التشخيص السلوكي',
    instructions: 'خلال آخر 30 يومًا، كم مرة كانت كل عبارة صحيحة بالنسبة لك؟',
    scale: { '1': 'أبدًا', '2': 'نادرًا', '3': 'أحيانًا', '4': 'غالبًا', '5': 'دائمًا' },
    items: {
      S1: 'أتخذ قراراتي بدافع الاستعجال والضغط بدلاً من التفكير الواضح.',
      S2: 'أشعر أنني أتفاعل مع المطالب بدلاً من التحكم في يومي.',
      P1: 'أشعر بالتركيز والكفاءة والتحكم في عبء عملي.',
      P2: 'أحقق نتائج ذات معنى دون أن أدفع نفسي إلى أقصى حدودي لتحقيقها.',
      B1: 'أشعر بالإرهاق الجسدي أو الذهني حتى بعد الراحة.',
      B2: 'أجد صعوبة في الاهتمام بعمل كان يهمني سابقًا.',
      R1: 'آخذ فترات راحة حقيقية تساعدني على التعافي خلال يوم العمل.',
      R2: 'أشعر بالهدوء وتجدد الطاقة، وليس فقط بـ"التأقلم" مع الأمور.',
    },
  },
  optionalFields: {
    title: 'سياق اختياري',
    helper: 'هذه الحقول اختيارية وتُستخدم فقط لتقارير مستوى الفريق. اتركها فارغة لتبقى مجهول الهوية تمامًا.',
    teamLabel: 'الفريق',
    departmentLabel: 'القسم',
    cycleLabel: 'دورة الإرسال',
    cycleHelper: 'مثال: "2026-Q1" — يساعد في تجميع هذه الإجابة مع متابعات مستقبلية',
  },
  confirmation: {
    title: 'شكرًا لك',
    body: 'تم تسجيل إجابتك. لا حاجة لأي إجراء آخر.',
    note: 'لا تُعرض النتائج هنا — تراجع إدارة الموارد البشرية في ثروة التحليل المجمّع على مستوى الفريق بدلاً من الدرجات الفردية، للحفاظ على تفسير موحّد وتجنّب قلق التشخيص الذاتي.',
    homeLink: 'العودة إلى البداية',
  },
  errors: {
    generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    rateLimited: 'عدد كبير جدًا من الإرسالات من هذه الشبكة. يرجى المحاولة لاحقًا.',
    validation: 'يرجى مراجعة الحقول المميزة.',
  },
  admin: {
    loginTitle: 'تسجيل دخول المسؤول',
    usernameLabel: 'اسم المستخدم',
    passwordLabel: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    lockedOut: 'محاولات فاشلة كثيرة جدًا. يرجى الانتظار 15 دقيقة والمحاولة مرة أخرى.',
    logout: 'تسجيل الخروج',
    dashboardTitle: 'لوحة التحكم',
    navDashboard: 'لوحة التحكم',
    navResponses: 'الإجابات',
    filterFrom: 'من',
    filterTo: 'إلى',
    filterTeam: 'الفريق',
    filterDepartment: 'القسم',
    filterCycle: 'الدورة',
    filterApply: 'تطبيق التصفية',
    filterClear: 'مسح',
    totalResponses: 'إجمالي الإجابات',
    avgDistributionTitle: 'متوسط توزيع الوقت عبر الأرباع',
    dominantBreakdownTitle: 'الأساس السلوكي الغالب',
    trendTitle: 'الاتجاه عبر الدورات',
    riskFlagsTitle: 'مؤشرات المخاطر',
    noRiskFlags: 'لا توجد عتبات مخاطر متجاوَزة حاليًا.',
    quadrant: {
      SURVIVAL: 'البقاء',
      PERFORMANCE: 'الأداء',
      BURNOUT: 'الاحتراق الوظيفي',
      RENEWAL: 'التجدد',
    },
    zone: {
      SURVIVAL: 'منطقة الحمل الزائد',
      PERFORMANCE: 'منطقة التحسين الأمثل',
      BURNOUT: 'منطقة الأزمة',
      RENEWAL: 'منطقة الحفاظ على الطاقة',
    },
    dominantTie: 'تعادل',
    exportCsv: 'تصدير CSV',
    responsesTitle: 'الإجابات',
    columnDate: 'التاريخ',
    columnTeam: 'الفريق',
    columnDepartment: 'القسم',
    columnCycle: 'الدورة',
    columnDominant: 'الغالب',
    columnAudit: 'التدقيق (ب/أ/ح/ت %)',
    viewDetail: 'عرض',
    detailTitle: 'تفاصيل الإجابة',
    deleteResponse: 'حذف (طلب محو)',
    deleteConfirm: 'هل تريد حذف هذه الإجابة نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.',
    anonymized: 'تم إخفاء الهوية',
    auditLogTitle: 'نشاط الإدارة الأخير',
    submissionInfoTitle: 'معلومات الإرسال',
    computedScoresTitle: 'الدرجات المحسوبة',
    itemColumn: 'العبارة',
    quadrantColumn: 'الربع',
    ratingColumn: 'التقييم',
    localeLabel: 'لغة الإرسال',
  },
};

export const dictionaries = { en, ar } as const;

export function getDictionary(locale: 'en' | 'ar'): Dictionary {
  return dictionaries[locale];
}
