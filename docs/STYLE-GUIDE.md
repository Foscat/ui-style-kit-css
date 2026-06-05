# Choosing a UI Style

| UI style | Best for |
|---|---|
| Minimal SaaS | Dashboards, admin tools, SaaS apps, documentation, internal systems |
| Bento UI | Landing pages, portfolio sections, feature pages, product showcases |
| Maximalist / Playful | Creators, entertainment brands, events, bold client sites |
| Bauhaus / Swiss Modern | Agencies, artists, editorial pages, design-forward brands |
| Tactile / Skeuomorphic | Premium sites, distinctive client interfaces, control-panel metaphors |
| Neumorphism | Soft dashboards, experimental UI, visual demos |
| Retrofuturism | Futuristic product pages, portfolios, technology showcases |
| Brutalism | Bold landing pages, anti-template websites, creative brands |
| Cyberpunk | Security, gaming, encryption, developer demos, nightlife/tech branding |
| Y2K | Nostalgic, playful, music/fashion/event sites |
| Retro Glass | Futuristic premium apps, glass dashboards, hero sections |
Use `data-mode="contrast"` for high-contrast variants and pair it with semantic HTML for best accessibility outcomes.


## Visual regression baseline

The repository includes optional Playwright visual smoke checks:

```bash
npm install
npm run test:visual
```

Run visual tests before major releases or after large CSS refactors.
