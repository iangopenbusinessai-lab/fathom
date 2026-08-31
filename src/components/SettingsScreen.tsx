import React from 'react';
import { MONO, STENCIL } from '../lib/theme';

export interface SettingRow {
  key: string;
  label: string;
  help: string;
  ctrlLabel: string;
  // 'on' fills the control brass; 'off' leaves it outlined; 'danger' outlines
  // it in port red for the destructive action.
  tone: 'on' | 'off' | 'danger';
  onActivate: () => void;
}

export interface SettingGroup {
  name: string;
  rows: SettingRow[];
}

interface SettingsScreenProps {
  groups: SettingGroup[];
  onBack: () => void;
}

const groupLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ct-muted)',
};

function controlStyle(tone: SettingRow['tone']): React.CSSProperties {
  const base: React.CSSProperties = {
    flex: 'none',
    minWidth: 86,
    padding: '9px 12px',
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };
  if (tone === 'on') {
    return {
      ...base,
      background: 'var(--ct-brass)',
      border: '1px solid var(--ct-brass)',
      color: 'var(--ct-bg)',
    };
  }
  if (tone === 'danger') {
    return {
      ...base,
      background: 'transparent',
      border: '1px solid var(--ct-port)',
      color: 'var(--ct-port)',
    };
  }
  return {
    ...base,
    background: 'transparent',
    border: '1px solid var(--ct-line)',
    color: 'var(--ct-muted)',
  };
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ groups, onBack }) => (
  <section className="ct-fade" style={{ padding: '28px 0 0' }}>
    <button className="ct-link" onClick={onBack}>
      &larr; Back
    </button>

    <h1
      style={{
        margin: '16px 0 26px',
        fontFamily: STENCIL,
        fontWeight: 700,
        fontSize: 46,
        lineHeight: 1,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--ct-ink)',
      }}
    >
      Settings
    </h1>

    {groups.map((group) => (
      <div key={group.name} style={{ marginBottom: 30 }}>
        <div style={groupLabel}>{group.name}</div>
        <div className="ct-rule" style={{ margin: '10px 0 0' }} />

        {group.rows.map((row) => (
          <div
            key={row.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 0',
              borderBottom: '1px solid var(--ct-line)',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ct-ink)' }}>
                {row.label}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'var(--ct-muted)',
                  marginTop: 3,
                  maxWidth: '52ch',
                }}
              >
                {row.help}
              </div>
            </div>
            <button style={controlStyle(row.tone)} onClick={row.onActivate}>
              {row.ctrlLabel}
            </button>
          </div>
        ))}
      </div>
    ))}

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
