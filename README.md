# Portfolio World (Next.js + Three.js)

Produktionsreifes Grundgerüst für die neue Portfolio-Welt. Die App nutzt den Next.js App Router, rendert eine Three.js-Welt
ohne r3f und trennt Engine/Scenes/Systems/UI sauber nach dem vereinbarten Architekturplan. Die Hub-Szene ist jetzt eine
schwebende Insel im Voxellook: Pools, Klippen, Baumgruppen, Cabin-Setpiece und leuchtende Pfade für Projekte (links) sowie die
Karriere/CV-Spur (rechts). Avatar, Kamera und Touch-Steuerung bleiben erhalten, aber die Welt ist deutlich kompakter und
aufgeräumter.

## Neu (0.0.011)

* Welt-Reset: Insel nach Bild-Referenz aufgebaut (mehrlagige Klippen, Pools, Cabin, leuchtende Pfade) und AI-Raum entfernt.
* Neue Marker & Beschilderung für vier Projekte und vier Karriere-Stationen, inkl. Glow, Billboard und Light-Pads.
* HUD/Overlay neu angeordnet: Controls links oben, Navigation als separate Karte rechts (mobile-friendly Toggle).
* Landing-Intro überarbeitet, damit die neue Insel-Optik und Navigation (Tasten 1–3) sofort klar sind.

## Struktur

```
app/
├─ page.tsx          # Landing (Intro + CTA zum World-Routing)
└─ world/page.tsx    # Vollbild-Experience

components/
├─ world/            # Renderer, Camera, Loop, Input
├─ scenes/           # HubScene
├─ systems/          # OrganicFlow
└─ ui/               # HUD, BubbleHUD, ProofPanel

lib/                 # math, config, state helpers
public/assets/       # Platz für Modelle, Texturen, Audio
```

## Entwicklung

### Node-Version

Die App benötigt Node **>= 18.18** (empfohlen: **20.x**). Mit `nvm` kannst du die passende Version schnell setzen:

```bash
nvm install
nvm use
```

Die `.nvmrc` im Repo zeigt die freigegebene Version.

### Häufiger Fehler: `Unexpected token '?'`

Dieser SyntaxError tritt auf, wenn eine zu alte Node-Version (z. B. 12.x) verwendet wird. Stelle sicher, dass `node -v` mindestens
**18.18** anzeigt und wechsle bei Bedarf mit `nvm use`. Dank `engine-strict` blockiert `npm install` nun automatisch veraltete
Node- oder npm-Versionen.

```bash
npm install
npm run dev
```

* `http://localhost:3000/` → Landing
* `http://localhost:3000/world` → Vollbild-3D-Welt (schwebende Insel)

### Behobenes Problem: Kamera-Ziel `null`

* Ursache: Der Player lieferte Kamera-Ziele als `{ cameraPos, lookAt }`, während die Szenen `{ camPos, look }` erwarteten.
* Fix: Ab Version `0.0.004` exportiert `Player.getCameraTargets()` konsistente Keys, wodurch der Fehler `Cannot read properties
of null (reading 'look')` verschwindet.
* Hinweis: Falls der Fehler noch im laufenden Dev-Server erscheint, bitte kurz neu starten (`npm run dev`) und den Cache der Seite aktualisieren.

## Controls (World)

* Bewegung: `WASD` / Pfeiltasten (oder Touch-DPad auf Devices mit `pointer: coarse`)
* Sprint: `Shift`
* Schnell-Sprünge im Hub: `1` Projekte-Pfad, `2` Karriere/CV-Pfad (öffnet auch das CV-Popup), `3` zurück zum Startplateau
* Menü rechts oben bleibt immer verfügbar (Portfolio/Projekte/CV/Kontakt)

## Hub-Layout

* Schwebende Insel mit mehrlagigen Klippen, Wasserbecken, Cabin und Dock, plus leuchtender Pfad aus Steinen.
* Linker Pfad: vier Projekt-Stationen mit Glow, Billboard und Light-Pads entlang x ≈ -6.6.
* Rechter Pfad: vier Karriere/CV-Stationen entlang x ≈ +6.6.
* Organischer Partikel-Flow über dem Pool (Wind abhängig von Position).

## Nächste Schritte

* Echtdatei für `/cv.pdf` anhängen
* Zusätzliche Biome/Scenes (Energy, Trading) anlegen und anbinden
* Post-Processing (Bloom, DoF) aktivieren und Finetuning der Vignette
* Inhalte/Assets für Projekt-Panels und CV-Stationen ausfüllen
