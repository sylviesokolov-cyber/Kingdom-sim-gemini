import { useState } from 'react';
import type { NpcDefinition } from '../../types';

const FALLBACK = 'characters/vesper_eclipse.png';

interface Props {
  npc: NpcDefinition;
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Character art with a fallback. Missing art is the single most visible way a
 * gacha game looks broken, so every portrait goes through here rather than a
 * bare <img>.
 */
export function CharacterArt({ npc, alt, className, onClick }: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed ? FALLBACK : (npc.stageUrl ?? npc.portraitUrl);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
