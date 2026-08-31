import React, { useCallback, useMemo, useState } from 'react';
import { ChartFrame } from './components/ChartFrame';
import { CategoryDetail } from './components/CategoryDetail';
import { Hub } from './components/Hub';
import { SettingGroup, SettingsScreen } from './components/SettingsScreen';
import { DRILLS } from './drills';
import { CATEGORIES, categoryById, drillTargetFor } from './lib/syllabus';
import { SessionPlan } from './lib/session';
import { DrillStart, GameMode } from './types';
import { PrefsProvider, usePrefs } from './lib/prefs';
import { Progress, clearProgress, masteryPct, readProgress } from './lib/progress';

// One route at a time, and the drill route carries the syllabus category the
// hub card was for, so a drill opens on that category instead of on its own
// top-level menu.
type Route =
  | { screen: 'hub' }
  | { screen: 'settings' }
  | { screen: 'category'; categoryId: string }
  // `from` is the category screen the run was launched from, so leaving the
  // drill goes back to where it started rather than all the way to the hub.
  | { screen: 'drill'; drillId: string; focus: string; start?: DrillStart; from?: string };

function Shell() {
  const { prefs, savePrefs } = usePrefs();
  const [route, setRoute] = useState<Route>({ screen: 'hub' });
  const [progress, setProgress] = useState<Progress>(readProgress);
  // Bumped every time a run is launched from a category screen - see runKey.
  const [runNonce, setRunNonce] = useState(0);

  // Drills write progress straight to storage as they go. Re-reading on the
  // way back to the hub is what puts those answers on the mastery bars,
  // without the drills having to know the hub exists.
  const goHub = useCallback(() => {
    setProgress(readProgress());
    setRoute({ screen: 'hub' });
  }, []);

  const openDrill = useCallback((drillId: string, focus: string) => {
    setRoute({ screen: 'drill', drillId, focus });
  }, []);

  const openCategory = useCallback((categoryId: string) => {
    setProgress(readProgress());
    setRoute({ screen: 'category', categoryId });
  }, []);

  // Launching from a category screen: the mode is the drill's own, the plan is
  // whatever the controls there were set to.
  const startPlanned = useCallback(
    (categoryId: string, mode: GameMode, plan: SessionPlan) => {
      const cat = categoryById(categoryId);
      const target = cat ? drillTargetFor(cat) : null;
      if (!target) return;
      setRunNonce((n) => n + 1);
      setRoute({
        screen: 'drill',
        drillId: target.drillId,
        focus: target.focus,
        start: { mode, plan },
        from: categoryId,
      });
    },
    []
  );

  const exportProgress = useCallback(() => {
    try {
      const rows = [['category', 'answered', 'correct', 'mastery_pct', 'last_drilled_iso']];
      for (const cat of CATEGORIES) {
        const c = progress.cats[cat.id];
        if (!c) continue;
        rows.push([
          cat.name,
          String(c.answered),
          String(c.correct),
          String(masteryPct(progress, cat.id)),
          c.last ? new Date(c.last).toISOString() : '',
        ]);
      }
      const csv = rows.map((r) => r.map((f) => `"${f.replace(/"/g, '""')}"`).join(',')).join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fathom-progress.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // A blocked download is not worth breaking the settings screen over.
    }
  }, [progress]);

  const settingGroups: SettingGroup[] = useMemo(() => {
    const toggle = (
      key: 'colorblind' | 'haptics' | 'showCitations',
      label: string,
      help: string
    ) => ({
      key,
      label,
      help,
      ctrlLabel: prefs[key] ? 'On' : 'Off',
      tone: (prefs[key] ? 'on' : 'off') as 'on' | 'off',
      onActivate: () => savePrefs({ ...prefs, [key]: !prefs[key] }),
    });

    return [
      {
        name: 'Display',
        rows: [
          {
            key: 'theme',
            label: 'Night helm',
            help: 'Warm brass instrument lighting on navy, to preserve night vision at the wheel.',
            ctrlLabel: prefs.theme === 'dark' ? 'On' : 'Off',
            tone: (prefs.theme === 'dark' ? 'on' : 'off') as 'on' | 'off',
            onActivate: () =>
              savePrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' }),
          },
          toggle(
            'colorblind',
            'Colourblind marks',
            'Adds text labels wherever port red and starboard green carry meaning.'
          ),
        ],
      },
      {
        name: 'Drilling',
        rows: [
          toggle(
            'showCitations',
            'Rule citations',
            'Show the rule a question is drawn from beside the verdict.'
          ),
          toggle(
            'haptics',
            'Haptic feedback',
            'Short pulse on an incorrect answer. Mobile only, where the browser allows it.'
          ),
        ],
      },
      {
        name: 'Data',
        rows: [
          {
            key: 'reset',
            label: 'Reset progress',
            help: 'Clears mastery, drilled totals and the streak for every category. Cannot be undone.',
            ctrlLabel: 'Reset',
            tone: 'danger' as const,
            onActivate: () => {
              clearProgress();
              setProgress(readProgress());
            },
          },
          {
            key: 'export',
            label: 'Export progress',
            help: 'Download per-category answered, correct and mastery figures as CSV.',
            ctrlLabel: 'Export',
            tone: 'off' as const,
            onActivate: exportProgress,
          },
        ],
      },
    ];
  }, [exportProgress, prefs, savePrefs]);

  const hubBody = (
    <Hub progress={progress} onOpenCategory={openCategory} onOpenDrill={openDrill} />
  );

  // Two runs launched from the same category screen must not share a mounted
  // drill, or the second would inherit the first's deck. Counting them gives
  // each one its own key.
  const runKey = route.screen === 'drill' && route.start ? runNonce : 0;

  let body: React.ReactNode;

  if (route.screen === 'settings') {
    body = <SettingsScreen groups={settingGroups} onBack={goHub} />;
  } else if (route.screen === 'category') {
    const cat = categoryById(route.categoryId);
    body = cat ? (
      <CategoryDetail
        category={cat}
        progress={progress}
        onBack={goHub}
        onStart={(mode, plan) => startPlanned(cat.id, mode, plan)}
      />
    ) : (
      hubBody
    );
  } else if (route.screen === 'drill') {
    const drill = DRILLS.find((d) => d.id === route.drillId);
    if (drill) {
      const DrillComponent = drill.component;
      // Keyed on the focus as well as the drill, so picking a different
      // category from the hub restarts the drill on it rather than leaving the
      // previous run's state in place.
      const from = route.from;
      body = (
        <DrillComponent
          // Keyed on the focus and the run, so picking a different category -
          // or a different exercise from the same one - restarts the drill
          // rather than leaving the previous run's state in place.
          key={`${drill.id}:${route.focus}:${runKey}`}
          focus={route.focus}
          start={route.start}
          onExit={from ? () => openCategory(from) : undefined}
        />
      );
    } else {
      body = hubBody;
    }
  } else {
    body = hubBody;
  }

  return (
    <ChartFrame
      theme={prefs.theme}
      onToggleTheme={() =>
        savePrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })
      }
      onGoHub={goHub}
      onGoSettings={() => setRoute({ screen: 'settings' })}
    >
      {body}
    </ChartFrame>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <Shell />
    </PrefsProvider>
  );
}
