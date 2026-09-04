import React from 'react';
import { MONO } from '../lib/theme';
import { sections } from '../lib/syllabus';

// Where this came from, what Sea Scouting is, what is in it, and where the
// content came from. The coverage list is read from the syllabus rather than
// written out, so a new section cannot leave this page quietly out of date.

const heading: React.CSSProperties = {
  margin: '32px 0 0',
  fontWeight: 600,
  fontSize: 21,
  letterSpacing: '0.01em',
  color: 'var(--ct-ink)',
};

const prose: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: 15.5,
  lineHeight: 1.65,
  color: 'var(--ct-ink)',
};

export const AboutScreen: React.FC = () => {
  const all = sections();

  return (
    <section className="ct-fade" style={{ padding: '28px 0 0' }}>
      <h1
        className="ct-display"
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1.05,
          letterSpacing: '0.005em',
          color: 'var(--ct-ink)',
        }}
      >
        About Fathom
      </h1>

      <p className="ct-measure" style={{ ...prose, marginTop: 20, fontSize: 17 }}>
        Fathom started earlier this year as NauticalMaster, built for my Sea
        Scout crew, Ship 16, to drill the Rules of the Road and the rest of the
        competition material for the Ancient Mariner Regatta and the
        Southwestern Rendezvous. Meeting time was short, and there was no good
        way to practice the material between meetings. This became that.
      </p>
      <p className="ct-measure" style={prose}>
        It asks you the same questions an examiner would &mdash; a set of lights
        on a dark hull, a blast pattern, a give-way situation &mdash; and shows
        you the rule behind the answer every time, so what you remember is the
        rule and not the answer.
      </p>
      <p className="ct-measure" style={prose}>
        It has grown a good deal since then, and it is built for every Sea Scout
        now, not just Ship 16.
      </p>

      <h2 className="ct-display" style={heading}>
        About Sea Scouting
      </h2>
      <p className="ct-measure" style={prose}>
        Sea Scouting is the boating and seamanship program of Scouting America,
        organized into crews called ships rather than troops &mdash; this one is
        Ship 16. Its ranks &mdash; Apprentice, Ordinary, Able and Quartermaster
        &mdash; and its regattas test the same material this app drills: rules of
        the road, piloting and seamanship knowledge, alongside the hands-on
        skills no app can stand in for.
      </p>

      <h2 className="ct-display" style={heading}>
        What it covers
      </h2>
      <p className="ct-measure" style={prose}>
        {all.length} sections of the syllabus:
      </p>
      <ul
        className="ct-measure"
        style={{ ...prose, marginTop: 8, paddingLeft: 20, listStyle: 'square' }}
      >
        {all.map((section) => (
          <li key={section.name} style={{ marginBottom: 4 }}>
            <strong style={{ fontWeight: 600 }}>{section.name}</strong> —{' '}
            {section.categories.map((c) => c.name).join(', ')}
          </li>
        ))}
      </ul>
      <p className="ct-measure" style={prose}>
        Some topics are drilled from a written question bank, some against the
        compass rose, and some are on the syllabus with their questions still to
        be written. Each card says which it is rather than leaving you to find
        out by opening it.
      </p>

      <h2 className="ct-display" style={heading}>
        Where the content comes from
      </h2>
      <p className="ct-measure" style={prose}>
        The rules questions are drawn from the COLREGs 1972 as amended, and were
        checked by hand against the US Coast Guard Navigation Rules and 33 CFR
        83. Every explanation carries the rule it rests on, so you can go and
        read the source rather than take this app's word for it. Topics the
        rules do not govern — buoyage, which is IALA's system, radio procedure,
        which is the regulator's, and seamanship, which is nobody's — carry a
        topic label naming the authority they do rest on instead of a rule
        number, because inventing a citation for them would be worse than
        admitting there isn't one.
      </p>
      <p className="ct-measure" style={prose}>
        Automated checks keep every citation in a well-formed shape, but they
        cannot check that a citation is legally right. That part was done by
        hand, and mistakes are possible — if you find one, the feedback button
        in the top bar is the place for it.
      </p>

      <div className="ct-rule" style={{ margin: '34px 0 16px' }} />

      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '0.1em',
          color: 'var(--ct-muted)',
          lineHeight: 1.8,
        }}
      >
        <div>Rules quoted from COLREGs 1972 as amended.</div>
        <div>Study aid only — not a substitute for the published Rules.</div>
      </div>
    </section>
  );
};
