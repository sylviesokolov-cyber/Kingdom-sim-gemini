/**
 * Valenreach's own icon set.
 *
 * Original artwork, authored here rather than lifted from another game — the
 * project ships as a PWA, so third-party game assets are not an option.
 *
 * The premium read comes from three things applied uniformly, not from detail
 * in any single glyph: solid silhouettes (never line art) filled with a
 * vertical jewel gradient, a dark outline painted under the fill via
 * `paint-order` in CSS, and a specular gloss shape over the top third.
 * Gradients live in one `<GameIconDefs />` mounted once at the app root; every
 * icon references them by id.
 */

type Tone =
  | 'gold'
  | 'bronze'
  | 'rose'
  | 'crystal'
  | 'jade'
  | 'parchment'
  | 'silver'
  | 'wine';

interface IconProps {
  size?: number;
  tone?: Tone;
  className?: string;
}

const RAMPS: Record<Tone, [string, string, string]> = {
  gold: ['#fbf0c4', '#e3c15a', '#8f6f16'],
  bronze: ['#f0dcae', '#c39a4e', '#5c4315'],
  rose: ['#ffdbe6', '#e05780', '#7d1f38'],
  crystal: ['#e2f9ff', '#7fd4e8', '#256b80'],
  jade: ['#d2f4dd', '#4f9d69', '#1e4a34'],
  parchment: ['#fbf6ec', '#d9cbb0', '#7d7060'],
  silver: ['#ffffff', '#cdd7e3', '#5f6a79'],
  wine: ['#f0a0b4', '#a3294a', '#3a0d1b'],
};

/** Mount once, at the app root. Every icon's fill resolves against these. */
export function GameIconDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {(Object.keys(RAMPS) as Tone[]).map((tone) => {
          const [light, mid, deep] = RAMPS[tone];
          return (
            <linearGradient key={tone} id={`gi-${tone}`} x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0%" stopColor={light} />
              <stop offset="42%" stopColor={mid} />
              <stop offset="100%" stopColor={deep} />
            </linearGradient>
          );
        })}
        <linearGradient id="gi-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Glyph({
  size = 20,
  tone = 'gold',
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={`gicon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`url(#gi-${tone})`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Specular sheen laid over the upper third of a glyph. */
function Gloss({ d }: { d: string }) {
  return <path d={d} fill="url(#gi-gloss)" className="gicon-gloss" />;
}

/* ------------------------------------------------------------------ *
 * Generated geometry — cleaner than hand-written path data for shapes
 * defined by rotation.
 * ------------------------------------------------------------------ */

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function ring(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;
}

function gearPath(teeth: number, rOuter: number, rInner: number): string {
  const step = 360 / teeth;
  const pts: [number, number][] = [];
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    pts.push(polar(12, 12, rOuter, a - step * 0.19));
    pts.push(polar(12, 12, rOuter, a + step * 0.19));
    pts.push(polar(12, 12, rInner, a + step * 0.31));
    pts.push(polar(12, 12, rInner, a + step * 0.69));
  }
  return `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
}

function spokes(count: number, len: number, halfWidth: number): string {
  let d = '';
  for (let i = 0; i < count; i += 1) {
    const a = (i * 360) / count;
    const [x1, y1] = polar(12, 12, len, a);
    const [x2, y2] = polar(12, 12, len, a + 180);
    const nx = halfWidth * Math.cos(((a - 90) * Math.PI) / 180 + Math.PI / 2);
    const ny = halfWidth * Math.sin(((a - 90) * Math.PI) / 180 + Math.PI / 2);
    d += `M${(x1 + nx).toFixed(2)} ${(y1 + ny).toFixed(2)}L${(x2 + nx).toFixed(2)} ${(y2 + ny).toFixed(2)}L${(x2 - nx).toFixed(2)} ${(y2 - ny).toFixed(2)}L${(x1 - nx).toFixed(2)} ${(y1 - ny).toFixed(2)}Z`;
  }
  return d;
}

/* ------------------------------------------------------------------ *
 * Currency and resource
 * ------------------------------------------------------------------ */

/** Struck coin — milled rim, crown device. */
export function IconCoin(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d={ring(12, 12, 10)} />
      <path d={`${ring(12, 12, 8.4)}${ring(12, 12, 7.2)}`} fillRule="evenodd" opacity="0.45" />
      <path d="M7.6 14.6 6.6 8.9l3 2.6L12 7.4l2.4 4.1 3-2.6-1 5.7Z" opacity="0.85" />
      <Gloss d="M12 2.6a9.4 9.4 0 0 1 8 4.4c-2-2-4.7-3.1-8-3.1S6 5 4 7a9.4 9.4 0 0 1 8-4.4Z" />
    </Glyph>
  );
}

/** Brilliant-cut fate crystal. */
export function IconGem(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 2.2 3.6 8.6 12 21.8l8.4-13.2Z" />
      <path
        d="M3.6 8.6h16.8M8.3 8.6 12 2.2l3.7 6.4M8.3 8.6 12 21.8l3.7-13.2"
        fill="none"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth="0.9"
      />
      <Gloss d="M12 2.2 8.3 8.6h7.4Z" />
    </Glyph>
  );
}

/** Bond heart. */
export function IconHeart(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 21.3c-.4 0-7.6-4.6-9.5-9.3C1 8.1 3 4.3 6.5 4.3c2.1 0 3.8 1.1 5.5 3.4 1.7-2.3 3.4-3.4 5.5-3.4 3.5 0 5.5 3.8 4 7.7-1.9 4.7-9.1 9.3-9.5 9.3Z" />
      <Gloss d="M6.5 5.6c1.6 0 3 .8 4.4 2.6-1.5 1-2.6 2.3-3.2 3.8-1.6-.6-2.7-1.9-2.9-3.5-.1-1.6.6-2.9 1.7-2.9Z" />
    </Glyph>
  );
}

/** Guild writ under wax. */
export function IconScroll(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M5.6 5.2h12.8v13.6H5.6z" opacity="0.92" />
      <path d="M3.9 2.4h16.2a1.8 1.8 0 0 1 0 3.6H3.9a1.8 1.8 0 0 1 0-3.6ZM3.9 18h16.2a1.8 1.8 0 0 1 0 3.6H3.9a1.8 1.8 0 0 1 0-3.6Z" />
      <path
        d="M8 8.6h8M8 11.1h8M8 13.6h4.4"
        fill="none"
        stroke="rgba(0,0,0,0.42)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="16.4" cy="15.1" r="2.9" fill="url(#gi-wine)" />
      <Gloss d="M3.9 2.4h16.2a1.8 1.8 0 0 1 1.6 1H2.3a1.8 1.8 0 0 1 1.6-1Z" />
    </Glyph>
  );
}

/** Vigour. */
export function IconBolt(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M13.9 1.8 4.6 13.6h5.2l-.7 8.6 9.3-12.1h-5.3Z" />
      <Gloss d="M13.9 1.8 9.6 7.3l1.9.6 3.2-4.5Z" />
    </Glyph>
  );
}

/* ------------------------------------------------------------------ *
 * Rank and estate
 * ------------------------------------------------------------------ */

export function IconCrown(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M2.6 17.4 4.4 6.2l4.3 4.6L12 3.4l3.3 7.4 4.3-4.6 1.8 11.2Z" />
      <path d="M3.4 18.8h17.2v2.6H3.4z" />
      <circle cx="12" cy="14.6" r="1.25" fill="rgba(255,255,255,0.55)" />
      <Gloss d="M4.4 6.2 6 10.5l2.7-.4Z" />
    </Glyph>
  );
}

/** Crested great helm — the player's own sheet. */
export function IconHelm(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 2.2c-4.4 0-7.1 2.8-7.1 7.1v5.3c0 3.2 1.5 5.7 3.6 7.2h7c2.1-1.5 3.6-4 3.6-7.2V9.3c0-4.3-2.7-7.1-7.1-7.1Z" />
      <path d="M5.6 7.6h12.8v2.9H5.6zM10.8 10.5h2.4v5.6h-2.4z" fill="rgba(0,0,0,0.62)" />
      <path d="M6.2 13.1h3.3v1.4H6.2zM6.2 15.9h3.3v1.4H6.2zM14.5 13.1h3.3v1.4h-3.3zM14.5 15.9h3.3v1.4h-3.3z" fill="rgba(0,0,0,0.38)" />
      <Gloss d="M12 3.4c2.4 0 4.2.9 5.4 2.7-1.6-1.1-3.4-1.6-5.4-1.6s-3.8.5-5.4 1.6C7.8 4.3 9.6 3.4 12 3.4Z" />
    </Glyph>
  );
}

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

/** Keep and curtain wall. */
export function IconCastle(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M2.4 21.4V9.6h1.9V6.9h1.9v2.7h1.9V6.2h1.6V2.6h1.7v3.6h1.2V2.6h1.7v3.6h1.6v3.4h1.9V6.9h1.9v2.7h1.9v11.8Z" />
      <path d="M10.4 15.2h3.2v6.2h-3.2z" fill="rgba(0,0,0,0.55)" />
      <path d="M6 12.4h2.4v2.4H6zM15.6 12.4H18v2.4h-2.4z" fill="rgba(0,0,0,0.45)" />
      <Gloss d="M2.4 9.6h19.2v1.4H2.4z" />
    </Glyph>
  );
}

/** Folded campaign map, with a marked seat. */
export function IconMap(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M1.6 5.1 8.4 2.4l7.2 2.7 6.8-2.7v16.5l-6.8 2.7-7.2-2.7-6.8 2.7Z" />
      <path
        d="M8.4 2.4v16.5M15.6 5.1v16.5"
        fill="none"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="1.1"
      />
      <path
        d="M4.4 15.6c2-2.6 4.2-2.6 6.2-.9s4.1 1.4 6.1-1.4"
        fill="none"
        stroke="rgba(0,0,0,0.42)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeDasharray="1.6 1.6"
      />
      <circle cx="17.9" cy="8.4" r="1.8" fill="url(#gi-wine)" />
      <Gloss d="M1.6 5.1 8.4 2.4l7.2 2.7 6.8-2.7v1.6l-6.8 2.7-7.2-2.7-6.8 2.7Z" />
    </Glyph>
  );
}

const HEART_D =
  'M12 21.3c-.4 0-7.6-4.6-9.5-9.3C1 8.1 3 4.3 6.5 4.3c2.1 0 3.8 1.1 5.5 3.4 1.7-2.3 3.4-3.4 5.5-3.4 3.5 0 5.5 3.8 4 7.7-1.9 4.7-9.1 9.3-9.5 9.3Z';

/** Twin hearts — bonds. Two copies of the one heart, so they read as a pair. */
export function IconBonds(p: IconProps) {
  return (
    <Glyph {...p}>
      <g transform="translate(11.3 0.6) scale(0.52)" opacity="0.82">
        <path d={HEART_D} strokeWidth={0.75 / 0.52} />
      </g>
      <g transform="translate(0.3 4.2) scale(0.72)">
        <path d={HEART_D} strokeWidth={0.75 / 0.72} />
      </g>
      <Gloss d="M4.6 8.4c1.2 0 2.2.6 3.2 1.9-1.1.7-1.9 1.7-2.4 2.8-1.1-.5-1.9-1.4-2-2.5-.1-1.3.4-2.2 1.2-2.2Z" />
    </Glyph>
  );
}

/** One sword, upright — rotated into a pair below. */
const SWORD = (
  <>
    <path d="M12 1.1 14.2 5v8.1H9.8V5Z" />
    <path d="M6.9 13.4h10.2v2.3H6.9Z" />
    <path d="M10.8 15.7h2.4v3.6h-2.4Z" />
    <circle cx="12" cy="20.6" r="1.9" />
  </>
);

/** Crossed blades. */
export function IconSwords(p: IconProps) {
  return (
    <Glyph {...p}>
      <g transform="rotate(38 12 12)" opacity="0.88">{SWORD}</g>
      <g transform="rotate(-38 12 12)">{SWORD}</g>
    </Glyph>
  );
}

/** Merchant's purse. */
export function IconPouch(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M9.3 2.4h5.4l-.5 3.4H9.8Z" opacity="0.85" />
      <path d="M8.2 5.6h7.6v2.1H8.2Z" opacity="0.95" />
      <path d="M9 7.9h6C18 9.9 21 13 21 15.9c0 3.4-4 5.7-9 5.7s-9-2.3-9-5.7C3 13 6 9.9 9 7.9Z" />
      <circle cx="12" cy="15.2" r="3.1" fill="rgba(0,0,0,0.45)" />
      <circle cx="12" cy="15.2" r="2.1" fill="rgba(255,240,190,0.55)" />
      <Gloss d="M9 7.9h6c.6.4 1.4 1 2.1 1.8-1.5-.6-3.2-.9-5.1-.9s-3.6.3-5.1.9c.7-.8 1.5-1.4 2.1-1.8Z" />
    </Glyph>
  );
}

/** Scales of the council. */
export function IconScales(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M11.1 3.4h1.8v16.2h-1.8z" />
      <path d="M3.6 5.9h16.8v1.7H3.6z" />
      <circle cx="12" cy="3.6" r="1.7" />
      <path d="M7.4 20.1h9.2v1.7H7.4z" />
      <path d="M1.9 12.4 5.1 7.6l3.2 4.8c0 1.7-1.4 2.9-3.2 2.9s-3.2-1.2-3.2-2.9ZM15.7 12.4l3.2-4.8 3.2 4.8c0 1.7-1.4 2.9-3.2 2.9s-3.2-1.2-3.2-2.9Z" opacity="0.9" />
      <Gloss d="M3.6 5.9h16.8v.7H3.6z" />
    </Glyph>
  );
}

/** Summoning sigil. */
export function IconSparkle(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 1.4c1.1 5.6 4 8.4 9.6 9.5-5.6 1.1-8.5 4-9.6 9.6-1.1-5.6-4-8.5-9.6-9.6 5.6-1.1 8.5-3.9 9.6-9.5Z" />
      <path d="M19.2 15.6c.4 2.2 1.5 3.3 3.7 3.7-2.2.4-3.3 1.5-3.7 3.7-.4-2.2-1.5-3.3-3.7-3.7 2.2-.4 3.3-1.5 3.7-3.7Z" opacity="0.85" />
      <Gloss d="M12 1.4c.6 2.9 1.8 5 3.7 6.5-2-1-4.2-1-6.2-.4C10.7 6 11.6 4 12 1.4Z" />
    </Glyph>
  );
}

/** Traveller's satchel. */
export function IconSatchel(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M8.1 2.6h7.8v2.1H8.1z" opacity="0.8" />
      <path d="M4.1 6.4h15.8a1.6 1.6 0 0 1 1.6 1.8l-1.4 11.6a2 2 0 0 1-2 1.7H5.9a2 2 0 0 1-2-1.7L2.5 8.2a1.6 1.6 0 0 1 1.6-1.8Z" />
      <path d="M2.9 10.6h18.2v3.2H2.9z" fill="rgba(0,0,0,0.4)" />
      <path d="M10.6 10.2h2.8v4h-2.8z" fill="rgba(255,255,255,0.35)" />
      <Gloss d="M4.1 6.4h15.8a1.6 1.6 0 0 1 1.5 1.1H2.6a1.6 1.6 0 0 1 1.5-1.1Z" />
    </Glyph>
  );
}

/* ------------------------------------------------------------------ *
 * Chrome and utility
 * ------------------------------------------------------------------ */

export function IconGear(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d={`${gearPath(9, 10.6, 8)}${ring(12, 12, 3.6)}`} fillRule="evenodd" />
      <Gloss d="M12 1.4a10.6 10.6 0 0 1 7.5 3.1A10.6 10.6 0 0 0 12 3.1 10.6 10.6 0 0 0 4.5 4.5 10.6 10.6 0 0 1 12 1.4Z" />
    </Glyph>
  );
}

export function IconMail(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M2.6 5.2h18.8a1.4 1.4 0 0 1 1.4 1.4v10.8a1.4 1.4 0 0 1-1.4 1.4H2.6a1.4 1.4 0 0 1-1.4-1.4V6.6a1.4 1.4 0 0 1 1.4-1.4Z" />
      <path
        d="m1.9 6.4 10.1 6.8 10.1-6.8"
        fill="none"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="14.2" r="2.8" fill="url(#gi-wine)" />
      <Gloss d="M2.6 5.2h18.8a1.4 1.4 0 0 1 1.2.7H1.4a1.4 1.4 0 0 1 1.2-.7Z" />
    </Glyph>
  );
}

export function IconBell(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 1.9a1.6 1.6 0 0 1 1.6 1.6v.7a6.6 6.6 0 0 1 5 6.4v3.6l2 3.4H3.4l2-3.4v-3.6a6.6 6.6 0 0 1 5-6.4v-.7A1.6 1.6 0 0 1 12 1.9Z" />
      <path d="M9.4 19.1h5.2a2.6 2.6 0 0 1-5.2 0Z" />
      <Gloss d="M12 4.2c1 0 2 .2 2.8.6-.9-.2-1.8-.3-2.8-.3s-1.9.1-2.8.3c.8-.4 1.8-.6 2.8-.6Z" />
    </Glyph>
  );
}

export function IconSun(p: IconProps) {
  return (
    <Glyph {...p}>
      <circle cx="12" cy="12" r="5.4" />
      <path d={spokes(4, 10.8, 0.85)} />
      <path d={spokes(4, 9.6, 0.7)} transform="rotate(45 12 12)" opacity="0.8" />
      <Gloss d="M12 7.2a4.8 4.8 0 0 1 3.4 1.4 4.8 4.8 0 0 0-6.8 0A4.8 4.8 0 0 1 12 7.2Z" />
    </Glyph>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M20.6 15.1A8.9 8.9 0 0 1 8.9 3.4a8.9 8.9 0 1 0 11.7 11.7Z" />
      <Gloss d="M8.9 3.4a8.9 8.9 0 0 0-5.4 5.1 8.9 8.9 0 0 1 6.6-3.7Z" />
    </Glyph>
  );
}

export function IconCloudRain(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M7.2 15.4a4.6 4.6 0 0 1-.6-9.1 6.2 6.2 0 0 1 11.7 1.5 3.9 3.9 0 0 1-.5 7.6Z" />
      <path d="M7.9 17.2 6.4 21.6l3-2.6ZM12.4 17.2l-1.5 4.4 3-2.6ZM16.9 17.2l-1.5 4.4 3-2.6Z" opacity="0.9" />
      <Gloss d="M11.6 3.4a6.2 6.2 0 0 1 5 2.6 6.2 6.2 0 0 0-8.7.6 6.2 6.2 0 0 1 3.7-3.2Z" />
    </Glyph>
  );
}

export function IconSnowflake(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d={spokes(3, 10.4, 0.95)} />
      <path d={spokes(3, 5.6, 0.85)} transform="rotate(30 12 12) translate(0 -5.2)" opacity="0.85" />
      <path d={spokes(3, 5.6, 0.85)} transform="rotate(30 12 12) translate(0 5.2)" opacity="0.85" />
      <circle cx="12" cy="12" r="1.9" />
    </Glyph>
  );
}

/** Sun breaking the horizon — advance the day. */
export function IconSunrise(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M6.4 15.4a5.6 5.6 0 0 1 11.2 0Z" />
      <path d="M1.9 16.9h20.2v1.9H1.9zM4.9 20.1h14.2v1.7H4.9z" opacity="0.85" />
      <path d="M11.1 1.4h1.8v4.2h-1.8zM3.1 5.1 4.4 3.8l3 3-1.3 1.3ZM19.6 3.8l1.3 1.3-3 3-1.3-1.3Z" />
      <Gloss d="M12 9.8a5.6 5.6 0 0 1 4 1.7 5.6 5.6 0 0 0-8 0 5.6 5.6 0 0 1 4-1.7Z" />
    </Glyph>
  );
}
