import React, { useState, useEffect } from "react";

const PLAYERS_DEFAULT = [
  { id: 1, name: "Spieler 1" },
  { id: 2, name: "Spieler 2" },
  { id: 3, name: "Spieler 3" },
];

// Waffen nach Update 2.8: Grösse 1–5 (= Ausrüstungspunkte), zwei Waffen dürfen zusammen max. 5 kosten (6 mit Quartermaster)
const WEAPON_DATA = {
  "Kompakt": "Infantry 73L|4,Marathon|4,Ranger 73|4,Frontier 73C|3,Lemat Carbine|3,Officer Carbine|3,Bornheim No.3 Match|2,Nagant M1895 Precision|2,Vandal 73C|2,Bornheim No. 3|1,Conversion|1,LeMat|1,Nagant M1895|1,New Army|1,Officer|1",
  "Mittel": "Maynard Sniper Silencer|5,Centennial|4,Drilling|4,Maynard Sniper|4,Springfield 1866|4,Vetterli 71 Cyclone|4,1865 Carbine|3,Vetterli 71|3,Centennial Shorty|2,Drilling Shorty|2,Scottfield Precision|2,Springfield 1866 Shorty|2,Pax|1,Scottfield|1",
  "Lang": "Mako 1895|4,Martini-Henry|4,Sparks|4,1890 Cavalry|3,Uppercut Precision|3,Haymaker|2,Uppercut|2,Sparks Pistol|1",
  "Spezial-Lang": "Krag|4,Lebel 1886|4,Mosin-Nagant|4,Berthier 1892|3,Mosin Obrez Match|3,Mosin Obrez|2",
  "Schrot": "Auto-5|5,Rival 78|4,Romero 77|4,Slate|4,Specter 1882|4,Terminus|4,Auto-4 Shorty|3,Burgess|3,Rival 78 Shorty|2,Romero 77 Shorty|2,Specter 1882 Shorty|2,Terminus Shorty|2",
  "Spezial": "Nitro Express|5,Crossbow|4,Bomb Lance|3,Dolch 96 Precision|3,Hunting Bow|3,Bomb Launcher|2,Chu Ko Nu|2,Dolch 96|2,Hand Crossbow|1",
  "Nahkampf": "Combat Axe|2,Katana|2,Railroad Hammer|2,Baseball Bat|1,Cavalry Saber|1,Machete|1",
};
const DE_W = {
  "Lemat Carbine": "LeMat Karabiner", "Officer Carbine": "Offizierskarabiner", "Nagant M1895 Precision": "Nagant M1895 Präzision",
  "Vandal 73C": "Vandale 73C", "Bornheim No. 3": "Bornheim Nr. 3", "New Army": "Neue Armee", "Officer": "Offizier",
  "Maynard Sniper Silencer": "Maynard-Scharfschütze Schalldämpfer", "Centennial": "Zentenarium", "Maynard Sniper": "Maynard-Scharfschütze",
  "Vetterli 71 Cyclone": "Vetterli 71 Zyklon", "1865 Carbine": "1865 Karabiner", "Centennial Shorty": "Zentenarium Mini",
  "Drilling Shorty": "Drilling Mini", "Scottfield Precision": "Scottfield Präzision", "Springfield 1866 Shorty": "Springfield 1866 Mini",
  "Uppercut Precision": "Uppercut Präzision", "Haymaker": "Schwinger", "Sparks Pistol": "Sparks Pistole", "Slate": "Neuanfang",
  "Auto-4 Shorty": "Auto-4 Mini", "Rival 78 Shorty": "Rival 78 Mini", "Romero 77 Shorty": "Romero 77 Mini",
  "Specter 1882 Shorty": "Specter 1882 Mini", "Terminus Shorty": "Terminus Mini", "Crossbow": "Armbrust", "Bomb Lance": "Sprenglanze",
  "Dolch 96 Precision": "Dolch 96 Präzision", "Hunting Bow": "Jagdbogen", "Bomb Launcher": "Bombenwerfer", "Hand Crossbow": "Handarmbrust",
  "Combat Axe": "Kampfaxt", "Railroad Hammer": "Schienenhammer", "Baseball Bat": "Baseballschläger", "Cavalry Saber": "Kavalleriesäbel",
};
const WEAPON_CATEGORIES = Object.keys(WEAPON_DATA);
const WEAPONS = WEAPON_CATEGORIES.flatMap(a => WEAPON_DATA[a].split(",").map(x => { const p = x.split("|"); return { n: DE_W[p[0]] ? `${DE_W[p[0]]} (${p[0]})` : p[0], s: +p[1], a }; }));
const WEAPONS_EXACT = WEAPONS.map(w => w.n);

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

// ── TRAITS mit Punktekosten ──────────────────────────────────────────────────
const TRAITS = [
  ["Adrenaline", "Adrenalin", 1, "Kleiner Ausdauerschub bei kritischer Gesundheit"],
  ["Assailant", "Attentäter", 1, "Besserer Nahkampf mit Wurfmessern und -äxten"],
  ["Blade Seer", "Klingenseher", 1, "Pfeile, Bolzen und Wurfwaffen in Dark Sight sichtbar"],
  ["Dauntless", "Unerschrocken", 1, "Geworfene Sprengstoffe lassen sich entschärfen"],
  ["Decoy Supply", "", 1, "Köder an Munitionskisten auffüllen"],
  ["Kiteskin", "Fallschirm", 1, "Deutlich weniger Fallschaden"],
  ["Magpie", "", 1, "Kopfgeld-Token gibt Gegengift, Ausdauer und Regeneration"],
  ["Poacher", "", 1, "Fallen leise legen und entschärfen"],
  ["Poison Sense", "Giftsinn", 1, "Vergiftete Hunter in Dark Sight sichtbar"],
  ["Vigilant", "", 1, "Fallen und Käfer in Dark Sight hervorgehoben"],
  ["Whispersmith", "Flüsterschmied", 1, "Leiseres Wechseln der Ausrüstung"],
  ["Bulwark", "Bollwerk", 2, "50 % weniger Explosions- und Sprenglanzen-Schaden"],
  ["Martialist", "Martialisch", 2, "Katana einstecken für starken ersten Schlag"],
  ["Salveskin", "Feuerfest", 2, "Weniger Feuerschaden"],
  ["Scopesmith", "Visier-Virtuose", 2, "Nach dem Schuss im Zielfernrohr bleiben"],
  ["Steady Aim", "Ruhiger Atem", 2, "Weniger Waffenzittern im Zielfernrohr"],
  ["Vulture", "", 2, "Looten von Huntern gibt immer Geld"],
  ["Greyhound", "Windhund", 2, "Länger mit voller Geschwindigkeit sprinten"],
  ["Mithridatist", "Mithridatisation", 2, "Viel schnellere Erholung von Gift"],
  ["Ambidextrous", "Beidhändig", 3, "Schnelleres Nachladen bei Waffenpaaren"],
  ["Bloodless", "Blutarm", 3, "Blutung wird nicht schlimmer"],
  ["Bolt Thrower", "Bolzenwerfer", 3, "Schnelleres Armbrust-Nachladen"],
  ["Gator Legs", "Alligatorbeine", 3, "Schneller im tiefen Wasser"],
  ["Ghoul", "Guhl", 3, "Monster töten heilt ein wenig"],
  ["Hornskin", "Dickes Fell", 3, "25 % weniger Schaden durch stumpfen Nahkampf"],
  ["Hundred Hands", "Hundert Hände", 3, "Mehr Bogenschaden, Pfeile im Nahkampf nutzbar"],
  ["Iron Eye", "Eisernes Auge", 3, "Zwischen Schüssen im Visier bleiben (Repetierer)"],
  ["Resilience", "Widerstandskraft", 3, "Wiederbelebt mit voller Gesundheit"],
  ["Vigor", "Lebenskraft", 3, "Doppelte Regeneration in Dark Sight"],
  ["Beastface", "Tiermaske", 4, "Tiere reagieren erst aus kürzerer Distanz"],
  ["Bulletgrubber", "Kugelfänger", 4, "Beim Teilladen die Patrone behalten"],
  ["Determination", "", 4, "Ausdauer erholt sich früher"],
  ["Fast Fingers", "Flinke Finger", 4, "Schnelleres Nachladen bei Einzelschussgewehren"],
  ["Packmule", "Packesel", 4, "Zusätzliches Werkzeug oder Verbrauchsgut beim Looten"],
  ["Pitcher", "Weitwerfer", 4, "Grössere Wurfweite"],
  ["Serpent", "Schlange", 4, "Clues und Rifts aus der Distanz in Dark Sight nutzen"],
  ["Silent Killer", "Stiller Killer", 4, "Leisere Nahkampfangriffe"],
  ["Conduit", "", 5, "Gesundheit und Ausdauer bei Clue oder geschlossenem Rift"],
  ["Lightfoot", "Leichtfüssig", 5, "Lautlos springen, fallen und klettern"],
  ["Physician", "Notarzt", 5, "Schnelleres Verbinden"],
  ["Witness", "Zeuge", 5, "Tote Hunter und Monster in Dark Sight sehen"],
  ["Frontiersman", "", 6, "Werkzeuge einmal öfter nutzbar"],
  ["Levering", "Hebelwirkung", 7, "Schnelleres Hüftfeuer bei Hebelwaffen"],
  ["Quartermaster", "Quartiermeister", 8, "+1 Waffenkapazität (6 statt 5 Ausrüstungspunkte)"],
  ["Fanning", "Fächern", 8, "Schnellfeuer mit einhändigen Single-Action-Pistolen"],
  ["Doctor", "Doktor", 9, "Verbandskästen heilen doppelt"],
].map(([name, de, cost, desc]) => ({ name, de, cost, desc }));

// ── ALLE LEGENDARY HUNTER SKINS ─────────────────────────────────────────────
// Format: "English Name (Deutscher Name)"
const ALL_SKINS = [
  "Angel of Death (Todesengel)",
  "Billy Story (Billy Story)",
  "Brood (Brood)",
  "Cain (Kain)",
  "Dame of the Dead (Dame der Toten)",
  "Dead Blessing (Toter Segen)",
  "Ghost Face (Geistergesicht)",
  "Head Taker (Der Kopfabnehmer)",
  "Hex Breaker (Der Fluchbrecher)",
  "Kill Buyer (Der Kopfgeldjäger)",
  "Lilith (Lilith)",
  "Llorona's Heir (Lloronas Erbin)",
  "Lonely Howl (Einsames Heulen)",
  "Luz Mala (Das böse Licht)",
  "Monroe (Monroe – Der Eingewiesene)",
  "Montresor (Montresor)",
  "Mountie (Der Mountie)",
  "North Star (Nordstern)",
  "Perchta: Dawn (Perchta: Morgengrauen)",
  "Perchta: Dusk (Perchta: Abenddämmerung)",
  "Plains Warden (Der Präriewächter)",
  "Rangda's Shadow (Rangdas Schatten)",
  "Scaramuccia (Scaramuccia)",
  "Scourge: Midian (Geißel: Midian)",
  "Scourge: Morrigan (Geißel: Morrigan)",
  "Sgt. Bridgewater (Sgt. Bridgewater)",
  "Silver Spur (Der Silbersporn)",
  "Skull Taker (Der Schädelsammler)",
  "Sofia (Sofia)",
  "Teche Wraith (Das Teche-Gespenst)",
  "The Archaeologist (Der Archäologe)",
  "The Beast Hunter (Der Bestienjaeger)",
  "The Bone Doctor (Der Knochendoktor)",
  "The Bone Mason (Die Knochenmaurerin)",
  "The Concubine (Die Konkubine)",
  "The Conspirator (Der Verschwörer)",
  "The Cowl (Die Kapuze)",
  "The Exile (Die Verbannte)",
  "The Fang Shearer (Der Fangzahnscheerer)",
  "The Gunslinger (Die Revolverheld – May Belle)",
  "The Headsman (Der Henker)",
  "The Hornback (Der Hornrücken)",
  "The Hyena (Die Hyäne)",
  "The Infected (Der Infizierte)",
  "The Kid (Der Junge)",
  "The Miko (Die Miko)",
  "The Moorhound (Der Moorhund)",
  "The Mountain Man (Der Bergmann)",
  "The Night Acolyte (Die Nachtakolythin)",
  "The Night Seer (Die Nachtseherin)",
  "The Penitent (Der Büßer)",
  "The Phantom (Das Phantom)",
  "The Plague Doctor (Der Pestdoktor)",
  "The Prescient (Die Hellseherin)",
  "The Prodigal Daughter (Die verlorene Tochter)",
  "The Prodigal Son (Der verlorene Sohn)",
  "The Rat (Die Ratte)",
  "The Reaper (Der Sensenmann)",
  "The Reptilian (Der Reptilienmann)",
  "The Researcher (Der Forscher)",
  "The Revenant (Der Wiedergänger)",
  "The Ronin (Der Ronin)",
  "The Scaled Ward (Der Schuppenhüter)",
  "The Scarecrow (Die Vogelscheuche)",
  "The Skinflint (Der Geizhals)",
  "The Sovereign (Der Souverän)",
  "The Spirited (Die Beseelte)",
  "The Turncoat (Der Überläufer)",
  "The Waldmann (Der Waldmann)",
  "The Wayward Helmsman (Der eigensinnige Steuermann)",
  "The Witch Hunter (Der Hexenjäger)",
  "Thirteenth Mate (Der dreizehnte Maat)",
  "Trapper: Buckshot (Trapper: Schrot)",
  "Trapper: Snare (Trapper: Falle)",
  "Umpire's Bane (Des Schiedsrichters Fluch)",
  "Weird Sister (Die seltsame Schwester)",
  "Zhong Kui (Zhong Kui)",
  "Dead Blessing (Toter Segen)",
  "Llu (Llu)",
  "Spirit of Nian (Geist des Nian)",
];

// ── SKIN KATEGORIEN ──────────────────────────────────────────────────────────
const SKIN_THEMES = [
  { id: "all", name: "Alle Skins", icon: "🎲", skins: ALL_SKINS },
  {
    id: "voodoo", name: "Voodoo / Okkultes", icon: "💀",
    skins: ["The Bone Doctor (Der Knochendoktor)","Weird Sister (Die seltsame Schwester)","Llorona's Heir (Lloronas Erbin)","The Night Acolyte (Die Nachtakolythin)","The Night Seer (Die Nachtseherin)","The Reaper (Der Sensenmann)","The Revenant (Der Wiedergänger)","Zhong Kui (Zhong Kui)","Dead Blessing (Toter Segen)","Rangda's Shadow (Rangdas Schatten)","Dame of the Dead (Dame der Toten)","Luz Mala (Das böse Licht)"],
  },
  {
    id: "jaeger", name: "Jäger / Trapper", icon: "🦌",
    skins: ["The Beast Hunter (Der Bestienjaeger)","The Moorhound (Der Moorhund)","The Mountain Man (Der Bergmann)","The Reptilian (Der Reptilienmann)","The Hornback (Der Hornrücken)","The Skinflint (Der Geizhals)","The Scaled Ward (Der Schuppenhüter)","The Scarecrow (Die Vogelscheuche)","Skull Taker (Der Schädelsammler)","The Fang Shearer (Der Fangzahnscheerer)","Trapper: Buckshot (Trapper: Schrot)","Trapper: Snare (Trapper: Falle)","The Archaeologist (Der Archäologe)"],
  },
  {
    id: "soldat", name: "Soldat / Militär", icon: "🎖",
    skins: ["Sgt. Bridgewater (Sgt. Bridgewater)","The Turncoat (Der Überläufer)","The Prodigal Son (Der verlorene Sohn)","The Sovereign (Der Souverän)","North Star (Nordstern)","The Headsman (Der Henker)","The Conspirator (Der Verschwörer)","Mountie (Der Mountie)","The Prescient (Die Hellseherin)"],
  },
  {
    id: "banditen", name: "Banditen / Outlaws", icon: "🤠",
    skins: ["The Gunslinger (Die Revolverheld – May Belle)","The Kid (Der Junge)","The Rat (Die Ratte)","The Wayward Helmsman (Der eigensinnige Steuermann)","Silver Spur (Der Silbersporn)","Billy Story (Billy Story)","Kill Buyer (Der Kopfgeldjäger)","The Waldmann (Der Waldmann)","Plains Warden (Der Präriewächter)"],
  },
  {
    id: "gesetzeshueter", name: "Gesetzeshüter / Lawman", icon: "⭐",
    skins: ["The Prescient (Die Hellseherin)","The Researcher (Der Forscher)","The Witch Hunter (Der Hexenjäger)","Mountie (Der Mountie)","Teche Wraith (Das Teche-Gespenst)","Silver Spur (Der Silbersporn)"],
  },
  {
    id: "japaner", name: "Japaner / Asiatisch", icon: "⛩",
    skins: ["The Ronin (Der Ronin)","The Miko (Die Miko)","The Exile (Die Verbannte)","The Concubine (Die Konkubine)","Zhong Kui (Zhong Kui)","Dead Blessing (Toter Segen)","Spirit of Nian (Geist des Nian)"],
  },
  {
    id: "indianer", name: "Indianer / Native American", icon: "🪶",
    skins: ["The Spirited (Die Beseelte)","Lonely Howl (Einsames Heulen)","Plains Warden (Der Präriewächter)","Sofia (Sofia)"],
  },
  {
    id: "mexikaner", name: "Mexikaner / Latino", icon: "🌵",
    skins: ["Llorona's Heir (Lloronas Erbin)","The Rat (Die Ratte)","The Penitent (Der Büßer)","Luz Mala (Das böse Licht)"],
  },
  {
    id: "seefahrer", name: "Seefahrer / Piraten", icon: "⚓",
    skins: ["The Wayward Helmsman (Der eigensinnige Steuermann)","Thirteenth Mate (Der dreizehnte Maat)","The Phantom (Das Phantom)","The Waldmann (Der Waldmann)","Umpire's Bane (Des Schiedsrichters Fluch)"],
  },
  {
    id: "zirkus", name: "Zirkus / Karneval", icon: "🎪",
    skins: ["Montresor (Montresor)","Scaramuccia (Scaramuccia)","The Hyena (Die Hyäne)","Umpire's Bane (Des Schiedsrichters Fluch)"],
  },
  {
    id: "clowns", name: "Clowns / Masken", icon: "🤡",
    skins: ["Scaramuccia (Scaramuccia)","Montresor (Montresor)","Monroe (Monroe – Der Eingewiesene)","Ghost Face (Geistergesicht)","The Phantom (Das Phantom)","The Cowl (Die Kapuze)"],
  },
  {
    id: "maske", name: "Mit Maske", icon: "🎭",
    skins: ["The Bone Doctor (Der Knochendoktor)","The Reptilian (Der Reptilienmann)","The Headsman (Der Henker)","Ghost Face (Geistergesicht)","Perchta: Dawn (Perchta: Morgengrauen)","Perchta: Dusk (Perchta: Abenddämmerung)","The Plague Doctor (Der Pestdoktor)","The Cowl (Die Kapuze)","Scaramuccia (Scaramuccia)","The Phantom (Das Phantom)","Scourge: Midian (Geißel: Midian)","Scourge: Morrigan (Geißel: Morrigan)"],
  },
  {
    id: "hut", name: "Mit Hut", icon: "🎩",
    skins: ["The Gunslinger (Die Revolverheld – May Belle)","The Kid (Der Junge)","The Mountain Man (Der Bergmann)","The Researcher (Der Forscher)","The Prescient (Die Hellseherin)","Sgt. Bridgewater (Sgt. Bridgewater)","The Skinflint (Der Geizhals)","The Turncoat (Der Überläufer)","Silver Spur (Der Silbersporn)","Billy Story (Billy Story)","Plains Warden (Der Präriewächter)"],
  },
  {
    id: "frauen", name: "Nur Frauen", icon: "♀",
    skins: ["Weird Sister (Die seltsame Schwester)","Llorona's Heir (Lloronas Erbin)","The Prodigal Daughter (Die verlorene Tochter)","The Miko (Die Miko)","The Night Acolyte (Die Nachtakolythin)","The Bone Mason (Die Knochenmaurerin)","The Concubine (Die Konkubine)","The Exile (Die Verbannte)","The Gunslinger (Die Revolverheld – May Belle)","North Star (Nordstern)","Perchta: Dawn (Perchta: Morgengrauen)","Perchta: Dusk (Perchta: Abenddämmerung)","Dame of the Dead (Dame der Toten)","Rangda's Shadow (Rangdas Schatten)","Lilith (Lilith)","Angel of Death (Todesengel)","Sofia (Sofia)","Scourge: Morrigan (Geißel: Morrigan)","Brood (Brood)","Teche Wraith (Das Teche-Gespenst)"],
  },
  {
    id: "maenner", name: "Nur Männer", icon: "♂",
    skins: ["The Bone Doctor (Der Knochendoktor)","The Ronin (Der Ronin)","The Reptilian (Der Reptilienmann)","The Beast Hunter (Der Bestienjaeger)","The Mountain Man (Der Bergmann)","The Phantom (Das Phantom)","The Reaper (Der Sensenmann)","The Headsman (Der Henker)","Sgt. Bridgewater (Sgt. Bridgewater)","The Turncoat (Der Überläufer)","The Researcher (Der Forscher)","The Kid (Der Junge)","The Rat (Die Ratte)","The Moorhound (Der Moorhund)","Zhong Kui (Zhong Kui)","The Sovereign (Der Souverän)","The Scarecrow (Die Vogelscheuche)","The Penitent (Der Büßer)","Monroe (Monroe – Der Eingewiesene)","Skull Taker (Der Schädelsammler)","Ghost Face (Geistergesicht)","The Prodigal Son (Der verlorene Sohn)","Mountie (Der Mountie)","The Archaeologist (Der Archäologe)","Head Taker (Der Kopfabnehmer)","Hex Breaker (Der Fluchbrecher)","Cain (Kain)","Scourge: Midian (Geißel: Midian)","Montresor (Montresor)","Scaramuccia (Scaramuccia)"],
  },
  {
    id: "redneck", name: "Redneck / Südstaaten", icon: "🪓",
    skins: ["The Mountain Man (Der Bergmann)","The Scarecrow (Die Vogelscheuche)","The Skinflint (Der Geizhals)","The Hornback (Der Hornrücken)","The Infected (Der Infizierte)","The Rat (Die Ratte)","Billy Story (Billy Story)"],
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
const BUDGET_OPTIONS = [3, 5, 8, 10, 15, 20];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Speicher-Helfer (localStorage mit try/catch) ─────────────────────────────
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return fallback;
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function usePersist(key, initial) {
  const [value, setValue] = useState(() => lsGet(key, initial));
  useEffect(() => { lsSet(key, value); }, [key, value]);
  return [value, setValue];
}

const MAPS = ["Stillwater Bayou", "Lawson Delta", "DeSalle", "Mammon's Gulch"];
const BOSSES = ["Butcher", "Spider", "Assassin", "Scrapbeak", "Rotjaw"];

// Bonuspunkte für schwierige Vorgaben (nur Richtwerte für euer Scoreboard)
const PLAYSTYLE_BONUS = {
  "Nur Nahkampf (Melee only)": 3, "Kein Heilen erlaubt": 3, "Nur Pistolen & Messer": 2,
  "Stealth – kein unnötiger Lärm": 2, "Rush – immer vorwärts": 1, "Solo-Style im Trio (kein Callout)": 2,
  "Keine Consumables": 2, "Nur Iron Sights (kein Scope)": 1, "Nur Feuer- / Explosivschaden": 2,
  "Hunter sofort looten, egal was": 1, "Kein Rückzug – fight to the death": 2, "Erster Kill entscheidet Spielweise neu": 1,
};
const GROUP_BONUS = {
  "Nur Laut": 1, "Nur Leise": 2, "Hinterhalt": 2, "Kopf durch die Wand": 1, "Letzte Kugel zählt": 3, "Kein HUD": 3,
  "Bounty stehlen": 3, "Einer führt, alle folgen": 1, "Kein Compound": 2, "Volle Aggression": 1,
  "Niemand stirbt allein": 2, "Doktor-Modus": 1,
};
function weaponBonus(w) {
  if (!w) return 0;
  if (/Nahkampf|Combat Axe|Katana|Railroad Hammer|Baseball Bat|Cavalry Saber|Machete/.test(w)) return 2;
  if (/Bomb Lance|Crossbow|Hunting Bow/.test(w)) return 1;
  return 0;
}
function challengeBonus(ch) {
  return (ch.playstyle ? (PLAYSTYLE_BONUS[ch.playstyle] || 1) : 0) + weaponBonus(ch.weapon) + (ch.chat ? (CHAT_BONUS[ch.chat] || 0) : 0);
}
const CHAT_RULES = [
  "Meint immer das Gegenteil", "Nur in Reimen sprechen", "Mittelalterlich sprechen (Hört, edler Gefährte!)",
  "Nur im Flüsterton", "Wie ein Pirat sprechen", "Wie ein Nachrichtensprecher", "Wie ein Sportkommentator",
  "Nur in Fragen sprechen", "Keine Zahlen und keine Himmelsrichtungen nennen", "Nie «ja» oder «nein» sagen",
  "Nur Einwortsätze", "Jeden Satz mit «Meine Herren» beginnen", "Nur Tiergeräusche bei Gefahr",
  "Wie im Zeitlupen-Kommentar sprechen", "Nur Hochdeutsch (kein Dialekt)", "Nur Dialekt (kein Hochdeutsch)",
  "Jeder Treffer des Teams wird laut gefeiert", "Wer stirbt, bekommt einen Nachruf",
];
const CHAT_BONUS = {
  "Meint immer das Gegenteil": 2, "Nur in Reimen sprechen": 2, "Nur in Fragen sprechen": 1,
  "Keine Zahlen und keine Himmelsrichtungen nennen": 2, "Nie «ja» oder «nein» sagen": 1, "Nur Einwortsätze": 1,
};
const ROLES = [
  "Späher – meldet alles, was er sieht", "Sanitäter – hält das Team am Leben", "Köder – lockt Gegner an",
  "Anführer – alle folgen seinen Befehlen", "Scharfschütze – schiesst nur aus der Distanz", "Nachhut – sichert den Rücken",
  "Kassierer – looted alles und verteilt fair", "Taktiker – plant jeden Schritt laut", "Berserker – immer vorneweg",
  "Geist – bleibt leise und unentdeckt",
];
function groupBonus(g) { return g ? (GROUP_BONUS[g.name] || 1) : 0; }

function generateTraits(budget) {
  const pool = [...TRAITS];
  const picked = [];
  let remaining = budget;
  let attempts = 0;
  while (remaining > 0 && attempts < 100) {
    attempts++;
    const left = remaining;
    const affordable = pool.filter(t => t.cost <= left && !picked.find(p => p.name === t.name));
    if (affordable.length === 0) break;
    const trait = getRandom(affordable);
    picked.push(trait);
    remaining -= trait.cost;
  }
  return { traits: picked, spent: budget - remaining };
}

function allowed(arr, excluded) {
  const p = arr.filter(x => !(excluded || []).includes(x));
  return p.length ? p : arr;
}
function capFor(tr) { return tr && tr.traits.some(t => t.name === "Quartermaster") ? 6 : 5; }
function pickLoadout(excl, cap) {
  const okC = allowed(WEAPON_CATEGORIES, excl.cat);
  const off = excl.weapon || [];
  let pool = WEAPONS.filter(w => okC.includes(w.a) && !off.includes(w.n));
  if (!pool.length) pool = WEAPONS;
  const first = getRandom(pool);
  const rest = pool.filter(w => w !== first && first.s + w.s <= cap);
  const ws = rest.length ? [first, getRandom(rest)] : [first];
  return { ws, total: ws.reduce((a, w) => a + w.s, 0) };
}
function weaponText(ws, mode) {
  return ws.map(w => mode === "category" ? `${w.a} (Gr. ${w.s})` : mode === "exact" ? `${w.n} (Gr. ${w.s})` : `${w.a} → ${w.n} (Gr. ${w.s})`).join("  +  ");
}
function pickSkin(skinMode, theme) {
  const s = generateSkin(skinMode, theme);
  return s.skin || `${s.themeIcon} ${s.themeName}`;
}
function pickPlaystyle(excl, customStyles) {
  return getRandom(allowed([...PLAYSTYLES, ...customStyles], excl.style));
}

function generateChallenge(cfg, sameLoadout) {
  const traitResult = cfg.traitBudget > 0 ? generateTraits(cfg.traitBudget) : null;
  const cap = capFor(traitResult);
  const lo = sameLoadout || pickLoadout(cfg.excl, cap);
  const weapon = weaponText(lo.ws, cfg.weaponMode);
  const playstyle = cfg.includePlaystyle ? pickPlaystyle(cfg.excl, cfg.customStyles) : null;
  const chat = cfg.includeChat ? getRandom(allowed([...CHAT_RULES, ...(cfg.customChat || [])], cfg.excl.chat)) : null;
  const role = cfg.includeRole ? getRandom(allowed(ROLES, cfg.excl.role)) : null;
  const skin = cfg.includeSkin ? pickSkin(cfg.skinMode, cfg.selectedTheme) : null;
  return { weapon, wtotal: lo.total, cap, playstyle, traitResult, chat, role, skin };
}

function generateSkin(skinMode, selectedTheme) {
  if (skinMode === "theme") {
    const theme = selectedTheme === "random"
      ? getRandom(SKIN_THEMES)
      : SKIN_THEMES.find(t => t.id === selectedTheme) || getRandom(SKIN_THEMES);
    return { themeName: theme.name, themeIcon: theme.icon, skin: null, themeSkins: theme.skins };
  } else {
    const pool = selectedTheme === "random"
      ? ALL_SKINS
      : (SKIN_THEMES.find(t => t.id === selectedTheme)?.skins || ALL_SKINS);
    return { themeName: null, themeIcon: null, skin: getRandom(pool), themeSkins: null };
  }
}

function challengeText(pl, res, g, m, budget) {
  const lines = ["🎯 Hunt Challenge"];
  if (m) lines.push(`🗺 Karte: ${m.map} · Boss: ${m.boss}`);
  if (g) lines.push(`👥 Gruppe: ${g.name} – ${g.desc}`);
  res.forEach((c, i) => {
    let l = `${pl[i] ? pl[i].name : "Spieler"}: 🔫 ${c.weapon} [${c.wtotal}/${c.cap} AP]`;
    if (c.skin) l += ` | 🎭 ${c.skin}`;
    if (c.playstyle) l += ` | 🎮 ${c.playstyle}`;
    if (c.chat) l += ` | 💬 ${c.chat}`;
    if (c.role) l += ` | 🧭 ${c.role}`;
    if (c.traitResult) l += ` | ⚡ ${c.traitResult.traits.map(t => t.de ? `${t.de} (${t.name})` : t.name).join(", ") || "–"} (${c.traitResult.spent}/${budget} P)`;
    lines.push(l);
  });
  return lines.join("\n");
}
function copyText(text, onDone) {
  const fallback = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      onDone();
    } catch (e) {}
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, fallback);
      return;
    }
  } catch (e) {}
  fallback();
}

// ── ICONS ────────────────────────────────────────────────────────────────────
const Skull = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{opacity:0.7}}>
    <path d="M12 2C7.03 2 3 6.03 3 11c0 3.1 1.53 5.83 3.88 7.5L7 21h10l.12-2.5C19.47 16.83 21 14.1 21 11c0-4.97-4.03-9-9-9zm-2.5 13c-.83 0-1.5-.67-1.5-1.5S8.67 12 9.5 12s1.5.67 1.5 1.5S10.33 15 9.5 15zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);
const Crosshair = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);
const Shield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"/>
  </svg>
);

// ── STYLES ───────────────────────────────────────────────────────────────────
const btn = (active) => ({
  padding:"7px 16px", background: active?"rgba(180,80,20,0.35)":"rgba(255,255,255,0.04)",
  border:`1px solid ${active?"#b45014":"rgba(180,80,20,0.2)"}`, borderRadius:3,
  color: active?"#e8c090":"#7a6040", fontFamily:"'Cinzel', serif", fontSize:11,
  cursor:"pointer", transition:"all 0.15s", letterSpacing:"0.05em",
  boxShadow: active?"0 0 10px rgba(180,80,20,0.3)":"none", whiteSpace:"nowrap",
});
const toggleWrap = (active) => ({
  width:44, height:24, borderRadius:12,
  background: active?"rgba(180,80,20,0.6)":"rgba(255,255,255,0.08)",
  border:`1px solid ${active?"#b45014":"rgba(180,80,20,0.2)"}`,
  cursor:"pointer", position:"relative", transition:"all 0.2s", flexShrink:0,
});
const toggleDot = (active) => ({
  width:16, height:16, borderRadius:"50%",
  background: active?"#e8c090":"#5a4030", position:"absolute", top:3, left:active?23:3,
  transition:"all 0.2s", boxShadow: active?"0 0 6px rgba(180,80,20,0.6)":"none",
});
const sL = { fontSize:10, letterSpacing:"0.25em", color:"#6a5030", marginBottom:5, textTransform:"uppercase" };
const cL = { fontSize:11, letterSpacing:"0.2em", color:"#a08060", display:"block", marginBottom:10, textTransform:"uppercase" };
const TABS = [{ id:"challenge", label:"⚔ Challenge" }, { id:"score", label:"📊 Scoreboard" }, { id:"turnier", label:"🏆 Turnierzähler" }];
const BG = `radial-gradient(ellipse at 50% 0%, rgba(180,80,20,0.12) 0%, transparent 60%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.012'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// ── GEMEINSAME HELFER ────────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 720);
  useEffect(() => {
    const f = () => setM(window.innerWidth < 720);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return m;
}
const inputStyle = { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 3, color: "#e8d0a0", fontFamily: "'Cinzel', serif", fontSize: 14, padding: "8px 10px", width: "100%", outline: "none", textAlign: "center" };
const panel = { background: "rgba(255,255,255,0.022)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 4, padding: "18px 22px", marginBottom: 18 };
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

// ── TURNIERZÄHLER (Ten49 Community-Turnier) ─────────────────────────────────
const TURNIER_KEY = "hunt-turnier-v2";
const TURNIER_FIELDS = [
  ["kills", "Kills", "kill"], ["contract", "Vertragsstatus", "contract"], ["clean", "Vollst. Säuberung", "clean"],
  ["boss", "Getötet (Boss)", "boss"], ["lair", "Versteck gefunden", "lair"], ["hints", "Hinweise gefunden", "hints"], ["time", "Zeitbonus", "time"],
];
const TURNIER_DEFAULTS = { kill: 100, contract: 1, clean: 1, boss: 1, lair: 1, hints: 1, time: 1 };
const emptyRound = () => ({ kills: "", contract: "", clean: "", boss: "", lair: "", hints: "", time: "" });
const fiveRounds = () => [emptyRound(), emptyRound(), emptyRound(), emptyRound(), emptyRound()];
const pad2 = (n) => String(n).padStart(2, "0");
function fmtDur(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

function TurnierZaehler() {
  const isMobile = useIsMobile();
  const [values, setValues] = useState(() => ({ ...TURNIER_DEFAULTS, ...((lsGet(TURNIER_KEY, null) || {}).values || {}) }));
  const [rounds, setRounds] = useState(() => {
    const r = (lsGet(TURNIER_KEY, null) || {}).rounds;
    return Array.isArray(r) && r.length ? r.map(x => ({ ...emptyRound(), ...x })) : fiveRounds();
  });
  const [team, setTeam] = useState(() => ({ name: "", players: "", ...((lsGet(TURNIER_KEY, null) || {}).team || {}) }));
  const [showSettings, setShowSettings] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { lsSet(TURNIER_KEY, { values, rounds, team }); }, [values, rounds, team]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const at = (h, m) => { const x = new Date(now); x.setHours(h, m, 0, 0); return x.getTime(); };
  const startT = at(20, 0);
  const endT = at(23, 45);
  const timerText = now < startT
    ? `Start um 20:00 – noch ${fmtDur(startT - now)}`
    : now < endT
      ? `Noch ${fmtDur(endT - now)} bis 23:45 (Abgabeschluss)`
      : "Die Turnierzeit von heute (20:00–23:45) ist vorbei";

  const roundScore = (r) => TURNIER_FIELDS.reduce((sum, f) => sum + num(r[f[0]]) * num(values[f[2]]), 0);
  const scores = rounds.map(roundScore);
  const ranked = scores.map((s, i) => ({ s, i })).sort((a, b) => (b.s - a.s) || (a.i - b.i));
  const counted = new Set(ranked.filter(x => x.s > 0).slice(0, 4).map(x => x.i));
  const total = scores.reduce((sum, s, i) => sum + (counted.has(i) ? s : 0), 0);
  const filled = scores.filter(s => s > 0).length;
  const minCounted = counted.size > 0 ? Math.min(...[...counted].map(i => scores[i])) : 0;

  const updateRound = (idx, field, value) => setRounds(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  const addRound = () => setRounds(prev => [...prev, emptyRound()]);
  const removeRound = (idx) => setRounds(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  const resetAll = () => {
    if (window.confirm("Alle Runden wirklich löschen?")) setRounds(fiveRounds());
  };
  const unitLabel = (f) => (f[0] !== "kills" && values[f[2]] === 1 ? "Punkte" : `Anzahl × ${values[f[2]]}`);

  function exportPng() {
    const cols = ["Runde", ...TURNIER_FIELDS.map(f => f[1]), "Punkte"];
    const rowH = 38;
    const W = 1200;
    const top = 150;
    const H = top + (rounds.length + 3) * rowH + 40;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#0d0b08"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#e8d5b0"; g.font = "bold 30px Georgia, serif";
    g.fillText(`Ten49 Turnier – ${team.name || "Team"}`, 30, 48);
    g.font = "18px Georgia, serif"; g.fillStyle = "#a09060";
    g.fillText(team.players ? `Spieler: ${team.players}` : "", 30, 80);
    g.fillText(new Date().toLocaleDateString("de-CH"), 30, 106);
    const colW = (W - 60) / cols.length;
    g.font = "bold 14px Georgia, serif"; g.fillStyle = "#b45014";
    cols.forEach((t, i) => g.fillText(t, 30 + i * colW, top));
    g.font = "16px Georgia, serif";
    rounds.forEach((r, ri) => {
      const y = top + (ri + 1) * rowH;
      const isC = counted.has(ri);
      g.fillStyle = isC ? "#f0d8a0" : "#6a5030";
      const cells = [`#${ri + 1}`, ...TURNIER_FIELDS.map(f => String(r[f[0]] || 0)), `${scores[ri]}${isC ? "  (zählt)" : ""}`];
      cells.forEach((t, i) => g.fillText(t, 30 + i * colW, y));
    });
    g.fillStyle = "#f0d8a0"; g.font = "bold 26px Georgia, serif";
    g.fillText(`Gesamt (beste 4 Runden): ${total}`, 30, top + (rounds.length + 2) * rowH);
    c.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "turnier-ergebnis.png";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  const colHead = { fontSize: 9, letterSpacing: "0.12em", color: "#6a5030", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3 };
  const grid = { display: "grid", gridTemplateColumns: "44px repeat(7, minmax(72px, 1fr)) 84px 28px", gap: 8, alignItems: "center", minWidth: 860 };
  const removeBtn = { background: "transparent", border: "none", color: "#5a4030", cursor: "pointer", fontSize: 18, padding: 0 };

  return (
    <>
      <div style={{ background: "rgba(180,80,20,0.07)", border: "1px solid rgba(180,80,20,0.3)", borderRadius: 4, padding: "16px 22px", marginBottom: 22 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#b45014", marginBottom: 8, textTransform: "uppercase" }}>🏆 Ten49 Community-Turnier</div>
        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "#a09060", lineHeight: 1.6 }}>
          Teams mit 2–3 Spielern (Solo-Runden zählen nicht). Jeden letzten Samstag im Monat, 20:00–23:45 Uhr.
          Es zählen die <b style={{ color: "#e8c090" }}>besten 4 Runden</b>. Gewertet werden die gelben Punkte mit zwei Strichen davor
          (Übersichtsdetails → Auszeichnungskarten). Tragt jeweils die <b style={{ color: "#e8c090" }}>Summe aller Spieler im Team</b> ein.
          <br /><a href="https://www.ten49.de/turnier/" target="_blank" rel="noopener noreferrer" style={{ color: "#e8c090" }}>Zur Turnierseite von Ten49 →</a>
        </div>
      </div>

      <div style={{ ...panel, textAlign: "center", border: "1px solid rgba(180,80,20,0.35)", boxShadow: "0 0 30px rgba(180,80,20,0.15)" }}>
        <div style={sL}>Gesamtpunkte (beste 4 Runden)</div>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(36px, 9vw, 56px)", color: "#f0d8a0", textShadow: "0 0 30px rgba(180,80,20,0.5)", lineHeight: 1.1 }}>{total.toLocaleString("de-CH")}</div>
        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 12, color: "#7a6040", marginTop: 8 }}>
          {filled < 4
            ? `Noch ${4 - filled} Runde${4 - filled === 1 ? "" : "n"} bis die vollen 4 Runden zählen.`
            : `Schwächste gewertete Runde: ${minCounted.toLocaleString("de-CH")}. Eine neue Runde zählt ab mehr als ${minCounted.toLocaleString("de-CH")} Punkten.`}
        </div>
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#b45014", marginTop: 12 }}>⏱ {timerText}</div>
      </div>

      <div style={{ ...panel, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={cL}>Teamname</label>
          <input value={team.name} onChange={e => setTeam({ ...team, name: e.target.value })} placeholder="z. B. Bayou Brotherhood" style={{ ...inputStyle, textAlign: "left" }} />
        </div>
        <div style={{ flex: "2 1 260px" }}>
          <label style={cL}>Spieler</label>
          <input value={team.players} onChange={e => setTeam({ ...team, players: e.target.value })} placeholder="z. B. Fabian, Kollege 1, Kollege 2" style={{ ...inputStyle, textAlign: "left" }} />
        </div>
      </div>

      <div style={{ ...panel, overflowX: isMobile ? "visible" : "auto" }}>
        {!isMobile && (
          <div style={{ ...grid, marginBottom: 10 }}>
            <div />
            {TURNIER_FIELDS.map(f => <div key={f[0]} style={colHead}>{f[1]}<br />({unitLabel(f)})</div>)}
            <div style={colHead}>Runde</div>
            <div />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rounds.map((r, i) => {
            const isCounted = counted.has(i);
            const box = { padding: "8px 6px", borderRadius: 3, background: isCounted ? "rgba(180,80,20,0.12)" : "transparent", border: `1px solid ${isCounted ? "rgba(180,80,20,0.5)" : "rgba(180,80,20,0.1)"}`, opacity: scores[i] > 0 && !isCounted ? 0.6 : 1 };
            const scoreBlock = (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: isCounted ? "#f0d8a0" : "#7a6040" }}>{scores[i].toLocaleString("de-CH")}</div>
                {scores[i] > 0 && <div style={{ fontSize: 8, letterSpacing: "0.15em", color: isCounted ? "#b45014" : "#5a4030", textTransform: "uppercase" }}>{isCounted ? "zählt" : "zählt nicht"}</div>}
              </div>
            );
            if (isMobile) {
              return (
                <div key={i} style={{ ...box, padding: "12px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.12em", color: isCounted ? "#e8c090" : "#7a6040" }}>RUNDE #{i + 1}</span>
                    {scoreBlock}
                    <button onClick={() => removeRound(i)} title="Runde entfernen" style={removeBtn}>×</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {TURNIER_FIELDS.map(f => (
                      <div key={f[0]}>
                        <div style={{ ...colHead, marginBottom: 3 }}>{f[1]}</div>
                        <input type="number" inputMode="numeric" min="0" value={r[f[0]]} placeholder="0" onChange={e => updateRound(i, f[0], e.target.value)} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} style={{ ...grid, ...box }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: isCounted ? "#e8c090" : "#7a6040", textAlign: "center" }}>#{i + 1}</div>
                {TURNIER_FIELDS.map(f => (
                  <input key={f[0]} type="number" inputMode="numeric" min="0" value={r[f[0]]} placeholder="0" onChange={e => updateRound(i, f[0], e.target.value)} style={inputStyle} />
                ))}
                {scoreBlock}
                <button onClick={() => removeRound(i)} title="Runde entfernen" style={removeBtn}>×</button>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={addRound} style={btn(false)}>＋ Runde hinzufügen</button>
          <button onClick={exportPng} style={btn(false)}>🖼 Als Bild speichern</button>
          <button onClick={resetAll} style={btn(false)}>🗑 Alles zurücksetzen</button>
        </div>
      </div>

      <div style={{ ...panel, padding: "16px 22px" }}>
        <button onClick={() => setShowSettings(v => !v)} style={{ ...btn(showSettings), marginBottom: showSettings ? 14 : 0 }}>⚙ Punktwerte {showSettings ? "ausblenden" : "anpassen"}</button>
        {showSettings && (
          <>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {TURNIER_FIELDS.map(f => (
                <div key={f[2]} style={{ width: 150 }}>
                  <label style={cL}>{f[1]}</label>
                  <input type="number" min="0" value={values[f[2]]} onChange={e => setValues({ ...values, [f[2]]: num(e.target.value) })} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 12, color: "#6a5030", marginTop: 12, lineHeight: 1.5 }}>
              Wert pro Eintrag: Kill = 100 Punkte. Bei den anderen Feldern steht 1, dann trägst du die Punkte direkt von der Auszeichnungskarte ein.
              Kennst du den festen Wert (z. B. 50 pro Hinweis), trage ihn hier ein und gib in der Runde nur noch die Anzahl ein.
              Eure Eingaben bleiben im Browser gespeichert.
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── SCOREBOARD ───────────────────────────────────────────────────────────────
function ScoreBoard({ players, playerCount, scores, log, onAdd, onUndo, onReset }) {
  return (
    <>
      <div style={panel}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#8a6a40", marginBottom: 6, textTransform: "uppercase" }}>📊 Abend-Scoreboard</div>
        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "#a09060", lineHeight: 1.6, marginBottom: 16 }}>
          Punkte für den ganzen Abend. Auf der Challenge-Seite buchst du mit «Geschafft» automatisch 1 Punkt plus Bonus für schwierige Vorgaben. Hier kannst du auch von Hand Punkte vergeben. Die Namen kommen von der Challenge-Seite, alles bleibt im Browser gespeichert.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {players.slice(0, playerCount).map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 12px", border: "1px solid rgba(180,80,20,0.2)", borderRadius: 3 }}>
              <div style={{ flex: "1 1 120px", fontSize: 13, color: "#e8d0a0" }}>{p.name}</div>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 26, color: "#f0d8a0", minWidth: 50, textAlign: "center" }}>{scores[p.id] || 0}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[-1, 1, 2, 3, 5].map(d => (
                  <button key={d} onClick={() => onAdd(p.id, d, "Manuell")} style={{ ...btn(false), padding: "7px 12px" }}>{d > 0 ? `+${d}` : d}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={onUndo} style={btn(false)}>↩ Letzte Buchung rückgängig</button>
          <button onClick={onReset} style={btn(false)}>🗑 Alles zurücksetzen</button>
        </div>
      </div>
      {log.length > 0 && (
        <div style={panel}>
          <div style={sL}>Letzte Buchungen</div>
          {log.slice(0, 10).map((e, i) => (
            <div key={i} style={{ fontFamily: "'IM Fell English', serif", fontSize: 13, color: "#a09060", lineHeight: 1.7 }}>
              {new Date(e.t).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} · {e.name}: <b style={{ color: e.delta >= 0 ? "#e8c090" : "#b45014" }}>{e.delta > 0 ? `+${e.delta}` : e.delta}</b> · {e.why}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function HuntChallengeGenerator() {
  const [tab, setTab] = useState("challenge");
  const [playerCount, setPlayerCount] = usePersist("hunt-playercount", 3);
  const [players, setPlayers] = usePersist("hunt-players", PLAYERS_DEFAULT);
  const [weaponMode, setWeaponMode] = usePersist("hunt-weaponmode", "category");
  const [includePlaystyle, setIncludePlaystyle] = usePersist("hunt-playstyle", true);
  const [includeGroup, setIncludeGroup] = usePersist("hunt-group", true);
  const [includeMap, setIncludeMap] = usePersist("hunt-map", false);
  const [duel, setDuel] = usePersist("hunt-duel", false);
  const [traitBudget, setTraitBudget] = usePersist("hunt-budget", 0);
  const [rerollLimit, setRerollLimit] = usePersist("hunt-rerolllimit", 99);
  const [excl, setExcl] = usePersist("hunt-excl", { cat: [], weapon: [], style: [] });
  const [customStyles, setCustomStyles] = usePersist("hunt-custom-styles", []);
  const [includeChat, setIncludeChat] = usePersist("hunt-chat", false);
  const [includeRole, setIncludeRole] = usePersist("hunt-role", false);
  const [customChat, setCustomChat] = usePersist("hunt-custom-chat", []);
  const [customGroups, setCustomGroups] = usePersist("hunt-custom-groups", []);
  const [history, setHistory] = usePersist("hunt-history", []);
  const [scores, setScores] = usePersist("hunt-scores", {});
  const [scoreLog, setScoreLog] = usePersist("hunt-scorelog", []);

  const [challenges, setChallenges] = useState(null);
  const [groupChallenge, setGroupChallenge] = useState(null);
  const [mapResult, setMapResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [rollFrame, setRollFrame] = useState(null);
  const [rollGroupFrame, setRollGroupFrame] = useState(null);
  const [used, setUsed] = useState([0, 0, 0]);
  const [done, setDone] = useState([false, false, false]);
  const [groupDone, setGroupDone] = useState(false);
  const [skinMode, setSkinMode] = usePersist("hunt-skinmode", "exact");
  const [selectedTheme, setSelectedTheme] = usePersist("hunt-skintheme", "random");
  const [includeSkin, setIncludeSkin] = usePersist("hunt-skin", false);
  const [copied, setCopied] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newStyle, setNewStyle] = useState("");
  const [newChat, setNewChat] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const activePlayers = players.slice(0, playerCount);
  const cfg = { weaponMode, includePlaystyle, traitBudget, excl, customStyles, includeChat, includeRole, customChat, includeSkin, skinMode, selectedTheme };
  const allGroups = [...GROUP_CHALLENGES, ...customGroups.filter(g => g.name).map(g => ({ name: g.name, desc: g.desc || "Eigene Gruppenchallenge", icon: "✨" }))];
  const excludedCount = (excl.cat || []).length + (excl.weapon || []).length + (excl.style || []).length + (excl.chat || []).length + (excl.role || []).length;
  const isMobile = useIsMobile();

  const updateName = (idx, name) => setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, name } : p));
  const flashCopied = (key) => { setCopied(key); setTimeout(() => setCopied(null), 1500); };
  const addHistory = (title, text) => setHistory(h => [{ t: Date.now(), title, text }, ...h].slice(0, 10));
  const toggleExcl = (kind, item) => setExcl(prev => {
    const cur = prev[kind] || [];
    return { ...prev, [kind]: cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item] };
  });

  const addScore = (id, delta, why) => {
    const name = (players.find(p => p.id === id) || {}).name || "Spieler";
    setScores(s => ({ ...s, [id]: (s[id] || 0) + delta }));
    setScoreLog(l => [{ t: Date.now(), id, name, delta, why }, ...l].slice(0, 30));
  };
  const undoScore = () => {
    if (!scoreLog.length) return;
    const e = scoreLog[0];
    setScores(s => ({ ...s, [e.id]: (s[e.id] || 0) - e.delta }));
    setScoreLog(l => l.slice(1));
  };
  const resetScores = () => {
    if (window.confirm("Alle Punkte zurücksetzen?")) { setScores({}); setScoreLog([]); }
  };

  const makeAll = () => {
    const same = duel ? pickLoadout(excl, 5) : null;
    return activePlayers.map(() => generateChallenge(cfg, same));
  };

  function roll() {
    setRolling(true); setChallenges(null); setGroupChallenge(null); setMapResult(null);
    setUsed([0, 0, 0]); setDone([false, false, false]); setGroupDone(false);
    let ticks = 0;
    const iv = setInterval(() => {
      ticks++;
      setRollFrame(makeAll());
      if (includeGroup) setRollGroupFrame(getRandom(allGroups));
      if (ticks >= 18) {
        clearInterval(iv);
        const res = makeAll();
        const g = includeGroup ? getRandom(allGroups) : null;
        const m = includeMap ? { map: getRandom(MAPS), boss: getRandom(BOSSES) } : null;
        setChallenges(res); setGroupChallenge(g); setMapResult(m);
        setRollFrame(null); setRollGroupFrame(null); setRolling(false);
        addHistory("⚔ Challenge", challengeText(activePlayers, res, g, m, traitBudget));
      }
    }, 60);
  }

  function reroll(i, part) {
    if (!challenges || (used[i] || 0) >= rerollLimit) return;
    setChallenges(prev => prev.map((c, idx) => {
      if (idx !== i) return c;
      if (part === "weapon") { const lo = pickLoadout(excl, capFor(c.traitResult)); return { ...c, weapon: weaponText(lo.ws, weaponMode), wtotal: lo.total }; }
      if (part === "skin") return { ...c, skin: pickSkin(skinMode, selectedTheme) };
      if (part === "playstyle") return { ...c, playstyle: pickPlaystyle(excl, customStyles) };
      if (part === "chat") return { ...c, chat: getRandom(allowed([...CHAT_RULES, ...customChat], excl.chat)) };
      if (part === "role") return { ...c, role: getRandom(allowed(ROLES, excl.role)) };
      const tr = generateTraits(traitBudget);
      const cap = capFor(tr);
      if (c.wtotal > cap) { const lo = pickLoadout(excl, cap); return { ...c, traitResult: tr, cap, weapon: weaponText(lo.ws, weaponMode), wtotal: lo.total }; }
      return { ...c, traitResult: tr, cap };
    }));
    setUsed(prev => prev.map((u, idx) => idx === i ? u + 1 : u));
  }

  function markDone(i) {
    if (done[i] || !challenges || !challenges[i]) return;
    addScore(players[i].id, 1 + challengeBonus(challenges[i]), "Challenge geschafft");
    setDone(prev => prev.map((d, idx) => idx === i ? true : d));
  }
  function markGroupDone() {
    if (groupDone || !groupChallenge) return;
    const pts = 1 + groupBonus(groupChallenge);
    activePlayers.forEach(p => addScore(p.id, pts, `Gruppe: ${groupChallenge.name}`));
    setGroupDone(true);
  }

  const display = rolling ? rollFrame : challenges;
  const displayGroup = rolling ? rollGroupFrame : groupChallenge;
  const cardGrid = { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" };

  const rerollBtn = (i, part) => (rerollLimit > 0 && !rolling && (used[i] || 0) < rerollLimit)
    ? <button onClick={() => reroll(i, part)} title="Neu würfeln" style={{ background: "transparent", border: "1px solid rgba(180,80,20,0.3)", borderRadius: 3, color: "#b45014", cursor: "pointer", fontSize: 11, padding: "1px 7px", marginLeft: 8 }}>↻</button>
    : null;
  const smallBtn = { background: "rgba(180,80,20,0.12)", border: "1px solid rgba(180,80,20,0.35)", borderRadius: 3, color: "#e8c090", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.08em", padding: "6px 10px" };
  const copyBtn = (key, getText) => (
    <button onClick={() => copyText(getText(), () => flashCopied(key))} style={btn(false)}>{copied === key ? "✓ Kopiert" : "📋 Ergebnis kopieren"}</button>
  );

  const rollBtn = (isRolling, onRoll, label, loadingLabel) => (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <button onClick={onRoll} disabled={isRolling} style={{
        padding: "15px 50px",
        background: isRolling ? "rgba(180,80,20,0.2)" : "linear-gradient(180deg, rgba(200,90,20,0.5) 0%, rgba(150,60,10,0.6) 100%)",
        border: `1px solid ${isRolling ? "rgba(180,80,20,0.2)" : "#b45014"}`,
        borderRadius: 3, color: isRolling ? "#6a5030" : "#f0d8a0",
        fontFamily: "'Cinzel Decorative', serif", fontSize: 14, letterSpacing: "0.12em",
        cursor: isRolling ? "default" : "pointer", transition: "all 0.15s",
        boxShadow: isRolling ? "none" : "0 0 30px rgba(180,80,20,0.35)", textTransform: "uppercase",
      }}>{isRolling ? loadingLabel : label}</button>
    </div>
  );

  const nameInputs = (
    <div style={{ marginBottom: 18 }}>
      <label style={cL}>Namen (werden gespeichert)</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {players.slice(0, playerCount).map((p, i) => (
          <input key={p.id} value={p.name} onChange={e => updateName(i, e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 3, color: "#c9b89a", fontFamily: "'Cinzel', serif", fontSize: 12, padding: "7px 12px", width: 130, outline: "none" }} onFocus={e => e.target.style.borderColor = "#b45014"} onBlur={e => e.target.style.borderColor = "rgba(180,80,20,0.25)"} />
        ))}
      </div>
    </div>
  );
  const countButtons = (
    <div style={{ marginBottom: 18 }}>
      <label style={cL}>Anzahl Spieler</label>
      <div style={{ display: "flex", gap: 8 }}>
        {[2, 3].map(n => <button key={n} onClick={() => setPlayerCount(n)} style={{ ...btn(playerCount === n), fontSize: 13, padding: "8px 24px" }}>{n} Spieler</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b08", color: "#c9b89a", fontFamily: "'Cinzel', serif", backgroundImage: BG, padding: "0 0 60px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Cinzel+Decorative:wght@700&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ textAlign: "center", padding: "40px 20px 28px", borderBottom: "1px solid rgba(180,80,20,0.3)", background: "linear-gradient(180deg, rgba(180,80,20,0.08) 0%, transparent 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(180,80,20,0.04) 39px, rgba(180,80,20,0.04) 40px)" }} />
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: "#8a6a40", marginBottom: 8, textTransform: "uppercase", position: "relative" }}>Bayou Brotherhood</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative" }}>
          <div style={{ height: 1, width: 50, background: "linear-gradient(90deg, transparent, #b45014)" }} /><Skull />
          <h1 style={{ margin: 0, fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(20px, 5vw, 34px)", fontWeight: 700, color: "#e8d5b0", textShadow: "0 0 40px rgba(180,80,20,0.5), 0 2px 4px rgba(0,0,0,0.8)" }}>Hunt Challenge</h1>
          <Skull /><div style={{ height: 1, width: 50, background: "linear-gradient(90deg, #b45014, transparent)" }} />
        </div>
        <p style={{ margin: "8px 0 0", fontFamily: "'IM Fell English', serif", fontStyle: "italic", color: "#7a6040", fontSize: 13, position: "relative" }}>Jeder trägt sein Schicksal – zufällig und unerbittlich.</p>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", borderBottom: "1px solid rgba(180,80,20,0.2)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: isMobile ? "12px 14px" : "14px 30px", background: tab === t.id ? "rgba(180,80,20,0.12)" : "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #b45014" : "2px solid transparent", color: tab === t.id ? "#e8c090" : "#5a4020", fontFamily: "'Cinzel', serif", fontSize: isMobile ? 11 : 12, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 0" }}>

        {/* ═══ CHALLENGE TAB ═══ */}
        {tab === "challenge" && (
          <>
            <div style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(180,80,20,0.25)", borderRadius: 4, padding: "22px 26px", marginBottom: 22, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#8a6a40", marginBottom: 18, textTransform: "uppercase" }}>⚙ Konfiguration</div>

              {countButtons}
              {nameInputs}

              <div style={{ marginBottom: 18 }}>
                <label style={cL}>Waffenmodus</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MODES.map(m => <button key={m.id} onClick={() => setWeaponMode(m.id)} style={btn(weaponMode === m.id)}>{m.label}</button>)}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={cL}>Trait-Budget pro Spieler</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setTraitBudget(0)} style={btn(traitBudget === 0)}>Kein Trait</button>
                  {BUDGET_OPTIONS.map(b => <button key={b} onClick={() => setTraitBudget(b)} style={btn(traitBudget === b)}>{b} Punkte</button>)}
                </div>
                {traitBudget > 0 && <div style={{ fontSize: 10, color: "#6a5030", marginTop: 6, fontFamily: "'IM Fell English', serif", fontStyle: "italic" }}>Zufällige Traits werden zugewiesen bis das Budget aufgebraucht ist.</div>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={cL}>Neu würfeln pro Spieler (Rerolls)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[[0, "Keine"], [1, "1×"], [2, "2×"], [3, "3×"], [99, "Unbegrenzt"]].map(([v, l]) => <button key={v} onClick={() => setRerollLimit(v)} style={btn(rerollLimit === v)}>{l}</button>)}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {[
                  [includePlaystyle, () => setIncludePlaystyle(v => !v), "Individuelle Spielweise würfeln"],
                  [includeChat, () => setIncludeChat(v => !v), "Chat-Regel würfeln"],
                  [includeRole, () => setIncludeRole(v => !v), "Rolle würfeln"],
                  [includeSkin, () => setIncludeSkin(v => !v), "Skin würfeln"],
                  [includeGroup, () => setIncludeGroup(v => !v), "Gruppenchallenge würfeln"],
                  [includeMap, () => setIncludeMap(v => !v), "Karte & Boss würfeln"],
                  [duel, () => setDuel(v => !v), "Duell: alle bekommen dieselbe Waffe"],
                ].map(([active, fn, label], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={fn} style={toggleWrap(active)}><div style={toggleDot(active)} /></button>
                    <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#a08060", textTransform: "uppercase" }}>{label}</span>
                  </div>
                ))}
              </div>

              {includeSkin && (
                <div style={{ marginBottom: 18 }}>
                  <label style={cL}>Skin-Modus</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {SKIN_MODES.map(m => <button key={m.id} onClick={() => setSkinMode(m.id)} style={btn(skinMode === m.id)}>{m.label}</button>)}
                  </div>
                  <label style={cL}>Skin-Thema</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => setSelectedTheme("random")} style={btn(selectedTheme === "random")}>🎲 Zufällig</button>
                    {SKIN_THEMES.filter(t => t.id !== "all").map(t => <button key={t.id} onClick={() => setSelectedTheme(t.id)} style={btn(selectedTheme === t.id)}>{t.icon} {t.name}</button>)}
                  </div>
                </div>
              )}

              {/* Filter */}
              <div style={{ marginBottom: 12 }}>
                <button onClick={() => setShowFilter(v => !v)} style={btn(showFilter)}>🚫 Filter {showFilter ? "ausblenden" : "anzeigen"}{excludedCount > 0 ? ` (${excludedCount} ausgeschlossen)` : ""}</button>
                {showFilter && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 12, color: "#6a5030", marginBottom: 10 }}>Antippen = ausschliessen (durchgestrichen). Die Auswahl bleibt gespeichert.</div>
                    {[["cat", "Waffenkategorien", WEAPON_CATEGORIES], ["weapon", "Genaue Waffen", WEAPONS_EXACT], ["style", "Spielweisen", [...PLAYSTYLES, ...customStyles]], ["chat", "Chat-Regeln", [...CHAT_RULES, ...customChat]], ["role", "Rollen", ROLES]].map(([kind, label, list]) => (
                      <div key={kind} style={{ marginBottom: 12 }}>
                        <label style={cL}>{label}</label>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {list.map(item => {
                            const off = (excl[kind] || []).includes(item);
                            return <button key={item} onClick={() => toggleExcl(kind, item)} style={{ ...btn(off), fontSize: 10, padding: "5px 10px", textDecoration: off ? "line-through" : "none" }}>{item}</button>;
                          })}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setExcl({ cat: [], weapon: [], style: [] })} style={btn(false)}>Filter zurücksetzen</button>
                  </div>
                )}
              </div>

              {/* Eigene Challenges */}
              <div>
                <button onClick={() => setShowCustom(v => !v)} style={btn(showCustom)}>✨ Eigene Challenges {showCustom ? "ausblenden" : "hinzufügen"}{customStyles.length + customGroups.length + customChat.length > 0 ? ` (${customStyles.length + customGroups.length + customChat.length})` : ""}</button>
                {showCustom && (
                  <div style={{ marginTop: 14 }}>
                    <label style={cL}>Eigene Spielweise</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <input value={newStyle} onChange={e => setNewStyle(e.target.value)} placeholder="z. B. Nur rückwärts laufen" style={{ ...inputStyle, textAlign: "left", flex: "1 1 220px", width: "auto" }} />
                      <button onClick={() => { const t = newStyle.trim(); if (t) { setCustomStyles(prev => [...prev, t]); setNewStyle(""); } }} style={btn(false)}>＋ Hinzufügen</button>
                    </div>
                    {customStyles.map((s, i) => (
                      <div key={i} style={{ fontFamily: "'IM Fell English', serif", fontSize: 13, color: "#a09060", marginBottom: 4 }}>
                        {s} <button onClick={() => setCustomStyles(prev => prev.filter((_, idx) => idx !== i))} title="Entfernen" style={{ background: "transparent", border: "none", color: "#5a4030", cursor: "pointer", fontSize: 15 }}>×</button>
                      </div>
                    ))}
                    <label style={{ ...cL, marginTop: 14 }}>Eigene Chat-Regel</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <input value={newChat} onChange={e => setNewChat(e.target.value)} placeholder="z. B. Nur in Haiku sprechen" style={{ ...inputStyle, textAlign: "left", flex: "1 1 220px", width: "auto" }} />
                      <button onClick={() => { const t = newChat.trim(); if (t) { setCustomChat(prev => [...prev, t]); setNewChat(""); } }} style={btn(false)}>＋ Hinzufügen</button>
                    </div>
                    {customChat.map((s, i) => (
                      <div key={i} style={{ fontFamily: "'IM Fell English', serif", fontSize: 13, color: "#a09060", marginBottom: 4 }}>
                        💬 {s} <button onClick={() => setCustomChat(prev => prev.filter((_, idx) => idx !== i))} title="Entfernen" style={{ background: "transparent", border: "none", color: "#5a4030", cursor: "pointer", fontSize: 15 }}>×</button>
                      </div>
                    ))}
                    <label style={{ ...cL, marginTop: 14 }}>Eigene Gruppenchallenge</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Name" style={{ ...inputStyle, textAlign: "left", flex: "1 1 140px", width: "auto" }} />
                      <input value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Beschreibung" style={{ ...inputStyle, textAlign: "left", flex: "2 1 220px", width: "auto" }} />
                      <button onClick={() => { const n = newGroupName.trim(); if (n) { setCustomGroups(prev => [...prev, { name: n, desc: newGroupDesc.trim() }]); setNewGroupName(""); setNewGroupDesc(""); } }} style={btn(false)}>＋ Hinzufügen</button>
                    </div>
                    {customGroups.map((g, i) => (
                      <div key={i} style={{ fontFamily: "'IM Fell English', serif", fontSize: 13, color: "#a09060", marginBottom: 4 }}>
                        ✨ {g.name}{g.desc ? ` – ${g.desc}` : ""} <button onClick={() => setCustomGroups(prev => prev.filter((_, idx) => idx !== i))} title="Entfernen" style={{ background: "transparent", border: "none", color: "#5a4030", cursor: "pointer", fontSize: 15 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {rollBtn(rolling, roll, "⚔  Challenge würfeln", "Schicksal wird gewürfelt...")}

            {/* Karte & Boss */}
            {mapResult && !rolling && (
              <div style={{ background: "rgba(180,80,20,0.08)", border: "1px solid rgba(180,80,20,0.5)", borderRadius: 4, padding: "16px 22px", marginBottom: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 26 }}>🗺</div>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#b45014", textTransform: "uppercase", marginBottom: 4 }}>Karte & Boss</div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(13px, 3vw, 18px)", color: "#f0d8a0" }}>{mapResult.map} · {mapResult.boss}</div>
                  <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 11, color: "#6a5030", marginTop: 4 }}>Nicht jeder Boss gibt es auf jeder Karte – bei Bedarf einfach neu würfeln.</div>
                </div>
              </div>
            )}

            {/* Group Challenge */}
            {(displayGroup || (rolling && includeGroup)) && (
              <div style={{ background: rolling ? "rgba(10,7,4,0.5)" : "rgba(180,80,20,0.08)", border: `1px solid ${rolling ? "rgba(180,80,20,0.15)" : "rgba(180,80,20,0.5)"}`, borderRadius: 4, padding: "18px 24px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 16, animation: rolling ? "none" : "fadeIn 0.5s ease forwards", position: "relative", overflow: "hidden" }}>
                {!rolling && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 0% 50%, rgba(180,80,20,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />}
                <div style={{ fontSize: 26, flexShrink: 0, opacity: rolling ? 0.3 : 1 }}>{displayGroup?.icon || "🎲"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Shield /><div style={{ fontSize: 9, letterSpacing: "0.3em", color: rolling ? "#4a3020" : "#b45014", textTransform: "uppercase" }}>Gruppenchallenge</div></div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(13px, 3vw, 18px)", color: rolling ? "#3a2a14" : "#f0d8a0", marginBottom: 5 }}>{displayGroup?.name || "—"}</div>
                  <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: "clamp(11px, 2vw, 13px)", color: rolling ? "#3a2a14" : "#a09060", lineHeight: 1.5 }}>{displayGroup?.desc || ""}</div>
                  {!rolling && groupChallenge && (
                    <div style={{ marginTop: 10 }}>
                      <button onClick={markGroupDone} disabled={groupDone} style={{ ...smallBtn, opacity: groupDone ? 0.6 : 1 }}>{groupDone ? "✓ Punkte gebucht" : `✓ Gruppe geschafft (+${1 + groupBonus(groupChallenge)} für alle)`}</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Player Cards */}
            {display && (
              <div style={cardGrid}>
                {display.map((ch, i) => (
                  <div key={i} style={{ background: "rgba(10,7,4,0.7)", border: "1px solid rgba(180,80,20,0.35)", borderRadius: 4, padding: "20px 18px", position: "relative", boxShadow: rolling ? "none" : "0 0 24px rgba(180,80,20,0.15)", animation: rolling ? "none" : "fadeIn 0.4s ease forwards", opacity: rolling ? 0.6 : 1 }}>
                    <div style={{ position: "absolute", top: 7, right: 9, color: "rgba(180,80,20,0.3)", fontSize: 9 }}>✦</div>
                    <div style={{ position: "absolute", bottom: 7, left: 9, color: "rgba(180,80,20,0.3)", fontSize: 9 }}>✦</div>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#b45014", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}><Crosshair />{activePlayers[i]?.name}</div>

                    <div style={{ marginBottom: ch.playstyle || ch.traitResult || ch.chat || ch.role || ch.skin ? 12 : 0 }}>
                      <div style={sL}>🔫 Waffen{rerollBtn(i, "weapon")}<span style={{ marginLeft: 10, color: "#b45014" }}>{ch.wtotal}/{ch.cap} Ausrüstungspunkte</span></div>
                      <div style={{ fontFamily: "'IM Fell English', serif", fontSize: "clamp(13px, 2.5vw, 16px)", color: "#e8d0a0", lineHeight: 1.3 }}>{ch.weapon}</div>
                    </div>

                    {ch.playstyle && (
                      <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", paddingTop: 10, marginBottom: ch.traitResult ? 10 : 0 }}>
                        <div style={sL}>🎮 Spielweise{rerollBtn(i, "playstyle")}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: "clamp(11px, 2vw, 13px)", color: "#a09060", lineHeight: 1.4 }}>{ch.playstyle}</div>
                      </div>
                    )}

                    {ch.skin && (
                      <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", paddingTop: 10, marginBottom: 10 }}>
                        <div style={sL}>🎭 Skin{rerollBtn(i, "skin")}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontSize: "clamp(12px, 2vw, 14px)", color: "#e8d0a0", lineHeight: 1.4 }}>{ch.skin}</div>
                      </div>
                    )}

                    {ch.chat && (
                      <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", paddingTop: 10, marginBottom: 10 }}>
                        <div style={sL}>💬 Chat-Regel{rerollBtn(i, "chat")}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: "clamp(11px, 2vw, 13px)", color: "#a09060", lineHeight: 1.4 }}>{ch.chat}</div>
                      </div>
                    )}

                    {ch.role && (
                      <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", paddingTop: 10, marginBottom: 10 }}>
                        <div style={sL}>🧭 Rolle{rerollBtn(i, "role")}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: "clamp(11px, 2vw, 13px)", color: "#a09060", lineHeight: 1.4 }}>{ch.role}</div>
                      </div>
                    )}

                    {ch.traitResult && (
                      <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", paddingTop: 10 }}>
                        <div style={{ ...sL, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>⚡ Traits{rerollBtn(i, "traits")}</span>
                          <span style={{ color: "#b45014" }}>{ch.traitResult.spent}/{traitBudget} Pkt.</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {ch.traitResult.traits.map((t, ti) => (
                            <div key={ti} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ fontFamily: "'IM Fell English', serif", fontSize: 13, color: "#e8c080" }}>{t.de ? `${t.de} (${t.name})` : t.name}</span>
                                <span style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 10, color: "#6a5030", marginLeft: 6 }}>{t.desc}</span>
                              </div>
                              <span style={{ fontSize: 10, color: "#b45014", flexShrink: 0, marginLeft: 4 }}>{t.cost}P</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!rolling && (
                      <div style={{ borderTop: "1px solid rgba(180,80,20,0.15)", marginTop: 12, paddingTop: 10 }}>
                        {challengeBonus(ch) > 0 && <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#8a6a40", marginBottom: 8 }}>⭐ Schwierigkeits-Bonus +{challengeBonus(ch)}</div>}
                        <button onClick={() => markDone(i)} disabled={done[i]} style={{ ...smallBtn, opacity: done[i] ? 0.6 : 1 }}>{done[i] ? "✓ Punkte gebucht" : `✓ Geschafft (+${1 + challengeBonus(ch)})`}</button>
                        {rerollLimit > 0 && rerollLimit < 99 && <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#5a4030", marginTop: 8 }}>Rerolls: {used[i] || 0}/{rerollLimit}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {challenges && !rolling && (
              <div style={{ textAlign: "center", marginTop: 18 }}>
                {copyBtn("challenge", () => challengeText(activePlayers, challenges, groupChallenge, mapResult, traitBudget))}
              </div>
            )}
            {!display && !rolling && <div style={{ textAlign: "center", padding: "36px 20px", color: "#3a2a18", fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 14, border: "1px dashed rgba(180,80,20,0.1)", borderRadius: 4 }}>Drücke den Knopf – das Bayou entscheidet euer Schicksal.</div>}
          </>
        )}

        {/* ═══ VERLAUF (Challenge + Skin) ═══ */}
        {tab === "challenge" && history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <button onClick={() => setShowHistory(v => !v)} style={btn(showHistory)}>📜 Verlauf {showHistory ? "ausblenden" : "anzeigen"} ({history.length})</button>
            {showHistory && (
              <div style={{ marginTop: 14 }}>
                {history.map(h => (
                  <div key={h.t} style={{ ...panel, padding: "12px 16px", marginBottom: 10 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#8a6a40", marginBottom: 6 }}>{new Date(h.t).toLocaleString("de-CH")} · {h.title}</div>
                    <div style={{ whiteSpace: "pre-wrap", fontFamily: "'IM Fell English', serif", fontSize: 13, color: "#a09060", lineHeight: 1.5 }}>{h.text}</div>
                    <button onClick={() => copyText(h.text, () => flashCopied("h" + h.t))} style={{ ...smallBtn, marginTop: 8 }}>{copied === "h" + h.t ? "✓ Kopiert" : "📋 Kopieren"}</button>
                  </div>
                ))}
                <button onClick={() => { if (window.confirm("Verlauf wirklich löschen?")) setHistory([]); }} style={btn(false)}>🗑 Verlauf löschen</button>
              </div>
            )}
          </div>
        )}

        {tab === "score" && <ScoreBoard players={players} playerCount={playerCount} scores={scores} log={scoreLog} onAdd={addScore} onUndo={undoScore} onReset={resetScores} />}
        {tab === "turnier" && <TurnierZaehler />}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:#4a3820} *{box-sizing:border-box}`}</style>
    </div>
  );
}
