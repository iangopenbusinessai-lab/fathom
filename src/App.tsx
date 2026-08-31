import React, { useCallback, useMemo, useState } from 'react';
import { ChartFrame } from './components/ChartFrame';
import { Hub } from './components/Hub';
import { SettingGroup, SettingsScreen } from './components/SettingsScreen';
import { DRILLS } from './drills';
import { CATEGORIES } from './lib/syllabus';
import { PrefsProvider, usePrefs } from './lib/prefs';
import { Progress, clearProgress, masteryPct, readProgress } from './lib/progress';

// One route at a time, and the drill route carries the syllabus category the
// hub card was for, so a drill opens on that category instead of on its own
// top-level menu.
type Route =
  | { screen: 'hub' }
  | { screen: 'settings' }
  | { screen: 'drill'; drillId: string; focus: string };

function Shell() {
  const { prefs, savePrefs } = usePrefs();
  const [route, setRoute] = useState<Route>({ screen: 'hub' });
  const [progress, setProgress] = useState<Progress>(readProgress);

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

  let body: React.ReactNode;

  if (route.screen === 'settings') {
    body = <SettingsScreen groups={settingGroups} onBack={goHub} />;
  } else if (route.screen === 'drill') {
    const drill = DRILLS.find((d) => d.id === route.drillId);
    if (drill) {
      const DrillComponent = drill.component;
      // Keyed on the focus as well as the drill, so picking a different
      // category from the hub restarts the drill on it rather than leaving the
      // previous run's state in place.
      body = <DrillComponent key={`${drill.id}:${route.focus}`} focus={route.focus} />;
    } else {
      body = <Hub progress={progress} onOpenDrill={openDrill} />;
    }
  } else {
    body = <Hub progress={progress} onOpenDrill={openDrill} />;
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
