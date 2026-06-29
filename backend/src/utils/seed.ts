import crypto from 'node:crypto';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from './logger.js';
import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { Scholarship } from '../models/Scholarship.js';
import { CommunityPost } from '../models/CommunityPost.js';

const colleges = [
  {
    name: 'Indian Institute of Technology Bombay',
    slug: 'iit-bombay',
    shortName: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'government' as const,
    nirfRanking: 3,
    accreditation: ['NAAC A++', 'NBA'],
    annualFeesInr: 230000,
    hostelFeesInr: 40000,
    about:
      'A premier engineering and research institution, consistently ranked among the top in India.',
    bannerUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg',
    courses: ['B.Tech', 'M.Tech', 'PhD', 'MBA'],
    facilities: ['Library', 'Sports Complex', 'Hostels', 'Innovation Labs'],
    faculty: ['Distinguished professors', 'Industry researchers'],
    placement: {
      averagePackageLpa: 21.8,
      highestPackageLpa: 210,
      placementRate: 95,
      topRecruiters: ['Google', 'Microsoft', 'Goldman Sachs', 'McKinsey'],
    },
    isFeatured: true,
    ratingAverage: 4.8,
    ratingCount: 1200,
  },
  {
    name: 'Vellore Institute of Technology',
    slug: 'vit-vellore',
    shortName: 'VIT',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: 'private' as const,
    nirfRanking: 11,
    accreditation: ['NAAC A++', 'ABET'],
    annualFeesInr: 198000,
    hostelFeesInr: 75000,
    about: 'A leading private university known for strong placements and a vibrant campus life.',
    bannerUrl:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80',
    courses: ['B.Tech', 'M.Tech', 'BBA', 'MCA'],
    facilities: ['Smart Classrooms', 'Hostels', 'Research Parks', 'Stadium'],
    faculty: ['International faculty', 'Industry mentors'],
    placement: {
      averagePackageLpa: 9.1,
      highestPackageLpa: 102,
      placementRate: 90,
      topRecruiters: ['Amazon', 'TCS', 'Cognizant', 'Deloitte'],
    },
    isFeatured: true,
    ratingAverage: 4.4,
    ratingCount: 980,
  },
  {
    name: 'Bennett University',
    slug: 'bennett-university',
    shortName: 'Bennett',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    type: 'private' as const,
    nirfRanking: 90,
    accreditation: ['NAAC A'],
    annualFeesInr: 312000,
    hostelFeesInr: 145000,
    about: 'A modern university founded by The Times Group with a focus on industry collaboration.',
    bannerUrl:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    courses: ['B.Tech', 'BBA', 'B.A. Journalism', 'LLB'],
    facilities: ['Media Labs', 'Hostels', 'Sports Arena', 'Incubator'],
    faculty: ['Ivy-league trained faculty'],
    placement: {
      averagePackageLpa: 8.2,
      highestPackageLpa: 35,
      placementRate: 85,
      topRecruiters: ['Microsoft', 'Times Internet', 'EY', 'Wipro'],
    },
    isFeatured: false,
    ratingAverage: 4.1,
    ratingCount: 320,
  },
];

const scholarships = [
  {
    title: 'National Means-cum-Merit Scholarship',
    slug: 'nmms',
    provider: 'Ministry of Education',
    type: 'government' as const,
    amountInr: 12000,
    category: ['general', 'obc', 'sc', 'st'] as const,
    maxIncomeInr: 350000,
    meritBased: true,
    description: 'Merit-cum-means scholarship for students from economically weaker sections.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
  },
  {
    title: 'Post Matric Scholarship (Maharashtra)',
    slug: 'post-matric-maharashtra',
    provider: 'Government of Maharashtra',
    type: 'state' as const,
    amountInr: 50000,
    category: ['sc', 'st', 'obc'] as const,
    state: 'Maharashtra',
    maxIncomeInr: 800000,
    meritBased: false,
    description: 'State scholarship covering tuition and maintenance for eligible students.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  },
  {
    title: 'Reliance Foundation Undergraduate Scholarship',
    slug: 'reliance-foundation-ug',
    provider: 'Reliance Foundation',
    type: 'private' as const,
    amountInr: 200000,
    category: ['general', 'obc', 'sc', 'st', 'ews'] as const,
    maxIncomeInr: 1500000,
    meritBased: true,
    description: 'Merit-based scholarship for first-year undergraduate students across India.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
  },
];

async function seed(): Promise<void> {
  await connectDB();
  logger.info('Clearing existing seed data...');
  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@campusconnect.in', 'aarav@iitb.ac.in'] } }),
    College.deleteMany({ slug: { $in: colleges.map((c) => c.slug) } }),
    Scholarship.deleteMany({ slug: { $in: scholarships.map((s) => s.slug) } }),
  ]);

  const createdColleges = await College.insertMany(colleges);
  const createdScholarships = await Scholarship.insertMany(scholarships);
  await College.findByIdAndUpdate(createdColleges[0]._id, {
    scholarships: createdScholarships.map((s) => s._id),
  });

  await User.create({
    name: 'Platform Admin',
    email: 'admin@campusconnect.in',
    password: 'Admin@12345',
    role: 'admin',
    isEmailVerified: true,
    verificationStatus: 'verified',
  });

  const ambassador = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav@iitb.ac.in',
    password: 'Ambassador@123',
    role: 'ambassador',
    isEmailVerified: true,
    verificationStatus: 'verified',
    college: createdColleges[0]._id,
    avatarUrl: 'https://i.pravatar.cc/200?img=12',
    ambassador: {
      branch: 'Computer Science',
      year: 3,
      cgpa: 9.1,
      languages: ['English', 'Hindi', 'Marathi'],
      linkedin: 'https://linkedin.com/in/aarav',
      about: 'CSE junior at IIT Bombay. Happy to help with admissions, placements and campus life!',
      experience: 'Summer intern at Google. Core member of the coding club.',
      questionsAnswered: 142,
      followers: 980,
      rating: 4.9,
      ratingCount: 87,
      referralCode: crypto.randomBytes(4).toString('hex'),
    },
  });

  await CommunityPost.create({
    author: ambassador._id,
    title: 'How I cracked JEE Advanced while balancing boards',
    body: 'Sharing my weekly study plan, mock test strategy, and the resources that actually helped.',
    category: 'admission',
    tags: ['jee', 'strategy', 'iit'],
    college: createdColleges[0]._id,
  });

  logger.info('Seed complete.');
  logger.info('Admin login: admin@campusconnect.in / Admin@12345');
  logger.info('Ambassador login: aarav@iitb.ac.in / Ambassador@123');
  await disconnectDB();
}

seed().catch((error) => {
  logger.error('Seeding failed', error);
  process.exit(1);
});
