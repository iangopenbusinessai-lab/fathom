// @vitest-environment jsdom
import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import ColregsDrill from '../drills/colregs';
import { PrefsProvider } from '../lib/prefs';
import { DEFAULT_PLAN } from '../lib/session';

// This file exists because two bugs got past a suite that only ever rendered
// the tree once, with renderToStaticMarkup:
//
//   * VisualPanel and ScenarioCard were siblings sharing the key `current.id`.
//     React's documented response to duplicate sibling keys is that children
//     "may be duplicated and/or omitted", and what it did here was stop
//     unmounting the diagram: every picture drawn stayed in the DOM and piled
//     up under the questions that followed, including the ones deliberately
//     built with no diagram. A single static render cannot see this - it only
//     appears on the second reconcile.
//   * Answering scheduled an advance 1.2s or 2s later, so the explanation and
//     citation were gone before they could be read.
//
// Both are about what happens BETWEEN renders, so this walks a real run.

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

function mount(mode: 'practice' | 'exam' = 'practice') {
  act(() => {
    root.render(
      <PrefsProvider>
        <ColregsDrill focus="anchor-types" start={{ mode, plan: DEFAULT_PLAN }} />
      </PrefsProvider>
    );
  });
}

const $ = (sel: string) => [...container.querySelectorAll(sel)] as HTMLElement[];
const prompt = () => container.querySelector('h2')?.textContent ?? '';
const options = () =>
  $('.ct-option').filter(b => !(b as HTMLButtonElement).disabled) as HTMLButtonElement[];
const nextButton = () =>
  $('button').find(b => /next question|see results/i.test(b.textContent ?? '')) as
    | HTMLButtonElement
    | undefined;
const click = (el: HTMLElement) => act(() => { el.click(); });

describe('the diagram belongs to the question on screen', () => {
  it('never leaves a picture behind when the next question has none', () => {
    mount();
    const seen: Array<{ claims: boolean; inDom: number }> = [];

    for (let i = 0; i < 24; i++) {
      const body = container.querySelector('.ct-quizbody');
      expect(body, 'the run ended early').toBeTruthy();

      const claims = body!.className.includes('ct-has-visual');
      const inDom = container.querySelectorAll('.ct-instrument').length;
      seen.push({ claims, inDom });

      // The panel the layout reserves room for and the panel actually in the
      // document are the same panel: one, or none, never a leftover.
      expect(inDom, `after ${i} questions: ${prompt().slice(0, 50)}`).toBe(claims ? 1 : 0);

      click(options()[0]);
      click(nextButton()!);
    }

    // The category mixes diagrammed and undiagrammed questions, so a run this
    // long must have crossed between the two in both directions - otherwise
    // the assertion above never exercised the transition that broke.
    expect(seen.some(s => s.claims)).toBe(true);
    expect(seen.some(s => !s.claims)).toBe(true);
  });

  it('renders each panel under a key of its own', () => {
    const errors: unknown[][] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args); });

    mount();
    for (let i = 0; i < 8; i++) {
      click(options()[0]);
      click(nextButton()!);
    }

    const keyWarnings = errors.filter(a => /same key/i.test(String(a[0])));
    expect(keyWarnings).toEqual([]);
  });
});

describe('nothing advances on its own', () => {
  it('keeps the explanation and the citation up until Next is pressed', () => {
    mount();
    const first = prompt();

    click(options()[0]);
    expect(container.textContent).toMatch(/Correct|Incorrect/);
    const explanation = container.querySelector('.ct-fade p')?.textContent ?? '';
    expect(explanation.length).toBeGreaterThan(20);

    // The old behaviour moved on after 1.2s (right) or 2s (wrong). Nothing
    // here may, however long the reader takes.
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(prompt()).toBe(first);
    expect(container.querySelector('.ct-fade p')?.textContent).toBe(explanation);
    expect(nextButton()).toBeTruthy();

    click(nextButton()!);
    expect(prompt()).not.toBe(first);
  });

  it('ignores every further click on an answered card', () => {
    mount();
    const first = prompt();
    const before = $('.ct-option').map(b => b.textContent);

    click($('.ct-option')[0]);
    // Every option is locked now, including the ones never picked - clicking a
    // revealed wrong answer must not silently jump forward.
    expect(options()).toHaveLength(0);
    for (const opt of $('.ct-option')) click(opt);
    // And the body of the card is not a hidden advance control either.
    click(container.querySelector('.ct-quizbody') as HTMLElement);

    expect(prompt()).toBe(first);
    expect($('.ct-option').map(b => b.textContent)).toEqual(before);
  });

  it('holds a timed-out exam question until Next, rather than skipping it', () => {
    mount('exam');
    const first = prompt();

    // The 15s exam clock runs out with nothing picked.
    act(() => { vi.advanceTimersByTime(16_000); });
    act(() => { vi.advanceTimersByTime(10_000); });

    expect(prompt()).toBe(first);
    expect(nextButton()).toBeTruthy();
    expect(options()).toHaveLength(0);

    click(nextButton()!);
    expect(prompt()).not.toBe(first);
  });
});
