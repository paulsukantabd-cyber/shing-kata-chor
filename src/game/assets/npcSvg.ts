import type { SvgPart } from './characterSvg'

/**
 * Supporting cast artwork.
 *
 * The villager who catches the thief and the village dog are drawn in the same
 * illustration language as the player character.
 */

export function buildVillager(): SvgPart {
  return {
    width: 58,
    height: 108,
    content: `
      <ellipse cx="30" cy="103" rx="24" ry="5" fill="rgba(5,10,8,0.45)"/>
      <path d="M14 58h30l6 44H8Z" fill="#d9d2c0"/>
      <path d="M29 58h15l6 44H29Z" fill="#bdb49e" opacity="0.7"/>
      <path d="M12 66c8 3 22 3 32 0" stroke="#a89e88" stroke-width="1.6" fill="none"/>
      <path d="M13 78c8 3 21 3 31 0" stroke="#a89e88" stroke-width="1.6" fill="none"/>
      <path d="M18 34h22v28H18Z" fill="#7d5a3c"/>
      <path d="M29 34h11v28H29Z" fill="#63462e" opacity="0.55"/>
      <path d="M20 32c6-2 12-2 16 1l3 26c1 6-3 9-8 9s-8-3-8-8Z" fill="#b8543f"/>
      <path d="M21 44c5 1 10 1 14 2l1 6c-5-1-10-2-15-2Z" fill="#efe2c4"/>
      <path d="M38 38c4 1 6 5 6 10l-1 12" stroke="#c08e5e" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M29 8c7 0 12 5 12 12s-5 14-12 14-12-7-12-14 5-12 12-12Z" fill="#c08e5e"/>
      <path d="M29 8c7 0 12 5 12 12s-5 14-12 14V22c0-6 4-9 8-10Z" fill="#a9754a" opacity="0.4"/>
      <path d="M15 12c0-6 6-10 14-10s14 4 14 10c-4 3-9 4-14 4s-10-1-14-4Z" fill="#ece5d2"/>
      <path d="M15 12c4 2 9 3 14 3s10-1 14-3v3c-4 3-9 4-14 4s-10-1-14-4Z" fill="#cdc4ad"/>
      <path d="M29 26c-3-3-8-2-11 1 3 0 5 1 6 2-3 1-5 0-7-1 2 4 7 4 10 2l2 3 2-3c3 2 8 2 10-2-2 1-4 2-7 1 1-1 3-2 6-2-3-3-8-4-11-1Z" fill="#2b1d14"/>
      <ellipse cx="25" cy="20" rx="2.6" ry="3" fill="#f7f2e4"/>
      <ellipse cx="34" cy="20" rx="2.6" ry="3" fill="#f7f2e4"/>
      <circle cx="25.4" cy="20.4" r="1.3" fill="#22160f"/>
      <circle cx="34.4" cy="20.4" r="1.3" fill="#22160f"/>
      <path d="M40 62h9v3h-9z" fill="#6b6a5f"/>
      <path d="M41 65h7v10h-7z" fill="#ffd89b"/>
      <path d="M39.5 75h10v4h-10z" fill="#55564d"/>
      <circle cx="44.5" cy="70" r="12" fill="#ffd89b" opacity="0.16"/>
    `,
  }
}

export function buildDog(): SvgPart {
  return {
    width: 52,
    height: 34,
    content: `
      <ellipse cx="26" cy="31" rx="22" ry="4" fill="rgba(5,10,8,0.4)"/>
      <path d="M10 20c0-5 4-8 10-8h14c6 0 9 3 9 8v6H10Z" fill="#8a5a33"/>
      <path d="M34 12c6 0 9 3 9 8v6H34Z" fill="#6d4526" opacity="0.5"/>
      <path d="M8 16c-3-2-4-6-2-9 2 1 4 3 5 5Z" fill="#6d4526"/>
      <path d="M12 26v5h4v-5M28 26v5h4v-5" fill="#8a5a33"/>
      <path d="M41 16c5 0 8 2 8 6s-3 6-7 6c-3 0-5-2-5-5v-3c0-2 1-4 4-4Z" fill="#9b6739"/>
      <circle cx="46" cy="20" r="1.6" fill="#241812"/>
      <path d="M44 25c2 1 4 1 6 0" stroke="#3a2417" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M18 12c-1-6 2-9 6-9" stroke="#6d4526" stroke-width="4" fill="none" stroke-linecap="round"/>
    `,
  }
}
