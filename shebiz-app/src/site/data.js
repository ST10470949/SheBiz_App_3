// =====================================================================
// SAMPLE / DEMONSTRATION CONTENT for the SheBiz website design.
// Everything here is local, illustrative and clearly labelled "Sample" in the UI.
// None of it is a real organisation, person, listing, price commitment or verified fact.
// Replace with real data (e.g. Firestore) in a later phase; real Firestore listings are merged on top where they exist.
// =====================================================================

export const OPP_CATEGORIES = ['Jobs', 'Internships', 'Learnerships', 'Scholarships', 'Funding & Grants', 'Business Competitions', 'Training Programmes', 'Workshops', 'Entrepreneurship Programmes'];
export const LOCATIONS = ['Eastern Cape', 'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Remote'];
export const CLOSING_FILTERS = [['any', 'Any closing date'], ['7', 'Within 7 days'], ['30', 'Within 30 days'], ['90', 'Within 90 days']];

const o = (id, title, org, category, location, closesInDays, summary, eligibility) => ({ id, title, org, category, location, closesInDays, summary, eligibility, sample: true });
export const SAMPLE_OPPS = [
  o('s-opp-1', 'Junior Web Developer', 'Example Technology Company', 'Jobs', 'Remote', 21, 'Build and maintain simple websites with a friendly engineering team.', 'IT diploma or equivalent. Basic HTML, CSS and JavaScript.'),
  o('s-opp-2', 'Marketing Intern', 'Example Retail Group', 'Internships', 'Gauteng', 12, 'Support social media, content and campaign reporting for a growing brand.', 'Final-year or recent graduate in marketing or communication.'),
  o('s-opp-3', 'Business Administration Learnership', 'Example Training Provider', 'Learnerships', 'Eastern Cape', 45, 'A structured learnership with workplace experience and mentoring.', 'Grade 12. Unemployed youth aged 18 to 35.'),
  o('s-opp-4', 'STEM Bursary for Women', 'Example Education Foundation', 'Scholarships', 'Western Cape', 60, 'Contribution towards tuition for women studying science and technology.', 'Registered or accepted at a public university. Financial need.'),
  o('s-opp-5', 'Small Business Starter Grant', 'Example Enterprise Fund', 'Funding & Grants', 'Remote', 30, 'Seed support for women-owned micro-enterprises with a clear plan.', 'Women-owned business, operating for 6 months or more.'),
  o('s-opp-6', 'Women in Business Pitch Competition', 'Example Business Network', 'Business Competitions', 'KwaZulu-Natal', 75, 'Pitch your idea to a panel and win business support.', 'Founders with a working idea or early-stage business.'),
  o('s-opp-7', 'Digital Skills Bootcamp', 'Example Skills Academy', 'Training Programmes', 'Remote', 18, 'Eight weeks of practical digital skills, online and part-time.', 'Open to all. Laptop and internet access required.'),
  o('s-opp-8', 'Pricing Your Products Workshop', 'Example Community Hub', 'Workshops', 'Eastern Cape', 6, 'A half-day workshop on costing, margins and fair pricing.', 'Small business owners and side-hustlers.'),
  o('s-opp-9', 'Women Entrepreneurs Accelerator', 'Example Incubation Hub', 'Entrepreneurship Programmes', 'Gauteng', 90, 'Six months of coaching, peer support and market access.', 'Registered or about-to-register business.'),
  o('s-opp-10', 'Data Capturer', 'Example Services Company', 'Jobs', 'Western Cape', 9, 'Accurate data capture and basic reporting in a supportive team.', 'Matric. Good computer literacy.'),
  o('s-opp-11', 'Graduate Programme: Finance', 'Example Banking Group', 'Internships', 'Gauteng', 40, 'A 12-month rotation across finance teams with a mentor.', 'Degree in commerce or accounting, completed within 2 years.'),
  o('s-opp-12', 'Agri-Entrepreneur Training', 'Example Development Agency', 'Training Programmes', 'Eastern Cape', 28, 'Training for women farming or processing food for local markets.', 'Existing or planned agri-business.'),
];

export const MENTOR_FORMATS = ['1:1 video session', 'Chat mentorship', 'Group session', 'Career clinic'];
const m = (id, name, role, expertise, industry, bio, format, availability, price, tint, skin) => ({ id, name, role, expertise, industry, bio, format, availability, price, tint, skin, sample: true });
export const SAMPLE_MENTORS = [
  m('s-men-1', 'Nomsa D.', 'Software Engineering Lead', ['Careers in tech', 'Code reviews', 'CV reviews'], 'Technology', 'Sample profile. Helps early-career women move from study to their first tech role.', '1:1 video session', 'Weekday evenings', 0, 'lav', '#6b3f2a'),
  m('s-men-2', 'Aisha P.', 'Small Business Coach', ['Business planning', 'Pricing', 'Customer acquisition'], 'Business', 'Sample profile. Supports first-time founders to test ideas and get their first customers.', '1:1 video session', 'Saturdays', 350, 'blush', '#9a6b4a'),
  m('s-men-3', 'Lindiwe K.', 'Finance Manager', ['Bookkeeping', 'Cash flow', 'Funding readiness'], 'Finance', 'Sample profile. Makes money matters clear for owners of small businesses.', 'Chat mentorship', 'Flexible', 0, 'cream', '#5a3322'),
  m('s-men-4', 'Zanele M.', 'Marketing Director', ['Brand', 'Social media', 'Content planning'], 'Marketing', 'Sample profile. Teaches practical marketing that works on a small budget.', 'Group session', 'Monthly', 250, 'lav', '#7a4a33'),
  m('s-men-5', 'Thandeka R.', 'HR and Leadership Consultant', ['Leadership', 'Interview preparation', 'Confidence'], 'Leadership', 'Sample profile. Coaches women stepping into their first leadership role.', 'Career clinic', 'Weekday lunchtimes', 300, 'blush', '#6b3f2a'),
  m('s-men-6', 'Busisiwe T.', 'Product Designer', ['UX design', 'Portfolios', 'Freelancing'], 'Technology', 'Sample profile. Helps designers build a portfolio and find their first clients.', '1:1 video session', 'Sundays', 0, 'cream', '#8a5a3c'),
];

export const SAMPLE_BUSINESSES = [
  { id: 's-biz-1', name: 'Sample Sweet Crumbs', industry: 'Food & Baking', location: 'Gqeberha', description: 'Sample listing. Celebration cakes, cupcakes and treat boxes baked to order.', products: ['Celebration cakes', 'Cupcake boxes', 'Party boxes'], tint: 'blush' },
  { id: 's-biz-2', name: 'Sample Thread & Co', industry: 'Fashion', location: 'Johannesburg', description: 'Sample listing. Made-to-measure workwear and African-print accessories.', products: ['Workwear', 'Headwraps', 'Bags'], tint: 'lav' },
  { id: 's-biz-3', name: 'Sample Bright Minds Tutoring', industry: 'Education', location: 'Durban', description: 'Sample listing. After-school maths and science tutoring, in person and online.', products: ['Maths tutoring', 'Science tutoring', 'Exam prep'], tint: 'cream' },
  { id: 's-biz-4', name: 'Sample Glow Naturals', industry: 'Beauty', location: 'Cape Town', description: 'Sample listing. Handmade skincare made with locally sourced ingredients.', products: ['Body butters', 'Soaps', 'Gift sets'], tint: 'blush' },
  { id: 's-biz-5', name: 'Sample Green Harvest', industry: 'Agriculture', location: 'Eastern Cape', description: 'Sample listing. Fresh vegetables and herbs supplied to local shops and restaurants.', products: ['Vegetable boxes', 'Herbs', 'Seedlings'], tint: 'lav' },
  { id: 's-biz-6', name: 'Sample Clever Books', industry: 'Bookkeeping', location: 'Pretoria', description: 'Sample listing. Simple bookkeeping and monthly reporting for micro-enterprises.', products: ['Bookkeeping', 'Monthly reports', 'Invoicing set-up'], tint: 'cream' },
  { id: 's-biz-7', name: 'Sample Craft Collective', industry: 'Crafts', location: 'Polokwane', description: 'Sample listing. Beadwork, ceramics and woven homeware by a group of makers.', products: ['Beadwork', 'Ceramics', 'Baskets'], tint: 'blush' },
  { id: 's-biz-8', name: 'Sample Swift Deliveries', industry: 'Logistics', location: 'Bloemfontein', description: 'Sample listing. Local same-day delivery for small online sellers.', products: ['Same-day delivery', 'Courier pick-up', 'Packing'], tint: 'lav' },
];
export const BIZ_INDUSTRIES = ['Food & Baking', 'Fashion', 'Education', 'Beauty', 'Agriculture', 'Bookkeeping', 'Crafts', 'Logistics'];

export const LEARN_CATEGORIES = ['Digital skills', 'Artificial intelligence', 'Coding and technology', 'Financial literacy', 'Marketing', 'Business planning', 'Entrepreneurship', 'Leadership', 'Career development'];
const l = (id, title, category, level, duration, description, lessons) => ({ id, title, category, level, duration, description, lessons, sample: true });
export const SAMPLE_LEARNING = [
  l('s-learn-1', 'Getting Comfortable With Online Tools', 'Digital skills', 'Beginner', '2 hours', 'Email, cloud storage, video calls and online forms for work and business.', ['Set up a professional email', 'Share files safely', 'Run a video meeting', 'Use online forms']),
  l('s-learn-2', 'AI for Everyday Work', 'Artificial intelligence', 'Beginner', '1.5 hours', 'What AI assistants can and cannot do, and how to use them responsibly.', ['What is AI?', 'Writing good prompts', 'Checking AI answers', 'Using AI in a small business']),
  l('s-learn-3', 'Your First Website', 'Coding and technology', 'Beginner', '4 hours', 'Build a simple one-page website with HTML and CSS.', ['How the web works', 'HTML basics', 'Styling with CSS', 'Publishing your page']),
  l('s-learn-4', 'Money Basics for Small Businesses', 'Financial literacy', 'Beginner', '2 hours', 'Separate personal and business money, track income and plan for tax.', ['Business vs personal money', 'Recording income and expenses', 'Cash flow in one page', 'Planning for tax']),
  l('s-learn-5', 'Marketing on a Small Budget', 'Marketing', 'Intermediate', '3 hours', 'Find your customer and reach them with simple, low-cost marketing.', ['Know your customer', 'Your offer and message', 'Social media basics', 'Measuring what works']),
  l('s-learn-6', 'Write a One-Page Business Plan', 'Business planning', 'Beginner', '2.5 hours', 'Turn your idea into a clear plan you can share with a mentor or funder.', ['Your idea and customer', 'Costs and pricing', 'Goals for 12 months', 'Next steps']),
  l('s-learn-7', 'From Side Hustle to Business', 'Entrepreneurship', 'Intermediate', '3 hours', 'Decide when and how to grow, register and hire.', ['Test your idea', 'Registering a business', 'Pricing for profit', 'Hiring your first helper']),
  l('s-learn-8', 'Leading With Confidence', 'Leadership', 'Intermediate', '2 hours', 'Communication, feedback and decision-making for new leaders.', ['Your leadership style', 'Giving feedback', 'Running a team meeting', 'Making decisions']),
  l('s-learn-9', 'CV and Interview Preparation', 'Career development', 'Beginner', '2 hours', 'A clear CV and confident answers for interviews.', ['CV structure', 'Tell your story', 'Common interview questions', 'Follow up after interviews']),
];

export const COMMUNITY_TOPICS = ['All', 'Business', 'Careers', 'Learning', 'Funding', 'Wellbeing'];
export const SAMPLE_POSTS = [
  { id: 'p1', topic: 'Business', author: 'Sample member', role: 'Home baker', text: 'Sample post: how do you decide on a fair price for custom orders? I keep undercharging.', likes: 12, comments: [{ id: 'c1', author: 'Sample mentor', text: 'Start with the full cost of ingredients, your time and overheads, then add your margin.' }] },
  { id: 'p2', topic: 'Careers', author: 'Sample member', role: 'IT graduate', text: 'Sample post: what helped you most when preparing for your first technical interview?', likes: 8, comments: [] },
  { id: 'p3', topic: 'Learning', author: 'Sample member', role: 'Learner', text: 'Sample post: I finished a short digital skills course this week. Happy to share notes if useful.', likes: 21, comments: [{ id: 'c2', author: 'Sample member', text: 'Yes please, thank you!' }] },
  { id: 'p4', topic: 'Funding', author: 'Sample member', role: 'Founder', text: 'Sample post: any tips for writing the "how will you use the funds" section of an application?', likes: 5, comments: [] },
];

export const PLANS = [
  { id: 'free', name: 'SheBiz Free', tag: 'Start here', price: 'R0', per: 'per month', suits: 'Students and job-seekers exploring SheBiz.', features: ['Standard job matching', 'Access to one active learning course', 'Basic Business Manager with up to five products'], cta: 'Start Free' },
  { id: 'pro', name: 'SheBiz Pro', tag: 'Career', price: 'R99', per: 'per month', suits: 'Graduates and professionals who want to move faster.', features: ['Priority matching features', 'Direct application tracking', 'Unlimited course enrolments', 'Course certificates where supported', 'Priority one-on-one mentorship booking features'], cta: 'Choose Pro' },
  { id: 'business', name: 'SheBiz Business', tag: 'SME', price: 'R199 to R299', per: 'per month', suits: 'Women running or growing a small business.', features: ['Unlimited business product inventory', 'Sales logging', 'Advanced analytics', 'Profit reporting', 'Automated invoices', 'PDF exports', 'Dedicated AI assistant usage'], cta: 'Choose Business', featured: true },
];
export const COMPARE_ROWS = [
  ['Job matching', 'Standard', 'Priority', 'Standard'],
  ['Learning courses', '1 active course', 'Unlimited + certificates*', 'Unlimited'],
  ['Mentorship booking', 'Free mentors', 'Priority booking', 'Standard booking'],
  ['Business products', 'Up to 5', 'Up to 5', 'Unlimited'],
  ['Sales and profit reports', 'Basic', 'Basic', 'Advanced + PDF exports'],
  ['Automated invoices', '-', '-', 'Included'],
  ['SheBiz AI', '5 prompt cycles per day', 'Extended', 'Dedicated usage'],
];
export const FAQ = [
  ['Are these prices final?', 'No. The plans and prices shown are proposed offerings until they are formally launched. Nothing on this page charges you.'],
  ['Is the Free plan really free?', 'Yes. The proposal is that the Free plan stays at R0 per month with no card needed.'],
  ['Can I switch plans later?', 'That is the intention. In this preview, selecting a plan only saves a demo choice in your browser.'],
  ['How does paid mentorship work?', 'Mentors can offer free or paid sessions. SheBiz may keep a platform commission of 10% to 20% on paid sessions.'],
  ['Do you take payments today?', 'No. This preview does not process payments or collect card details.'],
  ['What is the SheBiz AI allowance?', 'The proposal gives free users five prompt cycles per day. Pro and Business would include extended usage.'],
];

export const PARTNER_TYPES = [['Banks', 'Support enterprise and supplier development for women-owned businesses.', 'store'], ['Telecommunications companies', 'Sponsor connectivity, data and digital skills for entrepreneurs.', 'phone'], ['Mining companies', 'Fund local enterprise development near their communities.', 'briefcase'], ['Technology companies', 'Sponsor learning, tools and mentorship cohorts.', 'sparkle'], ['Corporate enterprise development programmes', 'Channel ESD spend into measurable support for micro-enterprises.', 'chart'], ['Incubation hubs', 'Co-host programmes and referrals for early-stage founders.', 'users'], ['Government-supported initiatives', 'Reach more women with existing support programmes.', 'award']];
export const PROMO_OPTIONS = [['standard', 'Standard listing', 'Your opportunity appears in the Opportunities Hub.', 'Pricing on request'], ['featured', 'Featured listing', 'Pinned near the top with a Featured label.', 'Pricing on request'], ['spotlight', 'Spotlight campaign', 'Featured listing plus a promoted slot on the homepage.', 'Pricing on request']];
export const SPONSORED_LEARNING = [['Sponsored masterclass', 'Masterclass', 'A live expert session on a skills topic, supported by a partner.'], ['Digital skills training', 'Training', 'Hands-on digital skills sponsored by a technology partner.'], ['Business workshop', 'Workshop', 'Practical workshops for small business owners.'], ['Career development session', 'Session', 'CV, interview and career planning with industry volunteers.'], ['Mentorship cohort', 'Cohort', 'A group of mentees mentored together over several weeks.'], ['Webinar series', 'Webinar', 'Short webinars on funding, pricing and growth.']];
export const MARKET_CATEGORIES = [['Accounting software', 'Tools for invoices, VAT and bookkeeping.', 'chart'], ['Packaging suppliers', 'Boxes, labels and sustainable packaging.', 'bag'], ['Logistics providers', 'Courier, delivery and fulfilment services.', 'globe'], ['Business support services', 'Registration, compliance and admin help.', 'briefcase'], ['Marketing services', 'Design, photography and campaign support.', 'sparkle'], ['Other business tools', 'Scheduling, payments and customer tools.', 'settings']];

export const GOALS = ['Start a business', 'Grow my business', 'Find a job', 'Prepare my CV', 'Prepare for interviews', 'Learn new skills', 'Funding readiness'];

// --- tiny local persistence for demo choices (clearly NOT real accounts, bookings or payments) ---
export const demoStore = {
  get(key, fallback) { try { const v = localStorage.getItem(`shebiz.demo.${key}`); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(`shebiz.demo.${key}`, JSON.stringify(value)); } catch { /* storage unavailable */ } },
};
