import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PageHero, Reveal, SectionHead } from '../components.jsx';

export default function About() {
  return (
    <>
      <PageHero eyebrow="About SheBiz" title="Women supporting women, powered by technology" text="SheBiz is a digital space where women discover opportunities, meet mentors, build skills and grow their businesses, all in one place." />
      <section className="sec-tight"><div className="wrap-site split-s">
        <Reveal><h2 className="big">Our mission</h2><p className="lead">To help women build their futures through mentorship, career opportunities, business development, education, technology and community.</p>
          <p className="lead">Your ideas deserve opportunities. Your ambitions deserve support. Your future deserves a community that believes in you.</p></Reveal>
        <Reveal delay={100} className="values">{[['users', 'Connection', 'Women learning from women.'], ['sparkle', 'Opportunity', 'Clear paths to jobs, funding and growth.'], ['chart', 'Growth', 'Simple tools that make business less intimidating.'], ['award', 'Trust', 'Honest, clearly labelled information.']].map(([ic, t, d]) => <div key={t} className="value"><span className="fm-ic"><Icon name={ic} size={22} /></span><b>{t}</b><p>{d}</p></div>)}</Reveal>
      </div></section>
      <section className="sec sec-band"><div className="wrap-site"><SectionHead eyebrow="The team" title="Built by Error 404" text="SheBiz is a hackathon project designed to show how technology can open doors for women entrepreneurs, students and professionals." />
        <div className="center"><Link to="/contact" className="btn btn-pink btn-lg">Get in touch</Link></div></div></section>
    </>
  );
}
