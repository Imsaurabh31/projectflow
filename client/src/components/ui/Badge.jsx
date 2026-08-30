import React from 'react';
import { PRIORITY_META, STATUS_META } from '../../utils/helpers';

const Badge = ({ type, value, style = {} }) => {
  let meta = null;
  if (type === 'priority') meta = PRIORITY_META[value];
  if (type === 'status')   meta = STATUS_META[value];
  if (!meta) return <span style={{ fontSize: 12, ...style }}>{value}</span>;

  const dot = type === 'status';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 99,
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.01em',
      color: meta.color, background: meta.bg,
      border: `1px solid ${meta.border || meta.color + '33'}`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      )}
      {meta.label}
    </span>
  );
};

export default Badge;
