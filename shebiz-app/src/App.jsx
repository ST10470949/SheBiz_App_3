import React, { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './state/store.jsx';
import Shell from './pages/Shell.jsx';
import SiteLayout from './site/SiteLayout.jsx';
import Home from './site/pages/Home.jsx';
import { Login, Register, VerifyEmail, ForgotPassword } from './pages/Auth.jsx';

const OpportunitiesHub = lazy(() => import('./site/pages/OpportunitiesHub.jsx'));
const MentorshipHub = lazy(() => import('./site/pages/MentorshipHub.jsx'));
const MentorProfilePage = lazy(() => import('./site/pages/MentorProfilePage.jsx'));
const DirectoryPage = lazy(() => import('./site/pages/Directory.jsx').then((m) => ({ default: m.Directory })));
const BusinessProfilePage = lazy(() => import('./site/pages/Directory.jsx').then((m) => ({ default: m.BusinessProfile })));
const LearningHub = lazy(() => import('./site/pages/LearningHub.jsx').then((m) => ({ default: m.LearningHub })));
const LearningDetail = lazy(() => import('./site/pages/LearningHub.jsx').then((m) => ({ default: m.LearningDetail })));
const Community = lazy(() => import('./site/pages/Community.jsx'));
const Membership = lazy(() => import('./site/pages/Membership.jsx'));
const Partners = lazy(() => import('./site/pages/Partners.jsx'));
const About = lazy(() => import('./site/pages/About.jsx'));
const Contact = lazy(() => import('./site/pages/Contact.jsx'));
const Payments = lazy(() => import('./pages/Payments.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Opportunities = lazy(() => import('./pages/Opportunities.jsx'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail.jsx'));
const Mentorship = lazy(() => import('./pages/Mentorship.jsx'));
const MentorProfile = lazy(() => import('./pages/MentorProfile.jsx'));
const Business = lazy(() => import('./pages/Business.jsx'));
const Manager = lazy(() => import('./pages/Manager.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const AIAssistant = lazy(() => import('./pages/AIAssistant.jsx'));
const Learning = lazy(() => import('./pages/Learning.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

const Boot = () => <div className="boot" role="status" aria-label="Loading SheBiz"><span className="spinner" /></div>;

/** Signed-in AND verified users only. Everyone else is sent to the right place. */
function Protected() {
  const { user, bootError } = useApp();
  const loc = useLocation();
  if (bootError) return <div className="boot"><p>Could not start SheBiz. Check your Firebase settings in .env.</p></div>;
  if (user === undefined) return <Boot />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return <Shell><Suspense fallback={<div className="page"><div className="skeleton" style={{ height: 280, borderRadius: 24 }} /></div>}><Outlet /></Suspense></Shell>;
}

/** Login / register pages: signed-in users skip straight into the app. */
function GuestOnly() {
  const { user } = useApp();
  if (user === undefined) return <Boot />;
  if (user && user.emailVerified) return <Navigate to="/dashboard" replace />;
  if (user && !user.emailVerified) return <Navigate to="/verify-email" replace />;
  return <Outlet />;
}

function SetupScreen({ error }) {
  const missing = error?.code === 'setup/missing-config';
  return (
    <div className="boot" style={{ padding: 24 }}>
      <div className="card" style={{ maxWidth: 620 }}>
        <h1 style={{ fontSize: 28 }}>{missing ? 'Connect SheBiz to Firebase' : 'Could not connect to Firebase'}</h1>
        {missing ? (
          <ol className="muted" style={{ lineHeight: 1.9, margin: '14px 0 0 18px' }}>
            <li>Create a Firebase project and add a Web app.</li>
            <li>Copy <code>.env.example</code> to <code>.env</code> and paste your <code>VITE_FIREBASE_*</code> values.</li>
            <li>Stop the dev server and run <code>npm run dev</code> again.</li>
          </ol>
        ) : <p className="muted" style={{ marginTop: 10 }}>Check the values in your <code>.env</code> file and your internet connection, then reload.</p>}
        <p className="muted small" style={{ marginTop: 14 }}>Full steps are in <code>README.md</code>. SheBiz uses real accounts and real data only.</p>
      </div>
    </div>
  );
}

export default function App() {
  const { backend, bootError } = useApp();
  if (bootError) return <SetupScreen error={bootError} />;
  if (!backend) return <Boot />;
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore/opportunities" element={<Suspense fallback={<Boot />}><OpportunitiesHub /></Suspense>} />
        <Route path="/explore/mentorship" element={<Suspense fallback={<Boot />}><MentorshipHub /></Suspense>} />
        <Route path="/explore/businesses" element={<Navigate to="/directory" replace />} />
        <Route path="/mentors/:id" element={<Suspense fallback={<Boot />}><MentorProfilePage /></Suspense>} />
        <Route path="/directory" element={<Suspense fallback={<Boot />}><DirectoryPage /></Suspense>} />
        <Route path="/directory/:id" element={<Suspense fallback={<Boot />}><BusinessProfilePage /></Suspense>} />
        <Route path="/learning-hub" element={<Suspense fallback={<Boot />}><LearningHub /></Suspense>} />
        <Route path="/learning-hub/:id" element={<Suspense fallback={<Boot />}><LearningDetail /></Suspense>} />
        <Route path="/community" element={<Suspense fallback={<Boot />}><Community /></Suspense>} />
        <Route path="/membership" element={<Suspense fallback={<Boot />}><Membership /></Suspense>} />
        <Route path="/partners" element={<Suspense fallback={<Boot />}><Partners /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<Boot />}><About /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<Boot />}><Contact /></Suspense>} />
      </Route>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/mentorship/:id" element={<MentorProfile />} />
        <Route path="/my-business" element={<Business />} />
        <Route path="/my-business/manager" element={<Manager />} />
        <Route path="/my-business/payments" element={<Payments />} />
        <Route path="/my-business/analytics" element={<Analytics />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/:courseId" element={<Learning />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
