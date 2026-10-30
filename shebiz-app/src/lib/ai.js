// SheBiz AI.
// - With Firebase + Cloud Functions the question goes to Gemini through the secure `askAI` function.
// - Otherwise this offline helper answers with practical, personalised steps (rule-based, no internet needed).

export const AI_DISCLAIMER = 'AI guidance supports your choices. Important decisions remain yours.';

export const TOPICS = [
  { key: 'career', title: 'Career', sub: 'Prepare for an interview', prompt: 'Help me prepare for a job interview', tint: 'lav', icon: 'briefcase' },
  { key: 'business', title: 'Business', sub: 'Market my cake business', prompt: 'How can I market my cake business?', tint: 'blush', icon: 'store' },
  { key: 'skills', title: 'Skills', sub: 'Become a web developer', prompt: 'How do I become a web developer?', tint: 'cream', icon: 'book' },
  { key: 'mentorship', title: 'Mentorship', sub: 'Prepare for mentor session', prompt: 'Help me prepare for my mentor session', tint: 'lav', icon: 'user' },
];

const has = (q, words) => words.some((w) => q.includes(w));

export function detectTopic(q) {
  const s = q.toLowerCase();
  if (has(s, ['harm myself', 'suicide', 'kill myself'])) return 'safety';
  if (has(s, ['medical', 'diagnos', 'lawsuit', 'sue ', 'legal advice', 'invest all', 'guarantee'])) return 'outofscope';
  if (has(s, ['mentor', 'check-in', 'session'])) return 'mentorship';
  if (has(s, ['interview', 'cv', 'resume', 'cover letter', 'job', 'salary', 'career', 'apply', 'internship'])) return 'career';
  if (has(s, ['sale', 'profit', 'price', 'pricing', 'market', 'customer', 'stock', 'expense', 'business', 'cake', 'bakery', 'improve', 'grow', 'instagram', 'whatsapp'])) return 'business';
  if (has(s, ['learn', 'skill', 'developer', 'coding', 'code', 'web', 'course', 'study', 'java', 'html'])) return 'skills';
  return 'general';
}

const list = (title, steps) => `${title}\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

export function parseAnswer(text) {
  const lines = String(text).split('\n').filter(Boolean);
  const steps = lines.filter((l) => /^\d+\.\s/.test(l)).map((l) => l.replace(/^\d+\.\s/, ''));
  const title = lines.find((l) => !/^\d+\.\s/.test(l)) || '';
  const rest = lines.filter((l) => !/^\d+\.\s/.test(l)).slice(1);
  return { title: steps.length ? title : '', steps, body: steps.length ? rest : lines };
}
