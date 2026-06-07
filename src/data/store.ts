// ============================================================
// CARBIST - Central Data Store
// ============================================================

export type UserRole = 'manager' | 'client' | 'scriptwriter' | 'cameraman' | 'editor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  phone?: string;
  pageIds?: string[]; // for clients
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  forRoles: UserRole[];
  forUserIds?: string[];
}

export interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  views: number;
  forRoles: UserRole[];
}

export type ReelsStatus =
  | 'pending_scenario'
  | 'scenario_ready'
  | 'scenario_approved'
  | 'recording_scheduled'
  | 'recorded'
  | 'file_sent'
  | 'editing'
  | 'edit_done'
  | 'client_approved'
  | 'uploaded'
  | 'cancelled';

export interface Reel {
  id: string;
  pageId: string;
  month: string;
  week: string;
  reelNumber: number;
  title: string;
  reelTitle: string;
  targetPublishDate: string;
  // Scenario
  scenarioStatus: 'not_started' | 'in_progress' | 'ready' | 'approved' | 'revision_needed';
  scenarioReadyDate?: string;
  scenarioText?: string;
  scenarioRevisions?: { date: string; comment: string; from: string }[];
  // Recording
  recordingAnnounced: boolean;
  recordingDateTime?: string;
  recordingCancelled: boolean;
  recordingCancelCount: number;
  recordingCancelLink?: string;
  filmingStatus: 'not_started' | 'in_progress' | 'done' | 'cancelled';
  filmingDate?: string;
  // Files
  rawFileSent: boolean;
  rawFileSentDate?: string;
  rawFileLink?: string;
  fileNumberingCorrect?: boolean;
  // Editing
  priority: 'low' | 'medium' | 'high' | 'urgent';
  editingStatus: 'not_started' | 'in_progress' | 'done';
  editingDeliveryDate?: string;
  editingOutputLink?: string;
  editingDeadline?: string;
  editingCost?: number;
  // Client Review
  clientRevisionCount: number;
  clientApproved: boolean;
  clientApprovedFileLink?: string;
  extraRevisionCost?: number;
  revisionCostDescription?: string;
  // Upload
  uploadStatus: 'not_uploaded' | 'uploaded';
  uploadDate?: string;
  postLink?: string;
  // Responsibility
  responsible: string;
  overallStatus: ReelsStatus;
  bottleneck?: string;
  delayDays: number;
  notes?: string;
  // Analytics
  reelFeedback?: string;
  viewCount?: number;
  followerGain?: number;
  followerGainRate?: number;
  feedbackScore?: number;
  likeCount?: number;
  commentCount?: number;
  // Financial
  invoiceDescription?: string;
  invoiceDate?: string;
  // Scenario writer
  filmingWithoutScenarioWriter?: boolean;
  filmingWithoutApprovalReason?: string;
}

export interface PageContract {
  id: string;
  pageId: string;
  startDate: string;
  endDate: string;
  monthlyReelsCount: number; // default 12
  contractAmount: number;
  extraReelCost: number;
  goals: string[];
  instagramConnected: boolean;
  instagramToken?: string;
}

export interface Page {
  id: string;
  name: string;
  instagramHandle: string;
  clientId: string;
  adminId: string;
  scriptwriterId: string;
  cameramanId: string;
  editorId: string;
  category: string;
  monthlyGoal: string;
  profileImage?: string;
  contract?: PageContract;
  followers?: number;
  totalViews?: number;
  reels?: Reel[];
}

// ============================================================
// MOCK DATA
// ============================================================

export const USERS: User[] = [
  { id: 'u1', name: 'علی رضایی', role: 'manager', avatar: '👨‍💼', email: 'ali@carbist.ir', phone: '09121234567' },
  { id: 'u2', name: 'سارا محمدی', role: 'manager', avatar: '👩‍💼', email: 'sara@carbist.ir' },
  { id: 'u3', name: 'دکتر احمدی', role: 'client', avatar: '🏥', email: 'ahmadi@client.ir', pageIds: ['p1'] },
  { id: 'u4', name: 'رستوران نوین', role: 'client', avatar: '🍽️', email: 'novin@client.ir', pageIds: ['p2'] },
  { id: 'u5', name: 'مهدی کریمی', role: 'scriptwriter', avatar: '✍️', email: 'mahdi@carbist.ir' },
  { id: 'u6', name: 'رضا صادقی', role: 'cameraman', avatar: '🎥', email: 'reza@carbist.ir' },
  { id: 'u7', name: 'نیلوفر حسینی', role: 'editor', avatar: '🎬', email: 'niloofar@carbist.ir' },
  { id: 'u8', name: 'پریسا نظری', role: 'admin', avatar: '📱', email: 'parisa@carbist.ir' },
];

export const STORIES: Story[] = [
  {
    id: 's1',
    title: '📢 جلسه هماهنگی هفتگی',
    content: 'جلسه هفتگی تیم کاربیست فردا ساعت ۱۴:۰۰ برگزار می‌شود. حضور همه اعضا الزامی است.',
    author: 'علی رضایی',
    timestamp: new Date('2025-01-15T10:00:00'),
    views: 8,
    forRoles: ['manager', 'scriptwriter', 'cameraman', 'editor', 'admin'],
  },
  {
    id: 's2',
    title: '🎬 ددلاین ریلزهای این هفته',
    content: 'یادآوری: ددلاین ارسال فایل‌های خام ریلزهای پیج دکتر احمدی تا پنج‌شنبه ساعت ۲۰:۰۰ است.',
    author: 'علی رضایی',
    timestamp: new Date('2025-01-14T09:00:00'),
    views: 6,
    forRoles: ['cameraman', 'editor'],
  },
  {
    id: 's3',
    title: '✅ سناریوهای جدید آماده شد',
    content: 'سناریوهای ۵ ریلز جدید پیج رستوران نوین آماده و ارسال شد. لطفاً بررسی کنید.',
    author: 'مهدی کریمی',
    timestamp: new Date('2025-01-13T15:00:00'),
    views: 4,
    forRoles: ['cameraman', 'manager'],
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: '⚠️ تاخیر در ارسال فایل',
    message: 'فایل خام ریلز شماره ۳ پیج دکتر احمدی ۲ روز است که ارسال نشده',
    type: 'warning',
    timestamp: new Date('2025-01-15T08:00:00'),
    read: false,
    forRoles: ['manager', 'cameraman'],
  },
  {
    id: 'n2',
    title: '✅ تدوین تکمیل شد',
    message: 'ریلز شماره ۱ پیج رستوران نوین توسط تدوینگر تکمیل شد',
    type: 'success',
    timestamp: new Date('2025-01-14T16:00:00'),
    read: false,
    forRoles: ['admin', 'manager'],
  },
  {
    id: 'n3',
    title: '📝 اصلاحیه سناریو',
    message: 'کارفرمای رستوران نوین اصلاحیه برای سناریو ریلز ۴ ارسال کرد',
    type: 'info',
    timestamp: new Date('2025-01-14T12:00:00'),
    read: true,
    forRoles: ['scriptwriter', 'manager'],
  },
  {
    id: 'n4',
    title: '🎬 زمان ضبط تایید شد',
    message: 'زمان ضبط پیج دکتر احمدی: فردا ساعت ۱۰:۰۰',
    type: 'info',
    timestamp: new Date('2025-01-13T11:00:00'),
    read: true,
    forRoles: ['cameraman'],
  },
];

export const PAGES: Page[] = [
  {
    id: 'p1',
    name: 'کلینیک دکتر احمدی',
    instagramHandle: '@dr_ahmadi_clinic',
    clientId: 'u3',
    adminId: 'u8',
    scriptwriterId: 'u5',
    cameramanId: 'u6',
    editorId: 'u7',
    category: 'پزشکی و سلامت',
    monthlyGoal: 'برندسازی و افزایش فالوور',
    followers: 12500,
    totalViews: 450000,
    contract: {
      id: 'c1',
      pageId: 'p1',
      startDate: '1403/10/01',
      endDate: '1403/12/30',
      monthlyReelsCount: 12,
      contractAmount: 15000000,
      extraReelCost: 800000,
      goals: ['برندسازی', 'افزایش فالوور'],
      instagramConnected: false,
    },
    reels: [
      {
        id: 'r1', pageId: 'p1', month: 'دی ۱۴۰۳', week: 'هفته ۱', reelNumber: 1,
        title: 'معرفی کلینیک', reelTitle: '۳ دلیل که باید دندانپزشک بروی',
        targetPublishDate: '1403/10/10',
        scenarioStatus: 'approved', scenarioReadyDate: '1403/10/02',
        scenarioText: 'سلام دوستان! امروز می‌خوام ۳ دلیل مهم که باید به دندانپزشک بروید رو باهاتون در میون بذارم...',
        recordingAnnounced: true, recordingDateTime: '1403/10/05 10:00',
        recordingCancelled: false, recordingCancelCount: 0,
        filmingStatus: 'done', filmingDate: '1403/10/05',
        rawFileSent: true, rawFileSentDate: '1403/10/05', rawFileLink: 'https://t.me/+abc123',
        fileNumberingCorrect: true,
        priority: 'high',
        editingStatus: 'done', editingDeliveryDate: '1403/10/07',
        editingOutputLink: 'https://drive.google.com/file1',
        editingDeadline: '1403/10/08', editingCost: 500000,
        clientRevisionCount: 1, clientApproved: true,
        clientApprovedFileLink: 'https://drive.google.com/final1',
        uploadStatus: 'uploaded', uploadDate: '1403/10/10',
        postLink: 'https://instagram.com/p/abc123',
        responsible: 'پریسا نظری', overallStatus: 'uploaded',
        delayDays: 0, notes: 'عملکرد عالی',
        viewCount: 15000, followerGain: 120, followerGainRate: 0.96,
        feedbackScore: 5, likeCount: 890, commentCount: 45,
        reelFeedback: 'بسیار خوب',
      },
      {
        id: 'r2', pageId: 'p1', month: 'دی ۱۴۰۳', week: 'هفته ۱', reelNumber: 2,
        title: 'آموزش بهداشت دهان', reelTitle: 'مسواک زدن درست یاد بگیر!',
        targetPublishDate: '1403/10/14',
        scenarioStatus: 'approved', scenarioReadyDate: '1403/10/03',
        scenarioText: 'خیلی از ما فکر می‌کنیم مسواک زدن رو بلدیم ولی...',
        recordingAnnounced: true, recordingDateTime: '1403/10/08 14:00',
        recordingCancelled: false, recordingCancelCount: 0,
        filmingStatus: 'done', filmingDate: '1403/10/08',
        rawFileSent: true, rawFileSentDate: '1403/10/08', rawFileLink: 'https://t.me/+def456',
        fileNumberingCorrect: true,
        priority: 'medium',
        editingStatus: 'done', editingDeliveryDate: '1403/10/11',
        editingOutputLink: 'https://drive.google.com/file2',
        editingDeadline: '1403/10/12', editingCost: 500000,
        clientRevisionCount: 0, clientApproved: true,
        clientApprovedFileLink: 'https://drive.google.com/final2',
        uploadStatus: 'uploaded', uploadDate: '1403/10/14',
        postLink: 'https://instagram.com/p/def456',
        responsible: 'پریسا نظری', overallStatus: 'uploaded',
        delayDays: 0,
        viewCount: 22000, followerGain: 180, followerGainRate: 1.44,
        feedbackScore: 5, likeCount: 1200, commentCount: 67,
      },
      {
        id: 'r3', pageId: 'p1', month: 'دی ۱۴۰۳', week: 'هفته ۲', reelNumber: 3,
        title: 'ارتودنسی', reelTitle: 'ارتودنسی اینویزالاین چیست؟',
        targetPublishDate: '1403/10/18',
        scenarioStatus: 'approved', scenarioReadyDate: '1403/10/09',
        scenarioText: 'امروز درباره ارتودنسی اینویزالاین صحبت می‌کنیم...',
        recordingAnnounced: true, recordingDateTime: '1403/10/12 11:00',
        recordingCancelled: false, recordingCancelCount: 0,
        filmingStatus: 'done', filmingDate: '1403/10/12',
        rawFileSent: false,
        fileNumberingCorrect: false,
        priority: 'urgent',
        editingStatus: 'not_started',
        editingDeadline: '1403/10/17', editingCost: 500000,
        clientRevisionCount: 0, clientApproved: false,
        uploadStatus: 'not_uploaded',
        responsible: 'رضا صادقی', overallStatus: 'recorded',
        bottleneck: 'فایل خام ارسال نشده - ۲ روز تاخیر',
        delayDays: 2, notes: 'پیگیری فوری',
      },
      {
        id: 'r4', pageId: 'p1', month: 'دی ۱۴۰۳', week: 'هفته ۲', reelNumber: 4,
        title: 'کامپوزیت دندان', reelTitle: 'کامپوزیت یا لمینت؟',
        targetPublishDate: '1403/10/22',
        scenarioStatus: 'ready', scenarioReadyDate: '1403/10/13',
        scenarioText: 'سوال خیلی از بیماران اینه که کامپوزیت بهتره یا لمینت...',
        recordingAnnounced: false,
        recordingCancelled: false, recordingCancelCount: 0,
        filmingStatus: 'not_started',
        rawFileSent: false,
        priority: 'medium',
        editingStatus: 'not_started',
        editingDeadline: '1403/10/20',
        clientRevisionCount: 0, clientApproved: false,
        uploadStatus: 'not_uploaded',
        responsible: 'مهدی کریمی', overallStatus: 'scenario_ready',
        delayDays: 0,
      },
    ],
  },
  {
    id: 'p2',
    name: 'رستوران نوین',
    instagramHandle: '@restaurant_novin',
    clientId: 'u4',
    adminId: 'u8',
    scriptwriterId: 'u5',
    cameramanId: 'u6',
    editorId: 'u7',
    category: 'غذا و رستوران',
    monthlyGoal: 'افزایش فروش و جذب مشتری',
    followers: 8200,
    totalViews: 280000,
    contract: {
      id: 'c2',
      pageId: 'p2',
      startDate: '1403/10/01',
      endDate: '1403/12/30',
      monthlyReelsCount: 12,
      contractAmount: 12000000,
      extraReelCost: 600000,
      goals: ['افزایش فروش', 'جذب مشتری'],
      instagramConnected: false,
    },
    reels: [
      {
        id: 'r5', pageId: 'p2', month: 'دی ۱۴۰۳', week: 'هفته ۱', reelNumber: 1,
        title: 'پیشنهاد روز', reelTitle: 'کباب کوبیده ویژه رستوران نوین',
        targetPublishDate: '1403/10/08',
        scenarioStatus: 'approved', scenarioReadyDate: '1403/10/01',
        scenarioText: 'امروز بهترین کباب کوبیده شهر رو بهتون نشون می‌دم...',
        recordingAnnounced: true, recordingDateTime: '1403/10/04 12:00',
        recordingCancelled: false, recordingCancelCount: 0,
        filmingStatus: 'done', filmingDate: '1403/10/04',
        rawFileSent: true, rawFileSentDate: '1403/10/04', rawFileLink: 'https://t.me/+ghi789',
        fileNumberingCorrect: true,
        priority: 'high',
        editingStatus: 'done', editingDeliveryDate: '1403/10/06',
        editingOutputLink: 'https://drive.google.com/file5',
        editingDeadline: '1403/10/07', editingCost: 450000,
        clientRevisionCount: 2, clientApproved: true,
        extraRevisionCost: 200000,
        clientApprovedFileLink: 'https://drive.google.com/final5',
        uploadStatus: 'uploaded', uploadDate: '1403/10/08',
        postLink: 'https://instagram.com/p/ghi789',
        responsible: 'پریسا نظری', overallStatus: 'uploaded',
        delayDays: 0,
        viewCount: 35000, followerGain: 250, followerGainRate: 3.05,
        feedbackScore: 5, likeCount: 2100, commentCount: 130,
      },
      {
        id: 'r6', pageId: 'p2', month: 'دی ۱۴۰۳', week: 'هفته ۲', reelNumber: 2,
        title: 'آشپزخانه نوین', reelTitle: 'پشت صحنه آشپزخانه ما',
        targetPublishDate: '1403/10/15',
        scenarioStatus: 'revision_needed',
        scenarioText: 'بیاید پشت صحنه آشپزخانه ما رو ببینید...',
        scenarioRevisions: [{ date: '1403/10/10', comment: 'لطفاً بخش معرفی منو رو اضافه کنید', from: 'رستوران نوین' }],
        recordingAnnounced: false,
        recordingCancelled: false, recordingCancelCount: 0,
        filmingStatus: 'not_started',
        rawFileSent: false,
        priority: 'medium',
        editingStatus: 'not_started',
        editingDeadline: '1403/10/14',
        clientRevisionCount: 0, clientApproved: false,
        uploadStatus: 'not_uploaded',
        responsible: 'مهدی کریمی', overallStatus: 'pending_scenario',
        bottleneck: 'سناریو نیاز به اصلاح دارد',
        delayDays: 1,
      },
    ],
  },
];
