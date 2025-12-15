# Portfolio World (Next.js + Three.js)

Produktionsreifes Grundgerüst für die neue Portfolio-Welt. Die App nutzt den Next.js App Router, rendert eine rohe
Three.js-Welt (kein r3f) und trennt Engine/Scenes/Systems/UI sauber nach dem vereinbarten Architekturplan.

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
* `http://localhost:3000/world` → Vollbild-3D-Welt (Hub + AI Room Teleport)

### Behobenes Problem: Kamera-Ziel `null`

* Ursache: Der Player lieferte Kamera-Ziele als `{ cameraPos, lookAt }`, während die Szenen `{ camPos, look }` erwarteten.
* Fix: Ab Version `0.0.004` exportiert `Player.getCameraTargets()` konsistente Keys, wodurch der Fehler `Cannot read properties of null (reading 'look')` verschwindet.
* Hinweis: Falls der Fehler noch im laufenden Dev-Server erscheint, bitte kurz neu starten (`npm run dev`) und den Cache der Seite aktualisieren.

## Controls (World)

* Bewegung: `WASD` / Pfeiltasten
* Sprint: `Shift`
* Teleport in AI Room: `Enter` (im Hub)
* Zurück zum Hub: `Backspace` oder `Esc` (im AI Room)

## Nächste Schritte

* Effektpipeline (EffectComposer, Bloom, DoF) ergänzen
* Weitere Scenes (Energy, Trading) anlegen und anbinden
* Assets (Modelle/Texturen) in `public/assets` einhängen
