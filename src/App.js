import React, { useState } from "react";

const PLAYERS_DEFAULT = [
  { id: 1, name: "Spieler 1" },
  { id: 2, name: "Spieler 2" },
  { id: 3, name: "Spieler 3" },
];

const WEAPON_CATEGORIES = [
  "Shotgun", "Rifle", "Pistol", "Dolch / Melee", "Sparks / Single Shot",
  "Nitro Express", "Crossbow", "Bomblance", "Lemat / Zweifach",
];

const WEAPONS_EXACT = [
  "Romero 77", "Romero Talon", "Rival 78", "Slate", "Caldwell Rival 78 Handcannon",
  "Caldwell Conversion Uppercut", "Mosin-Nagant M1891", "Mosin Obrez",
  "Winfield M1873", "Winfield Centennial", "Winfield M1876 Centennial Shorty",
  "Springfield 1866", "Bornheim No.3", "Krag-Jørgensen", "Lebel 1886",
  "Scottfield Spitfire", "Nagant M1895", "Nagant Silencer", "Caldwell Pax",
  "Caldwell Conversion Chain Pistol", "Scottfield Model 3", "Dolch 96",
  "Bornheim Match", "Bowie Knife", "Kukri", "Combat Axe", "Dusters", "Machete",
  "Sparks LRR", "Sparks Pistol", "Nitro Express Rifle", "Poison Crossbow",
  "Bomblance", "Lemat Mark II",
];

const PLAYSTYLES = [
  "Nur Nahkampf (Melee only)", "Kein Heilen erlaubt", "Nur Pistolen & Messer",
  "Stealth – kein unnötiger Lärm", "Rush – immer vorwärts",
  "Solo-Style im Trio (kein Callout)", "Keine Consumables",
  "Nur Iron Sights (kein Scope)", "Nur Feuer- / Explosivschaden",
  "Hunter sofort looten, egal was", "Kein Rückzug – fight to the death",
  "Erster Kill entscheidet Spielweise neu",
];

const GROUP_CHALLENGES = [
  { name: "Nur Laut", icon: "💥", desc: "Kein Silencer, keine leisen Waffen. Jeder Schuss muss gehört werden. Explosive bevorzugt." },
  { name: "Nur Leise", icon: "🤫", desc: "Ausschließlich Silencer-Waffen, Bögen oder Melee. Kein einziger lauter Schuss – koste es was es wolle." },
  { name: "Hinterhalt", icon: "🕷", desc: "Ihr wählt eine Position und wartet. Niemand verlässt den Bereich bis ein Feindkontakt stattfindet. Geduld ist die Waffe." },
  { name: "Kopf durch die Wand", icon: "🐂", desc: "Direkt zum nächsten Compound, rein, alles plattmachen. Kein Schleichen, kein Umweg. Frontal oder gar nicht." },
  { name: "Letzte Kugel zählt", icon: "🎯", desc: "Jeder darf nur mit dem letzten Schuss in seinem Magazin töten. Nachladen erlaubt – aber der Kill muss der letzte Schuss sein." },
  { name: "Kein HUD", icon: "🙈", desc: "HUD so weit wie möglich ausblenden. Keine Minimap, keine Infos. Nur Augen und Ohren." },
  { name: "Bounty stehlen", icon: "🪙", desc: "Ihr tötet keinen Boss selbst. Wartet bis ein anderes Team ihn erledigt – dann schlagt ihr zu und klaut die Bounty." },
  { name: "Einer führt, alle folgen", icon: "👑", desc: "Ein zufälliger Spieler übernimmt das Kommando. Die anderen dürfen nicht selbst entscheiden – nur auf Befehl handeln." },
  { name: "Kein Compound", icon: "🌿", desc: "Ihr betretet kein Gebäude. Kämpft ausschließlich draußen. Healing und Looten nur außerhalb." },
  { name: "Volle Aggression", icon: "🔥", desc: "Sofort angreifen sobald ein Feind im Sichtfeld ist. Kein Abwarten, kein Flanken planen." },
  { name: "Niemand stirbt allein", icon: "💀", desc: "Wenn ein Spieler stirbt, darf niemand mehr heilen bis das Match vorbei ist." },
  { name: "Doktor-Modus", icon: "🩹", desc: "Jeder muss einen Slot für mindestens ein Heilitem reservieren. Ihr heilt euch gegenseitig – keine Selbstheilung." },
];

// Format: "English Name (Deutscher Name)"
const SKIN_THEMES = [
  {
    id: "voodoo",
    name: "Voodoo / Okkultes",
    icon: "💀",
    skins: [
      "The Bone Doctor (Der Knochendoktor)",
      "Weird Sister (Die seltsame Schwester)",
      "Llorona's Heir (Lloronas Erbin)",
      "The Night Acolyte (Der Nachtakolyt)",
      "The Night Seer (Die Nachtseherin)",
      "The Reaper (Der Sensenmann)",
      "The Revenant (Der Wiedergänger)",
      "Zhong Kui (Zhong Kui)",
      "Dead Blessing (Toter Segen)",
      "Rangda's Shadow (Rangdas Schatten)",
      "Dame of the Dead (Dame der Toten)",
    ],
  },
  {
    id: "jaeger",
    name: "Jäger / Trapper",
    icon: "🦌",
    skins: [
      "The Beast Hunter (Der Bestienjaeger)",
      "The Moorhound (Der Moorspaehund)",
      "The Mountain Man (Der Bergmann)",
      "The Reptilian (Der Reptilienmann)",
      "The Hornback (Der Hornruecken)",
      "The Skinflint (Der Geizhals)",
      "The Scaled Ward (Der Schuppenhüter)",
      "The Scarecrow (Die Vogelscheuche)",
      "Skull Taker (Der Schädelsammler)",
      "The Fang Shearer (Der Fangzahnscheerer)",
    ],
  },
  {
    id: "soldat",
    name: "Soldat / Militär",
    icon: "🎖",
    skins: [
      "Sgt. Bridgewater (Sgt. Bridgewater)",
      "The Turncoat (Der Überläufer)",
      "The Prodigal Son (Der verlorene Sohn)",
      "The Sovereign (Der Souverän)",
      "North Star (Nordstern)",
      "The Headsman (Der Henker)",
      "The Conspirator (Der Verschwörer)",
      "The Mountie (Der Mountie)",
    ],
  },
  {
    id: "banditen",
    name: "Banditen / Outlaws",
    icon: "🤠",
    skins: [
      "The Gunslinger (Die Revolverhelden)",
      "The Kid (Der Junge)",
      "The Rat (Die Ratte)",
      "The Skinned (Der Gehäutete)",
      "The Drowned Rat (Die ertrunkene Ratte)",
      "The Drowned Kid (Der ertrunkene Junge)",
      "The Wayfarer (Der Wanderer)",
      "The Third Son (Der dritte Sohn)",
      "The Black Coat (Der Schwarzmantel)",
    ],
  },
  {
    id: "gesetzeshueter",
    name: "Gesetzeshüter / Lawman",
    icon: "⭐",
    skins: [
      "The Prescient (Die Hellseherin)",
      "The Researcher (Der Forscher)",
      "Private Eye (Das Privatdetektivin)",
      "The Witch Hunter (Der Hexenjäger)",
      "The Mountie (Der Mountie)",
      "Marshall Brewer (Marshall Brewer)",
    ],
  },
  {
    id: "japaner",
    name: "Japaner / Asiatisch",
    icon: "⛩",
    skins: [
      "The Ronin (Der Ronin)",
      "The Miko (Die Miko)",
      "The Exile (Die Verbannte)",
      "The Concubine (Die Konkubine)",
      "Zhong Kui (Zhong Kui)",
      "Dead Blessing (Toter Segen)",
      "Spirit of Nian (Geist des Nian)",
    ],
  },
  {
    id: "indianer",
    name: "Indianer / Native American",
    icon: "🪶",
    skins: [
      "The Spirited (Die Beseelte)",
      "The Wayward Helmsman (Der eigensinnige Steuermann)",
      "Night Owl (Die Nachteule)",
      "Shadow Walker (Der Schattengeher)",
      "Iron Wolf (Der eiserne Wolf)",
      "River Spirit (Der Flussgeist)",
    ],
  },
  {
    id: "mexikaner",
    name: "Mexikaner / Latino",
    icon: "🌵",
    skins: [
      "Llorona's Heir (Lloronas Erbin)",
      "The Rat (Die Ratte)",
      "The Penitent (Der Büßer)",
      "The Reverend (Der Reverend)",
    ],
  },
  {
    id: "seefahrer",
    name: "Seefahrer / Piraten",
    icon: "⚓",
    skins: [
      "The Wayward Helmsman (Der eigensinnige Steuermann)",
      "Thirteenth Mate (Der dreizehnte Maat)",
      "The Phantom (Das Phantom)",
      "The Waldmann (Der Waldmann)",
      "Umpire's Bane (Des Schiedsrichters Fluch)",
    ],
  },
  {
    id: "zirkus",
    name: "Zirkus / Karneval",
    icon: "🎪",
    skins: [
      "Montresor (Montresor)",
      "Fortunato (Fortunato)",
      "Scaramuccia (Scaramuccia)",
      "The Hyena (Die Hyäne)",
      "Umpire's Bane (Des Schiedsrichters Fluch)",
    ],
  },
  {
    id: "clowns",
    name: "Clowns / Masken",
    icon: "🤡",
    skins: [
      "Scaramuccia (Scaramuccia)",
      "Montresor (Montresor)",
      "The Committed – Monroe (Der Eingewiesene – Monroe)",
      "Ghost Face (Geistergesicht)",
      "The Phantom (Das Phantom)",
    ],
  },
  {
    id: "maske",
    name: "Mit Maske",
    icon: "🎭",
    skins: [
      "The Bone Doctor (Der Knochendoktor)",
      "The Reptilian (Der Reptilienmann)",
      "The Headsman (Der Henker)",
      "Ghost Face (Geistergesicht)",
      "Perchta: Dawn (Perchta: Morgengrauen)",
      "Perchta: Dusk (Perchta: Abenddämmerung)",
      "The Plague Doctor (Der Pestdoktor)",
      "The Cowl (Die Kapuze)",
      "Scaramuccia (Scaramuccia)",
      "The Phantom (Das Phantom)",
    ],
  },
  {
    id: "hut",
    name: "Mit Hut",
    icon: "🎩",
    skins: [
      "The Gunslinger (Die Revolverheld)",
      "The Kid (Der Junge)",
      "The Mountain Man (Der Bergmann)",
      "The Reverend (Der Reverend)",
      "The Researcher (Der Forscher)",
      "The Prescient (Die Hellseherin)",
      "Sgt. Bridgewater (Sgt. Bridgewater)",
      "The Wayfarer (Der Wanderer)",
      "The Skinflint (Der Geizhals)",
      "The Black Coat (Der Schwarzmantel)",
      "The Turncoat (Der Überläufer)",
    ],
  },
  {
    id: "frauen",
    name: "Nur Frauen",
    icon: "♀",
    skins: [
      "Weird Sister (Die seltsame Schwester)",
      "Llorona's Heir (Lloronas Erbin)",
      "The Prodigal Daughter (Die verlorene Tochter)",
      "The Miko (Die Miko)",
      "The Night Acolyte (Die Nachtakolythin)",
      "The Bone Mason (Die Knochenmaurerin)",
      "The Concubine (Die Konkubine)",
      "The Exile (Die Verbannte)",
      "The Gunslinger – May Belle (Die Revolverheld – May Belle)",
      "North Star (Nordstern)",
      "Perchta: Dawn (Perchta: Morgengrauen)",
      "Perchta: Dusk (Perchta: Abenddämmerung)",
      "Dame of the Dead (Dame der Toten)",
      "Rangda's Shadow (Rangdas Schatten)",
      "Lilith (Lilith)",
      "Angel of Death (Todesengel)",
    ],
  },
  {
    id: "maenner",
    name: "Nur Männer",
    icon: "♂",
    skins: [
      "The Bone Doctor (Der Knochendoktor)",
      "The Ronin (Der Ronin)",
      "The Reptilian (Der Reptilienmann)",
      "The Beast Hunter (Der Bestienjaeger)",
      "The Mountain Man (Der Bergmann)",
      "The Phantom (Das Phantom)",
      "The Reaper (Der Sensenmann)",
      "The Headsman (Der Henker)",
      "Sgt. Bridgewater (Sgt. Bridgewater)",
      "The Turncoat (Der Überläufer)",
      "The Researcher (Der Forscher)",
      "The Kid (Der Junge)",
      "The Rat (Die Ratte)",
      "The Reverend (Der Reverend)",
      "The Moorhound (Der Moorspaehund)",
      "Zhong Kui (Zhong Kui)",
      "The Sovereign (Der Souverän)",
      "The Scarecrow (Die Vogelscheuche)",
      "The Penitent (Der Büßer)",
      "The Committed – Monroe (Der Eingewiesene – Monroe)",
      "Skull Taker (Der Schädelsammler)",
      "Ghost Face (Geistergesicht)",
      "The Prodigal Son (Der verlorene Sohn)",
    ],
  },
  {
    id: "redneck",
    name: "Redneck / Südstaaten",
    icon: "🪓",
    skins: [
      "The Mountain Man (Der Bergmann)",
      "The Scarecrow (Die Vogelscheuche)",
      "The Skinflint (Der Geizhals)",
      "The Hornback (Der Hornrücken)",
      "The Drowned Kid (Der ertrunkene Junge)",
      "The Drowned Rat (Die ertrunkene Ratte)",
      "The Infected (Der Infizierte)",
      "The Rat (Die Ratte)",
    ],
  },
];

const MODES = [
  { id: "category", label: "Waffenkategorie" },
  { id: "exact", label: "Genaue Waffe" },
  { id: "both", label: "Beides kombiniert" },
];

const SKIN_MODES = [
  { id: "theme", label: "Nach Thema" },
  { id: "exact", label: "Genauer Skin" },
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateChallenge(weaponMode, includePlaystyle) {
  let weapon = null;
  if (weaponMode === "category") weapon = getRandom(WEAPON_CATEGORIES);
  else if (weaponMode === "exact") weapon = getRandom(WEAPONS_EXACT);
  else weapon = `${getRandom(WEAPON_CATEGORIES)} → ${getRandom(WEAPONS_EXACT)}`;
  return { weapon, playstyle: includePlaystyle ? getRandom(PLAYSTYLES) : null };
}

function generateSkin(skinMode, selectedTheme) {
  if (skinMode === "theme") {
    const theme = selectedTheme === "random"
      ? getRandom(SKIN_THEMES)
      : SKIN_THEMES.find(t => t.id === selectedTheme) || getRandom(SKIN_THEMES);
    return { themeName: theme.name, themeIcon: theme.icon, skin: null, themeSkins: theme.skins };
  } else {
    const pool = selectedTheme === "random"
      ? SKIN_THEMES.flatMap(t => t.skins)
      : (SKIN_THEMES.find(t => t.id === selectedTheme)?.skins || SKIN_THEMES.flatMap(t => t.skins));
    return { themeName: null, themeIcon: null, skin: getRandom(pool), themeSkins: null };
  }
}

const Skull = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{opacity:0.7}}>
    <path d="M12 2C7.03 2 3 6.03 3 11c0 3.1 1.53 5.83 3.88 7.5L7 21h10l.12-2.5C19.47 16.83 21 14.1 21 11c0-4.97-4.03-9-9-9zm-2.5 13c-.83 0-1.5-.67-1.5-1.5S8.67 12 9.5 12s1.5.67 1.5 1.5S10.33 15 9.5 15zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const Crosshair = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="7"/>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

const Shield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"/>
  </svg>
);

const btn = (active) => ({
  padding: "7px 16px",
  background: active ? "rgba(180,80,20,0.35)" : "rgba(255,255,255,0.04)",
  border: `1px solid ${active ? "#b45014" : "rgba(180,80,20,0.2)"}`,
  borderRadius: 3, color: active ? "#e8c090" : "#7a6040",
  fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer",
  transition: "all 0.15s", letterSpacing: "0.05em",
  boxShadow: active ? "0 0 10px rgba(180,80,20,0.3)" : "none", whiteSpace: "nowrap",
});

const toggleWrap = (active) => ({
  width: 44, height: 24, borderRadius: 12,
  background: active ? "rgba(180,80,20,0.6)" : "rgba(255,255,255,0.08)",
  border: `1px solid ${active ? "#b45014" : "rgba(180,80,20,0.2)"}`,
  cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0,
});

const toggleDot = (active) => ({
  width: 16, height: 16, borderRadius: "50%",
  background: active ? "#e8c090" : "#5a4030",
  position: "absolute", top: 3, left: active ? 23 : 3,
  transition: "all 0.2s", boxShadow: active ? "0 0 6px rgba(180,80,20,0.6)" : "none",
});

const sectionLabel = { fontSize: 10, letterSpacing: "0.25em", color: "#6a5030", marginBottom: 5, textTransform: "uppercase" };
const configLabel = { fontSize: 11, letterSpacing: "0.2em", color: "#a08060", display: "block", marginBottom: 10, textTransform: "uppercase" };

const TABS = [
  { id: "challenge", label: "⚔ Challenge" },
  { id: "skin", label: "🎭 Skin" },
];

export default function HuntChallengeGenerator() {
  const [tab, setTab] = useState("challenge");
  const [playerCount, setPlayerCount] = useState(3);
  const [players, setPlayers] = useState(PLAYERS_DEFAULT);
  const [weaponMode, setWeaponMode] = useState("category");
  const [includePlaystyle, setIncludePlaystyle] = useState(true);
  const [includeGroup, setIncludeGroup] = useState(true);
  const [challenges, setChallenges] = useState(null);
  const [groupChallenge, setGroupChallenge] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [rollFrame, setRollFrame] = useState(null);
  const [rollGroupFrame, setRollGroupFrame] = useState(null);
  const [skinPlayerCount, setSkinPlayerCount] = useState(3);
  const [skinPlayers, setSkinPlayers] = useState(PLAYERS_DEFAULT);
  const [skinMode, setSkinMode] = useState("theme");
  const [selectedTheme, setSelectedTheme] = useState("random");
  const [skinResults, setSkinResults] = useState(null);
  const [skinRolling, setSkinRolling] = useState(false);
  const [skinRollFrame, setSkinRollFrame] = useState(null);

  const activePlayers = players.slice(0, playerCount);
  const activeSkinPlayers = skinPlayers.slice(0, skinPlayerCount);

  function updateName(idx, name) { setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, name } : p)); }
  function updateSkinName(idx, name) { setSkinPlayers(prev => prev.map((p, i) => i === idx ? { ...p, name } : p)); }

  function roll() {
    setRolling(true); setChallenges(null); setGroupChallenge(null);
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setRollFrame(activePlayers.map(() => generateChallenge(weaponMode, includePlaystyle)));
      if (includeGroup) setRollGroupFrame(getRandom(GROUP_CHALLENGES));
      if (ticks >= 18) {
        clearInterval(interval);
        setChallenges(activePlayers.map(() => generateChallenge(weaponMode, includePlaystyle)));
        if (includeGroup) setGroupChallenge(getRandom(GROUP_CHALLENGES));
        setRollFrame(null); setRollGroupFrame(null); setRolling(false);
      }
    }, 60);
  }

  function rollSkins() {
    setSkinRolling(true); setSkinResults(null);
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setSkinRollFrame(activeSkinPlayers.map(() => generateSkin(skinMode, selectedTheme)));
      if (ticks >= 18) {
        clearInterval(interval);
        setSkinResults(activeSkinPlayers.map(() => generateSkin(skinMode, selectedTheme)));
        setSkinRollFrame(null); setSkinRolling(false);
      }
    }, 60);
  }

  const display = rolling ? rollFrame : challenges;
  const displayGroup = rolling ? rollGroupFrame : groupChallenge;
  const displaySkins = skinRolling ? skinRollFrame : skinResults;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b08", color: "#c9b89a", fontFamily: "'Cinzel', serif",
      backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(180,80,20,0.12) 0%, transparent 60%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.012'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      padding: "0 0 60px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Cinzel+Decorative:wght@700&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet" />

      <div style={{ textAlign: "center", padding: "40px 20px 28px", borderBottom: "1px solid rgba(180,80,20,0.3)", background: "linear-gradient(180deg, rgba(180,80,20,0.08) 0%, transparent 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(180,80,20,0.04) 39px, rgba(180,80,20,0.04) 40px)" }}/>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: "#8a6a40", marginBottom: 8, textTransform: "uppercase", position: "relative" }}>Bayou Brotherhood</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative" }}>
          <div style={{ height: 1, width: 50, background: "linear-gradient(90deg, transparent, #b45014)" }}/>
          <Skull/>
          <h1 style={{ margin: 0, fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(20px, 5vw, 34px)", fontWeight: 700, color: "#e8d5b0", textShadow: "0 0 40px rgba(180,80,20,0.5), 0 2px 4px rgba(0,0,0,0.8)", letterSpacing: "0.04em" }}>Hunt Challenge</h1>
          <Skull/>
          <div style={{ height: 1, width: 50, background: "linear-gradient(90deg, #b45014, transparent)" }}/>
        </div>
        <p style={{ margin: "8px 0 0", fontFamily: "'IM Fell English', serif", fontStyle: "italic", color: "#7a6040", fontSize: 13, position: "relative" }}>Jeder trägt sein Schicksal – zufällig und unerbittlich.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", borderBottom: "1px solid rgba(180,80,20,0.2)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 36px", background: tab === t.id ? "rgba(180,80,20,0.12)" : "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #b45014" : "2px solid transparent", color: tab === t.id ? "#e8c090" : "#5a4020", fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 0" }}>

        {tab === "challenge" && (
          <>
            <div style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 4, padding: "22px 26px", marginBottom: 22, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#8a6a40", marginBottom: 18, textTransform: "uppercase" }}>⚙ Konfiguration</div>
              <div style={{ marginBottom: 18 }}>
                <label style={configLabel}>Anzahl Spieler</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[2,3].map(n => <button key={n} onClick={() => setPlayerCount(n)} style={{ ...btn(playerCount===n), fontSize: 13, padding: "8px 24px" }}>{n} Spieler</button>)}
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={configLabel}>Namen</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {players.slice(0, playerCount).map((p, i) => (
                    <input key={p.id} value={p.name} onChange={e => updateName(i, e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 3, color: "#c9b89a", fontFamily: "'Cinzel', serif", fontSize: 12, padding: "7px 12px", width: 130, outline: "none" }} onFocus={e=>e.target.style.borderColor="#b45014"} onBlur={e=>e.target.style.borderColor="rgba(180,80,20,0.25)"}/>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={configLabel}>Waffenmodus</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MODES.map(m => <button key={m.id} onClick={() => setWeaponMode(m.id)} style={btn(weaponMode===m.id)}>{m.label}</button>)}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[[includePlaystyle, () => setIncludePlaystyle(v=>!v), "Individuelle Spielweise würfeln"], [includeGroup, () => setIncludeGroup(v=>!v), "Gruppenchallenge würfeln"]].map(([active, fn, label], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={fn} style={toggleWrap(active)}><div style={toggleDot(active)}/></button>
                    <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#a08060", textTransform: "uppercase" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <button onClick={roll} disabled={rolling} style={{ padding: "15px 50px", background: rolling ? "rgba(180,80,20,0.2)" : "linear-gradient(180deg, rgba(200,90,20,0.5) 0%, rgba(150,60,10,0.6) 100%)", border: `1px solid ${rolling ? "rgba(180,80,20,0.2)" : "#b45014"}`, borderRadius: 3, color: rolling ? "#6a5030" : "#f0d8a0", fontFamily: "'Cinzel Decorative', serif", fontSize: 14, letterSpacing: "0.12em", cursor: rolling ? "default" : "pointer", transition: "all 0.15s", boxShadow: rolling ? "none" : "0 0 30px rgba(180,80,20,0.35), inset 0 1px 0 rgba(255,255,255,0.1)", textTransform: "uppercase" }}>
                {rolling ? "Schicksal wird gewürfelt..." : "⚔  Challenge würfeln"}
              </button>
            </div>

            {(displayGroup || (rolling && includeGroup)) && (
              <div style={{ background: rolling?"rgba(10,7,4,0.5)":"rgba(180,80,20,0.08)", border: `1px solid ${rolling?"rgba(180,80,20,0.15)":"rgba(180,80,20,0.5)"}`, borderRadius: 4, padding: "18px 24px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 16, boxShadow: rolling?"none":"0 0 40px rgba(180,80,20,0.2)", animation: rolling?"none":"fadeIn 0.5s ease forwards", position: "relative", overflow: "hidden" }}>
                {!rolling && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 0% 50%, rgba(180,80,20,0.08) 0%, transparent 60%)", pointerEvents: "none" }}/>}
                <div style={{ fontSize: 26, flexShrink: 0, opacity: rolling?0.3:1 }}>{displayGroup?.icon || "🎲"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Shield/><div style={{ fontSize: 9, letterSpacing: "0.3em", color: rolling?"#4a3020":"#b45014", textTransform: "uppercase" }}>Gruppenchallenge</div></div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(13px, 3vw, 18px)", color: rolling?"#3a2a14":"#f0d8a0", marginBottom: 5 }}>{displayGroup?.name || "—"}</div>
                  <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: "clamp(11px, 2vw, 13px)", color: rolling?"#3a2a14":"#a09060", lineHeight: 1.5 }}>{displayGroup?.desc || ""}</div>
                </div>
              </div>
            )}

            {display && (
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: playerCount===2?"1fr 1fr":"1fr 1fr 1fr" }}>
                {display.map((ch, i) => (
                  <div key={i} style={{ background: "rgba(10,7,4,0.7)", border: "1px solid rgba(180,80,20,0.35)", borderRadius: 4, padding: "20px 18px", position: "relative", boxShadow: rolling?"none":"0 0 24px rgba(180,80,20,0.15)", animation: rolling?"none":"fadeIn 0.4s ease forwards", opacity: rolling?0.6:1 }}>
                    <div style={{ position: "absolute", top: 7, right: 9, color: "rgba(180,80,20,0.3)", fontSize: 9 }}>✦</div>
                    <div style={{ position: "absolute", bottom: 7, left: 9, color: "rgba(180,80,20,0.3)", fontSize: 9 }}>✦</div>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#b45014", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}><Crosshair/>{activePlayers[i]?.name}</div>
                    <div style={{ marginBottom: ch.playstyle?12:0 }}>
                      <div style={sectionLabel}>🔫 Waffe</div>
                      <div style={{ fontFamily: "'IM Fell English', serif", fontSize: "clamp(13px, 2.5vw, 16px)", color: "#e8d0a0", lineHeight: 1.3 }}>{ch.weapon}</div>
                    </div>
                    {ch.playstyle && <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", paddingTop: 10 }}>
                      <div style={sectionLabel}>🎮 Spielweise</div>
                      <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: "clamp(11px, 2vw, 13px)", color: "#a09060", lineHeight: 1.4 }}>{ch.playstyle}</div>
                    </div>}
                  </div>
                ))}
              </div>
            )}
            {!display && !rolling && <div style={{ textAlign: "center", padding: "36px 20px", color: "#3a2a18", fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 14, border: "1px dashed rgba(180,80,20,0.1)", borderRadius: 4 }}>Drücke den Knopf – das Bayou entscheidet euer Schicksal.</div>}
          </>
        )}

        {tab === "skin" && (
          <>
            <div style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 4, padding: "22px 26px", marginBottom: 22, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#8a6a40", marginBottom: 18, textTransform: "uppercase" }}>⚙ Skin Konfiguration</div>
              <div style={{ marginBottom: 18 }}>
                <label style={configLabel}>Anzahl Spieler</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[2,3].map(n => <button key={n} onClick={() => setSkinPlayerCount(n)} style={{ ...btn(skinPlayerCount===n), fontSize: 13, padding: "8px 24px" }}>{n} Spieler</button>)}
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={configLabel}>Namen</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {skinPlayers.slice(0, skinPlayerCount).map((p, i) => (
                    <input key={p.id} value={p.name} onChange={e => updateSkinName(i, e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 3, color: "#c9b89a", fontFamily: "'Cinzel', serif", fontSize: 12, padding: "7px 12px", width: 130, outline: "none" }} onFocus={e=>e.target.style.borderColor="#b45014"} onBlur={e=>e.target.style.borderColor="rgba(180,80,20,0.25)"}/>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={configLabel}>Modus</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SKIN_MODES.map(m => <button key={m.id} onClick={() => setSkinMode(m.id)} style={btn(skinMode===m.id)}>{m.label}</button>)}
                </div>
              </div>
              <div>
                <label style={configLabel}>Thema einschränken</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setSelectedTheme("random")} style={btn(selectedTheme==="random")}>🎲 Zufall</button>
                  {SKIN_THEMES.map(t => <button key={t.id} onClick={() => setSelectedTheme(t.id)} style={btn(selectedTheme===t.id)}>{t.icon} {t.name}</button>)}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <button onClick={rollSkins} disabled={skinRolling} style={{ padding: "15px 50px", background: skinRolling?"rgba(180,80,20,0.2)":"linear-gradient(180deg, rgba(200,90,20,0.5) 0%, rgba(150,60,10,0.6) 100%)", border: `1px solid ${skinRolling?"rgba(180,80,20,0.2)":"#b45014"}`, borderRadius: 3, color: skinRolling?"#6a5030":"#f0d8a0", fontFamily: "'Cinzel Decorative', serif", fontSize: 14, letterSpacing: "0.12em", cursor: skinRolling?"default":"pointer", transition: "all 0.15s", boxShadow: skinRolling?"none":"0 0 30px rgba(180,80,20,0.35)", textTransform: "uppercase" }}>
                {skinRolling ? "Outfit wird ausgewählt..." : "🎭  Skin würfeln"}
              </button>
            </div>

            {displaySkins && (
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: skinPlayerCount===2?"1fr 1fr":"1fr 1fr 1fr" }}>
                {displaySkins.map((s, i) => (
                  <div key={i} style={{ background: "rgba(10,7,4,0.7)", border: "1px solid rgba(180,80,20,0.35)", borderRadius: 4, padding: "20px 18px", position: "relative", boxShadow: skinRolling?"none":"0 0 24px rgba(180,80,20,0.15)", animation: skinRolling?"none":"fadeIn 0.4s ease forwards", opacity: skinRolling?0.6:1 }}>
                    <div style={{ position: "absolute", top: 7, right: 9, color: "rgba(180,80,20,0.3)", fontSize: 9 }}>✦</div>
                    <div style={{ position: "absolute", bottom: 7, left: 9, color: "rgba(180,80,20,0.3)", fontSize: 9 }}>✦</div>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#b45014", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}><Crosshair/>{activeSkinPlayers[i]?.name}</div>
                    {s.themeName ? (
                      <>
                        <div style={sectionLabel}>🎭 Skin-Thema</div>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{s.themeIcon}</div>
                        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(13px, 2.5vw, 17px)", color: "#f0d8a0", lineHeight: 1.3 }}>{s.themeName}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 11, color: "#6a5030", marginTop: 6 }}>Wähle einen Skin aus dieser Kategorie</div>
                        <div style={{ marginTop: 10, borderTop: "1px solid rgba(180,80,20,0.12)", paddingTop: 8 }}>
                          <div style={sectionLabel}>Beispiele</div>
                          <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 11, color: "#7a6040", lineHeight: 1.7 }}>
                            {(s.themeSkins || []).slice(0, 4).map((name, idx) => (
                              <div key={idx}>{name}</div>
                            ))}
                            {(s.themeSkins || []).length > 4 && <div style={{color:"#5a4030"}}>+{(s.themeSkins||[]).length - 4} weitere...</div>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={sectionLabel}>🎭 Skin</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontSize: "clamp(13px, 2.5vw, 16px)", color: "#e8d0a0", lineHeight: 1.5 }}>{s.skin}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!displaySkins && !skinRolling && <div style={{ textAlign: "center", padding: "36px 20px", color: "#3a2a18", fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 14, border: "1px dashed rgba(180,80,20,0.1)", borderRadius: 4 }}>Würfele und das Bayou bestimmt euer Outfit.</div>}
          </>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } } input::placeholder { color: #4a3820; } * { box-sizing: border-box; }`}</style>
    </div>
  );
}
