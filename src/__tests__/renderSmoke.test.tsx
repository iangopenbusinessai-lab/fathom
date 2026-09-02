import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App';
import { Hub } from '../components/Hub';
import { ChartFrame } from '../components/ChartFrame';
import { SECTION_ORDER } from '../lib/syllabus';
import { readProgress } from '../lib/progress';
import { CategoryDetail } from '../components/CategoryDetail';
import { AboutScreen } from '../components/AboutScreen';
import { SectionScreen } from '../components/SectionScreen';
import { categoryById, sectionByName, sections } from '../lib/syllabus';
import ColregsDrill from '../drills/colregs';
import CompassDrill from '../drills/compass';

// A shallow guard, not a UI test: it renders the real tree once and asserts
// the frame and the four syllabus sections are actually on the page. It caught
// nothing more than "it mounts", which is exactly what it is for - there is no
// DOM test runner in this project, so without it a broken import or a bad hook
// only shows up in the browser.

describe('app shell renders', () => {
  it('mounts the chart frame and the hub', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('ct-root');
    expect(html).toContain('FATHOM');
    for (const section of SECTION_ORDER) {
      expect(html).toContain(section);
    }
  });

  it('draws a card for every syllabus SECTION, not every category', () => {
    const html = renderToStaticMarkup(
      <ChartFrame
        theme="dark"
        onGoHub={() => undefined}
        onGoSettings={() => undefined}
      >
        <Hub
          progress={readProgress()}
          onOpenSection={() => undefined}
          onOpenDrill={() => undefined}
        />
      </ChartFrame>
    );
    // The dark palette's tokens must reach the root, or every screen inside
    // renders on an unstyled ground.
    expect(html).toContain('--ct-bg:#0a1929');

    // The hub is a welcome screen now: one card per section, and the count
    // read from the syllabus rather than written into the page.
    expect(html).toContain('The syllabus');
    expect(html).toContain(`${sections().length} sections`);
    for (const section of SECTION_ORDER) {
      expect(html).toContain(section);
    }

    // Category names appear only inside a section card's summary line, never
    // as cards of their own - the mastery bar is what a card carries, so
    // counting those is how we tell one kind of card from the other.
    const bars = html.match(/aria-label="Mastery /g) ?? [];
    expect(bars).toHaveLength(sections().length);
  });

  it('keeps the wordmark on the stencil face after the Fraunces swap', () => {
    const html = renderToStaticMarkup(
      <ChartFrame theme="dark" onGoHub={() => undefined} onGoSettings={() => undefined}>
        <div />
      </ChartFrame>
    );
    // FATHOM is the one thing still set in Big Shoulders Stencil. Everything
    // else that used to be - section headers, screen titles, card titles - is
    // ct-display now.
    expect(html).toContain('ct-stencil');
    expect(html).toContain('Big Shoulders Stencil');
    expect(html).toContain('Fraunces');
    expect(html).toMatch(/class="ct-stencil"[^>]*>[^<]*FATHOM/);
  });
});

describe('a section screen lists that section and only that section', () => {
  const rules = sectionByName('Rules of the road')!;

  it('draws a card for every category in the section', () => {
    const html = renderToStaticMarkup(
      <SectionScreen
        section={rules}
        progress={readProgress()}
        onOpenCategory={() => undefined}
      />
    );
    for (const cat of rules.categories) {
      expect(html).toContain(cat.name);
    }
    // And nothing from a different section.
    expect(html).not.toContain('Buoyage / IALA marks');
  });

  it('names the section and says how much of it is drillable', () => {
    const html = renderToStaticMarkup(
      <SectionScreen
        section={rules}
        progress={readProgress()}
        onOpenCategory={() => undefined}
      />
    );
    expect(html).toContain('Rules of the road');
    expect(html).toContain('topics');
    expect(html).toContain('drillable');
  });
});

describe('the about screen', () => {
  it('lists the syllabus sections rather than a written-out copy of them', () => {
    const html = renderToStaticMarkup(<AboutScreen />);
    expect(html).toContain('About Fathom');
    expect(html).toContain(`${sections().length} sections`);
    for (const section of SECTION_ORDER) {
      expect(html).toContain(section);
    }
    expect(html).toContain('33 CFR');
  });
});

describe('the frame says where you are', () => {
  it('names the hub as the current location, with no way back to itself', () => {
    const html = renderToStaticMarkup(
      <ChartFrame theme="dark" onGoHub={() => undefined} onGoSettings={() => undefined}>
        <div />
      </ChartFrame>
    );
    expect(html).toContain('ct-crumb-here');
    expect(html).toContain('Chart table');
    expect(html).not.toContain('ct-crumb"');
  });

  it('carries a section step between the hub and a category', () => {
    const html = renderToStaticMarkup(
      <ChartFrame
        theme="dark"
        onGoHub={() => undefined}
        onGoSettings={() => undefined}
        trail={[
          { label: 'Rules of the road', onClick: () => undefined },
          { label: 'Navigation lights', onClick: () => undefined },
          { label: 'Rules of the Road' },
        ]}
      >
        <div />
      </ChartFrame>
    );
    // Chart table / Section / Category / Drill - three separators. Matched on
    // the attribute, not the bare class name, which also appears in the
    // stylesheet the frame ships inline.
    expect(html.match(/class="ct-crumb-sep"/g) ?? []).toHaveLength(3);
    expect(html).toContain('ct-crumb-here');
  });

  it('puts a labelled way home in front of the current screen', () => {
    const html = renderToStaticMarkup(
      <ChartFrame
        theme="dark"
        onGoHub={() => undefined}
        onGoSettings={() => undefined}
        trail={[{ label: 'Rules of the road' }, { label: 'Navigation lights' }]}
      >
        <div />
      </ChartFrame>
    );
    expect(html).toContain('ct-crumb"');
    expect(html).toContain('Chart table');
    expect(html).toContain('Navigation lights');
  });

  // The masthead toggle is gone; the theme control lives in Settings.
  it('no longer carries a theme chip', () => {
    const html = renderToStaticMarkup(
      <ChartFrame theme="light" onGoHub={() => undefined} onGoSettings={() => undefined}>
        <div />
      </ChartFrame>
    );
    expect(html).not.toContain('ct-chip');
    expect(html).not.toContain('Night helm');
  });
});

describe('drills open on the category the hub sent them to', () => {
  it('colregs opens on the focused topic rather than its own list', () => {
    const html = renderToStaticMarkup(<ColregsDrill focus="day-shapes" />);
    expect(html).toContain('Day shapes');
    // Straight to the mode picker - the topic list is skipped, and so is its
    // back link, because the hub is the way back.
    expect(html).toContain('Practice');
    expect(html).not.toContain('All topics');
  });

  it('colregs opened cold still shows its own topic list', () => {
    const html = renderToStaticMarkup(<ColregsDrill />);
    expect(html).toContain('Collision regulations');
    expect(html).toContain('All rules of the road');
  });

  it('compass opens on the rose the hub card names', () => {
    expect(renderToStaticMarkup(<CompassDrill focus="relative" />)).toContain(
      'Relative bearings'
    );
    expect(renderToStaticMarkup(<CompassDrill focus="compass" />)).toContain(
      'Compass bearings'
    );
  });
});

describe('the category screen', () => {
  const lights = categoryById('lights')!;
  const blank = readProgress();

  function detail(progress = blank) {
    return renderToStaticMarkup(
      <CategoryDetail
        category={lights}
        progress={progress}
        onBack={() => undefined}
        onStart={() => undefined}
      />
    );
  }

  it('says so plainly rather than showing an empty weak-spot list', () => {
    const html = detail();
    expect(html).toContain('Not enough answers here yet');
  });

  it('lists the worst questions once there is history', () => {
    const html = detail({
      cats: {},
      items: {
        // The prompt for nl-01 is the starboard sidelight question.
        'nl-01': { answered: 4, correct: 0 },
        'nl-02': { answered: 4, correct: 3 },
      },
      days: [],
    });
    expect(html).toContain('starboard sidelight');
    expect(html).toContain('0% · 0/4');
    expect(html).not.toContain('Not enough answers here yet');
  });

  it('offers the three exercise controls and the standard runs', () => {
    const html = detail();
    expect(html).toContain('Questions');
    expect(html).toContain('Timer');
    expect(html).toContain('Focus on weak spots');
    expect(html).toContain('Practice · untimed');
    expect(html).toContain('Exam · 15s each');
  });
});
