// Seed content for SheBiz. Plain ES module (no JSX) .

const iso = (d) => d.toISOString().slice(0, 10);
export const addDays = (days, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
};

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

export const INTEREST_OPTIONS = ['Finding a job', 'Finding a mentor', 'Learning new skills', 'Starting a business', 'Growing my business', 'Networking'];
export const CATEGORIES = ['Technology', 'Design', 'Business', 'Finance', 'Marketing', 'Leadership'];
export const MENTOR_CATEGORIES = ['Technology', 'Business', 'Finance', 'Marketing', 'Leadership', 'Career Development'];
export const OPP_TYPES = ['Job', 'Internship', 'Learnership', 'Scholarship', 'Programme'];
export const EXPENSE_CATEGORIES = ['Ingredients', 'Packaging', 'Transport', 'Utilities', 'Marketing', 'Other'];
