# Lumana Demo App

An Angular-based demo that showcases three core capabilities: instant search with live filtering, efficient rendering for very long lists, and a canvas playground to sketch and transform shapes.

## Tech Stack
- Angular — application framework for the web
- NgRx — predictable state management for Angular
- RxJS — reactive programming utilities used throughout the app

## Highlights
- Instant search
  - Results update while you type
  - Flexible filters to narrow the result set
- Virtualized lists
  - Handles thousands of items smoothly using virtual scrolling
- Interactive canvas
  - Create and manipulate shapes: draw, pick, move, and rotate
  - Adjust colors via a built-in palette


## Development scripts
- npm start — run the development server (ng serve)
- npm run build — create a production build
- npm test — execute unit tests
- npm run lint — check code style with ESLint
- npm run format — format sources with Prettier

## Notes
- A development proxy (proxy.conf.json) may be used for API calls.
- Use an up-to-date LTS version of Node.js and npm for best results.
