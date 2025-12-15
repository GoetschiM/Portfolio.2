# Portfolio World (Next.js + Three.js)

Produktionsreifes Grundgerüst für die neue Portfolio-Welt. Die App nutzt den Next.js App Router, rendert eine Three.js-Welt
ohne r3f und trennt Engine/Scenes/Systems/UI sauber nach dem vereinbarten Architekturplan. Die Hub-Szene ist jetzt ein
chunk-gestreamtes Diorama (3×3 Chunks aktiv), das die Welt um den Spieler verschiebt: zwei begehbare Pfade (Projekte links,
berufliche Timeline rechts), schlanker Avatar-Markierer, sanfte Vignette und Touch-Steuerung.

## Struktur

```
app/
├─ page.tsx          # Landing (Intro + CTA zum World-Routing)
└─ world/page.tsx    # Vollbild-Experience

components/
├─ world/            # Renderer, Camera, Loop, Input
├─ scenes/           # HubScene, AIScene (erste Portierung)
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
* `http://localhost:3000/world` → Vollbild-3D-Welt (schwebender Diorama-Hub + AI Room Teleport)

### Behobenes Problem: Kamera-Ziel `null`

* Ursache: Der Player lieferte Kamera-Ziele als `{ cameraPos, lookAt }`, während die Szenen `{ camPos, look }` erwarteten.
* Fix: Ab Version `0.0.004` exportiert `Player.getCameraTargets()` konsistente Keys, wodurch der Fehler `Cannot read properties of null (reading 'look')` verschwindet.
* Hinweis: Falls der Fehler noch im laufenden Dev-Server erscheint, bitte kurz neu starten (`npm run dev`) und den Cache der Seite aktualisieren.

## Controls (World)

* Bewegung: `WASD` / Pfeiltasten (oder Touch-DPad auf Devices mit `pointer: coarse`)
* Sprint: `Shift`
* Schnell-Sprünge im Hub: `1` Projekte-Pfad, `2` Karriere-Pfad (öffnet auch das CV-Popup), `3` AI-Dock, `4` zurück zum Start
* Teleport in AI Room: `Enter` (im Hub)
* Zurück zum Hub: `Backspace` oder `Esc` (im AI Room)
* Menü oben rechts bleibt immer verfügbar (Portfolio/Projekte/CV/Kontakt)

## Hub-Layout

* Chunk-Streaming: Welt ist in 16×16-Blöcke geteilt, nur ein 3×3-Kreuz wird gerendert; Spieler bleibt zentriert, die Welt
  bewegt sich
* Avatar skaliert als Marker (ca. 50 %) mit weiter herausgezoomter Diorama-Kamera (sanfter Parallax, stabile Übersicht)
* Linker Pfad: vier Projekt-Stationen als echte Setpieces (Glow, Billboard, Pad) entlang einer physischen Spur bei x=-6
* Rechter Pfad: vier Career-Steps als räumliche Timeline auf Spur x=+6
* Zentraler AI-Steg als dritter Track; Vignette bleibt aktiv und weich

## Nächste Schritte

* Echtdatei für `/cv.pdf` anhängen
* Zusätzliche Biome/Scenes (Energy, Trading) anlegen und anbinden
* Post-Processing (Bloom, DoF) aktivieren und Finetuning der Vignette
* Inhalte/Assets für Projekt-Panels und CV-Stationen ausfüllen
