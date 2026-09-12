import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  background?: string;
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome for every screen that is not Home: cinematic background,
 * scrim, heading, and the body area. Defined once so no screen invents its
 * own layout or navigation.
 */
export function ScreenFrame({ title, subtitle, background, aside, children }: Props) {
  return (
    <section className="screen">
      {background && <div className="screen-bg" style={{ backgroundImage: `url(${background})` }} />}
      <div className="screen-bg-scrim" />

      <header className="screen-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {aside}
      </header>

      <div className="screen-body">{children}</div>
    </section>
  );
}
