import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App';
import { Hub } from '../components/Hub';
import { ChartFrame } from '../components/ChartFrame';
import { SECTION_ORDER } from '../lib/syllabus';
import { readProgress } from '../lib/progress';
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

  it('draws a card for every syllabus category', () => {
    const html = renderToStaticMarkup(
      <ChartFrame
        theme="dark"
        onToggleTheme={() => undefined}
        onGoHub={() => undefined}
        onGoSettings={() => undefined}
      >
        <Hub progress={readProgress()} onOpenDrill={() => undefined} />
      </ChartFrame>
    );
    // The dark palette's tokens must reach the root, or every screen inside
    // renders on an unstyled ground.
    expect(html).toContain('--ct-bg:#0a1929');
    expect(html).toContain('Buoyage / IALA marks');
    expect(html).toContain('Navigation lights');
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
