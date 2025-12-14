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

```bash
npm install
npm run dev
```

* `http://localhost:3000/` → Landing
* `http://localhost:3000/world` → Vollbild-3D-Welt (Hub + AI Room Teleport)

## Controls (World)

* Bewegung: `WASD` / Pfeiltasten
* Sprint: `Shift`
* Teleport in AI Room: `Enter` (im Hub)
* Zurück zum Hub: `Backspace` oder `Esc` (im AI Room)

## Nächste Schritte

* Effektpipeline (EffectComposer, Bloom, DoF) ergänzen
* Weitere Scenes (Energy, Trading) anlegen und anbinden
* Assets (Modelle/Texturen) in `public/assets` einhängen
