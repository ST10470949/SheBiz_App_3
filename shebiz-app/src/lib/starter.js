// New accounts start EMPTY. Everything a user sees is data they entered themselves
// (or shared content stored in Firestore). Nothing here is sample data.

export const defaultBusiness = (location = '') => ({
  name: '', location, description: '', phone: '', social: '', cipc: false, goal: 0, logoURL: '',
});

export const COLLECTIONS = ['products', 'sales', 'expenses', 'customers', 'notifications', 'mentorships', 'messages', 'courseProgress', 'applications', 'saved', 'aiChats'];
