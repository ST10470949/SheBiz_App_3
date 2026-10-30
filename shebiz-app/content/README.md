# Real content for SheBiz

SheBiz ships with **no** made-up jobs or mentors. Add real ones here, then run `npm run import-content`.

## opportunities.json  (array)
```json
{
  "id": "acme-junior-dev-2026",
  "title": "Junior Developer",
  "company": "Real Company (Pty) Ltd",
  "location": "Gqeberha",
  "type": "Job",
  "category": "Technology",
  "deadline": "2026-12-15",
  "description": "What the role is, in your own words.",
  "requirements": ["Diploma in IT or similar", "Basic JavaScript"],
  "skills": ["HTML", "JavaScript"],
  "applyUrl": "https://real-link-to-the-advert"
}
```
`type`: Job, Internship, Learnership, Scholarship or Programme. `deadline` is YYYY-MM-DD. Only add listings you have verified, and always include the real `applyUrl`.

## mentors.json  (array) - only people who have agreed to be listed
```json
{
  "id": "jane-doe",
  "name": "Jane Doe",
  "title": "Software Engineer, Real Company",
  "category": "Technology",
  "skills": ["Career growth", "Java"],
  "yearsExperience": 8,
  "bio": "Written or approved by the mentor.",
  "languages": ["English", "isiXhosa"],
  "availability": ["Tue 17:00", "Sat 10:00"],
  "available": true
}
```
`category`: Technology, Business, Finance, Marketing, Leadership or Career Development. Do not add `rating` or `menteeCount` unless they are real.

## Accepting a mentorship request
Requests appear in Firestore at `users/{uid}/mentorships/{id}` with `status: "Requested"`. After the mentor agrees, change `status` to `Connected` in the Firebase console (or Admin SDK). The mentee is then shown as connected.
