// Seed content for SheBiz. Plain ES module (no JSX) so the Firebase seed script can import it too.

const iso = (d) => d.toISOString().slice(0, 10);
export const addDays = (days, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
};

const OPPS = [
  ['Junior Web Developer Internship', 'ABC Technologies', 'Gqeberha', 'Internship', 'Technology', ['HTML', 'CSS', 'JavaScript'], 3,
    'Join the ABC Technologies web team for a 6-month internship building and maintaining client websites. You will work alongside senior developers and ship real features.',
    ['Diploma or degree in IT (or final-year student)', 'Basic HTML, CSS and JavaScript', 'A portfolio or GitHub link']],
  ['Digital Marketing Learnership', 'BrightPath SA', 'Johannesburg', 'Learnership', 'Marketing', ['Communication', 'Teamwork', 'Growth'], 12,
    'A 12-month accredited learnership covering social media, content, email marketing and analytics, with a monthly stipend.',
    ['Matric certificate', 'Strong written communication', 'Comfortable with social media platforms']],
  ['Women in Business Scholarship', 'Future Founders', 'South Africa', 'Scholarship', 'Business', ['Communication', 'Teamwork', 'Growth'], 20,
    'Funding for women entrepreneurs to complete a business management programme, including mentorship and a seed-funding pitch day.',
    ['South African woman aged 18+', 'A business or business idea', 'Short motivation letter']],
  ['Graduate Finance Programme', 'Ubuntu Finance', 'Cape Town', 'Programme', 'Finance', ['Communication', 'Teamwork', 'Growth'], 8,
    'An 18-month rotational programme across lending, risk and financial planning, ending in a permanent placement for top performers.',
    ['Degree in finance, accounting or economics', 'Strong numeracy', 'Willingness to relocate to Cape Town']],
  ['Software Developer Trainee', 'Karoo Digital', 'Gqeberha', 'Job', 'Technology', ['Java', 'SQL', 'Git'], 15,
    'Entry-level developer role on a team building logistics software. Full training and a named mentor are provided.',
    ['IT diploma or degree', 'Java and SQL basics', 'Git experience']],
  ['Junior Data Analyst', 'Insight Africa', 'Cape Town', 'Job', 'Technology', ['Excel', 'SQL', 'Communication'], 9,
    'Turn raw data into clear dashboards and recommendations for retail clients across Africa.',
    ['Numerate and detail-oriented', 'Excel and basic SQL', 'Able to explain findings simply']],
  ['UX/UI Design Internship', 'PixelHub Studio', 'Johannesburg', 'Internship', 'Design', ['Figma', 'Creativity', 'Communication'], 18,
    'Design screens and prototypes for mobile and web products, and take part in real user-testing sessions.',
    ['Portfolio of 2+ design projects', 'Figma basics', 'Eye for detail']],
  ['Small Business Funding Programme', 'Siyakha Fund', 'Eastern Cape', 'Programme', 'Business', ['Planning', 'Finance', 'Marketing'], 25,
    'Grants of up to R50,000 plus 6 months of business coaching for women-owned businesses in the Eastern Cape.',
    ['Registered or trading business', 'Basic business plan', 'Based in the Eastern Cape']],
  ['Bookkeeping Learnership', 'Ledger Skills Academy', 'Gqeberha', 'Learnership', 'Finance', ['Accounting', 'Excel', 'Attention to detail'], 11,
    'Earn a bookkeeping qualification while working at a partner accounting firm.',
    ['Matric with maths or maths literacy', 'Accurate and organised', 'Basic computer skills']],
  ['Social Media Manager', 'Bloom Brands', 'Remote (South Africa)', 'Job', 'Marketing', ['Content', 'Marketing', 'Communication'], 6,
    'Plan, create and schedule content for a portfolio of lifestyle brands and report on growth every month.',
    ['1+ year managing social accounts', 'Strong copywriting', 'Reliable internet connection']],
  ['Cloud Computing Bursary', 'Cloudline SA', 'South Africa', 'Scholarship', 'Technology', ['Cloud Computing', 'Python', 'Teamwork'], 30,
    'A full-year bursary covering tuition for a cloud certification pathway, with an internship placement afterwards.',
    ['Studying IT or computer science', 'Academic average of 60%+', 'Proof of registration']],
  ['Entrepreneurship Bootcamp', 'Thrive Hub', 'Durban', 'Programme', 'Business', ['Planning', 'Leadership', 'Growth'], 14,
    'An intensive 8-week bootcamp on validating ideas, pricing, sales and pitching, finishing with a live investor panel.',
    ['A business idea or early-stage business', 'Commitment to attend all sessions']],
  ['Junior Accountant', 'Mthatha & Co', 'East London', 'Job', 'Finance', ['Accounting', 'Excel', 'Communication'], 5,
    'Support the audit and tax team with reconciliations, VAT returns and client communication.',
    ['BCom Accounting or equivalent', 'Excel proficiency', 'Driver\'s licence preferred']],
  ['Food Business Accelerator', 'Bake & Grow Africa', 'Cape Town', 'Programme', 'Business', ['Baking', 'Marketing', 'Finance'], 22,
    'A 3-month accelerator for home bakers and food entrepreneurs covering costing, food safety, branding and wholesale deals.',
    ['Currently selling food products', 'Willingness to share financials with coaches']],
  ['Customer Success Associate', 'Helix Software', 'Remote (South Africa)', 'Job', 'Business', ['Communication', 'Teamwork', 'Problem solving'], 10,
    'Help small-business customers get the most from Helix software through onboarding calls, tutorials and support.',
    ['Excellent English communication', 'Patient and empathetic', 'Laptop and stable internet']],
  ['Women in Leadership Fellowship', 'Lead Her SA', 'Pretoria', 'Scholarship', 'Leadership', ['Leadership', 'Communication', 'Planning'], 28,
    'A 6-month fellowship with leadership workshops, a senior mentor and a community-impact project.',
    ['Woman aged 21-35', 'Leadership experience (work, campus or community)', 'Two references']],
  ['Mobile App Developer Internship', 'AppForge', 'Gqeberha', 'Internship', 'Technology', ['Kotlin', 'Java', 'Git'], 16,
    'Build Android features for consumer apps and learn modern mobile architecture with weekly code reviews.',
    ['Kotlin or Java basics', 'A small Android project to show', 'Git basics']],
  ['Content Creator Learnership', 'Spark Media', 'Johannesburg', 'Learnership', 'Marketing', ['Content', 'Creativity', 'Marketing'], 19,
    'Learn to script, film and edit short-form video and written content for brand campaigns.',
    ['Creative portfolio or active social channel', 'Basic editing skills', 'Matric certificate']],
];

export function buildOpportunities(now = new Date()) {
  return OPPS.map((o, i) => ({
    id: `opp-${String(i + 1).padStart(2, '0')}`,
    title: o[0], company: o[1], location: o[2], type: o[3], category: o[4],
    skills: o[5], closingDate: iso(addDays(o[6], now)), description: o[7], requirements: o[8],
    createdAt: iso(now),
  }));
}

const SLOTS = [
  ['Mon 17:30', 'Wed 18:00', 'Fri 10:00'],
  ['Tue 17:00', 'Thu 18:30', 'Sat 09:00'],
  ['Mon 12:30', 'Thu 17:30', 'Fri 15:00'],
];
const MENTORS = [
  ['Sarah M.', 'Software Developer', 'Technology', ['C#', 'ASP.NET', 'Cloud Computing'], 5, 'Full-stack developer who loves helping new graduates land their first tech role and build confidence with code reviews and interview practice.', ['English', 'isiXhosa']],
  ['Zanele D.', 'Data Engineer', 'Technology', ['Python', 'SQL', 'Data Pipelines'], 7, 'Builds data platforms for banks and mentors women moving into data careers.', ['English', 'isiZulu']],
  ['Lindiwe T.', 'Mobile Developer', 'Technology', ['Kotlin', 'Flutter', 'APIs'], 6, 'Ships Android and Flutter apps and runs weekend coding clinics for beginners.', ['English', 'Sesotho']],
  ['Naledi K.', 'Business Strategist', 'Business', ['Planning', 'Growth', 'Finance'], 8, 'Helps small businesses plan, price and grow. Specialises in turning side hustles into sustainable companies.', ['English', 'Setswana']],
  ['Thandeka R.', 'Operations Consultant', 'Business', ['Operations', 'Pricing', 'Suppliers'], 9, 'Streamlines operations for food, retail and service businesses.', ['English', 'isiXhosa']],
  ['Palesa N.', 'Startup Founder', 'Business', ['Pitching', 'Funding', 'Sales'], 6, 'Founded two startups and mentors women through their first funding pitch.', ['English', 'Sesotho']],
  ['Nomvula S.', 'Chartered Accountant', 'Finance', ['Accounting', 'Tax', 'Budgeting'], 10, 'CA(SA) who demystifies tax and bookkeeping for founders and students.', ['English', 'isiZulu']],
  ['Busisiwe M.', 'Financial Planner', 'Finance', ['Budgeting', 'Saving', 'Investing'], 8, 'Helps young professionals build budgets, emergency funds and long-term plans.', ['English', 'isiXhosa']],
  ['Karabo L.', 'Credit Analyst', 'Finance', ['Credit', 'Excel', 'Risk'], 5, 'Guides graduates into banking and explains how funding decisions are made.', ['English', 'Setswana']],
  ['Ayesha P.', 'Marketing Lead', 'Marketing', ['Brand', 'Digital', 'Content'], 7, 'Leads brand and digital teams and coaches small businesses on getting noticed online.', ['English', 'Afrikaans']],
  ['Refilwe G.', 'Social Media Strategist', 'Marketing', ['Social Media', 'Copywriting', 'Analytics'], 6, 'Grows brands on Instagram and TikTok and teaches simple content systems.', ['English', 'Sesotho']],
  ['Lerato B.', 'Brand Designer', 'Marketing', ['Branding', 'Packaging', 'Design'], 8, 'Designs packaging and identities for food and lifestyle brands.', ['English', 'isiZulu']],
  ['Nokuthula Z.', 'Operations Director', 'Leadership', ['Leadership', 'Teams', 'Strategy'], 14, 'Leads teams of 200+ and mentors emerging women leaders.', ['English', 'isiZulu']],
  ['Fatima A.', 'NGO Programme Head', 'Leadership', ['Community', 'Management', 'Fundraising'], 11, 'Runs education programmes and coaches women on leading with impact.', ['English', 'Afrikaans']],
  ['Ntombi C.', 'HR Executive', 'Leadership', ['People', 'Conflict', 'Coaching'], 12, 'Coaches first-time managers on feedback, hiring and difficult conversations.', ['English', 'isiXhosa']],
  ['Zodwa H.', 'Career Coach', 'Career Development', ['CVs', 'Interviews', 'Networking'], 9, 'Has coached 300+ graduates through CVs, LinkedIn and interviews.', ['English', 'isiZulu']],
  ['Mpho J.', 'Recruitment Lead', 'Career Development', ['Hiring', 'Salary Talks', 'Portfolios'], 10, 'Sees hundreds of applications a month and shows you what stands out.', ['English', 'Sesotho']],
  ['Anele V.', 'Graduate Programme Manager', 'Career Development', ['Graduate Programmes', 'Soft Skills', 'Goals'], 7, 'Runs a graduate programme and helps early-career women set clear goals.', ['English', 'isiXhosa']],
];

export function buildMentors() {
  return MENTORS.map((m, i) => ({
    id: `mentor-${String(i + 1).padStart(2, '0')}`,
    name: m[0], title: m[1], category: m[2], skills: m[3], yearsExperience: m[4], bio: m[5], languages: m[6],
    rating: [4.9, 4.8, 4.7, 5.0, 4.8][i % 5], menteeCount: 8 + ((i * 7) % 23),
    availability: SLOTS[i % 3], available: true,
  }));
}

const LESSONS = {
  'web-development-basics': [
    ['How the web works', 'Browsers request pages from servers using HTTP. A page is built from HTML for structure, CSS for style and JavaScript for behaviour. Understanding this request and response loop is the base for everything else.'],
    ['HTML structure', 'HTML uses elements such as headings, paragraphs, links and images. Use semantic tags like header, nav, main and footer so pages are accessible and easy to maintain.'],
    ['Styling with CSS', 'CSS selects elements and applies rules. Learn the box model (content, padding, border, margin), colours, fonts and how classes keep styles reusable.'],
    ['Layout with Flexbox', 'Flexbox arranges items in a row or column and handles spacing and alignment. Set display:flex on the parent, then control direction, wrapping and gaps.'],
    ['JavaScript basics', 'JavaScript stores values in variables, makes decisions with if statements and reacts to clicks with event listeners. Start by changing text on a page when a button is pressed.'],
  ],
  'digital-marketing': [
    ['Know your customer', 'Write down who you serve: age, needs, where they spend time online and what problem you solve. Every post and ad should speak to that person.'],
    ['Choosing your channels', 'Pick one or two channels where your customers already are, such as WhatsApp, Instagram or Facebook groups, rather than being everywhere at once.'],
    ['Content that sells', 'Mix useful posts, behind-the-scenes, social proof and clear offers. Show real photos, prices and how to order.'],
    ['Measuring results', 'Track reach, replies and orders. Ask every new customer how they found you and note which posts lead to sales.'],
    ['Building a posting routine', 'Batch-create a week of content in one sitting and schedule it. Consistency beats perfection.'],
  ],
  'bookkeeping-accounting': [
    ['Why bookkeeping matters', 'Good records show whether you make a profit, support loan or funding applications and make tax time easy.'],
    ['Income and expenses', 'Record every sale and every cost, big or small. Keep slips and invoices and separate business money from personal money.'],
    ['Profit and margin', 'Profit equals sales minus expenses. Margin is profit divided by sales, shown as a percentage, and tells you how much of each rand you keep.'],
    ['Pricing your products', 'Add up ingredient and packaging costs, your time and overheads, then add a margin. Revisit prices whenever costs change.'],
    ['Simple monthly reports', 'Once a month, total your sales and expenses, compare to last month and note your best sellers and biggest costs.'],
  ],
  'business-plan-writing': [
    ['Your business idea', 'Describe what you sell, who it is for and why they will choose you. Keep it to one clear paragraph.'],
    ['Market and competition', 'List similar businesses, their prices and what they do well. Find the gap you can fill.'],
    ['Operations plan', 'Explain how you make and deliver your product: suppliers, equipment, workspace and who does what.'],
    ['Financial plan', 'Estimate start-up costs, monthly costs and expected sales. Show when you expect to break even.'],
    ['Pitching your plan', 'Turn the plan into a 3-minute pitch: problem, solution, customers, numbers and what you need. Practise out loud.'],
  ],
};

export function buildCourses() {
  const meta = [
    ['web-development-basics', 'Web Development Basics', 'Learn how websites are built using HTML, CSS and JavaScript.', 'Technology'],
    ['digital-marketing', 'Digital Marketing', 'Find customers and grow your brand online.', 'Marketing'],
    ['bookkeeping-accounting', 'Bookkeeping & Accounting', 'Track money, understand profit and price with confidence.', 'Finance'],
    ['business-plan-writing', 'Business Plan Writing', 'Write a clear plan you can use to pitch and fund your business.', 'Business'],
  ];
  return meta.map(([id, title, description, category]) => ({
    id, title, description, category,
    lessons: LESSONS[id].map(([t, c], i) => ({ id: `${id}-${i + 1}`, title: t, content: c })),
  }));
}

// Demo account used only in demo mode (no Firebase configured)
export const DEMO_USER = {
  email: 'thandi@email.com',
  password: 'Thandi@2026',
  profile: {
    fullName: 'Thandi Mokoena', phone: '+27 71 234 5678', location: 'Gqeberha',
    interests: ['Finding a job', 'Finding a mentor', 'Learning new skills', 'Starting a business', 'Growing my business', 'Networking'],
    careerInterests: ['Software Development', 'Business', 'Finance'],
    photoURL: '',
    skills: [
      { id: 's1', name: 'HTML', level: 82 }, { id: 's2', name: 'Java', level: 65 }, { id: 's3', name: 'Marketing', level: 76 },
      { id: 's4', name: 'Accounting', level: 58 }, { id: 's5', name: 'Baking', level: 90 },
    ],
    education: [{ id: 'e1', institution: 'Nelson Mandela University', qualification: 'Diploma in Information Technology', year: '2025' }],
    achievements: [
      { id: 'a1', title: 'Web Development Certificate', description: 'Completed course' },
      { id: 'a2', title: 'Women in Business Award', description: '2026 finalist' },
    ],
  },
};

export const INTEREST_OPTIONS = ['Finding a job', 'Finding a mentor', 'Learning new skills', 'Starting a business', 'Growing my business', 'Networking'];
export const CATEGORIES = ['Technology', 'Design', 'Business', 'Finance', 'Marketing', 'Leadership'];
export const MENTOR_CATEGORIES = ['Technology', 'Business', 'Finance', 'Marketing', 'Leadership', 'Career Development'];
export const OPP_TYPES = ['Job', 'Internship', 'Learnership', 'Scholarship', 'Programme'];
export const EXPENSE_CATEGORIES = ['Ingredients', 'Packaging', 'Transport', 'Utilities', 'Marketing', 'Other'];
