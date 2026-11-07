# Valadão & Reis — labor law landing page

A landing page for a **fictional** labor-law firm in Curitiba, Brazil, with a simple severance (rescisão) calculator based on Brazilian CLT rules. All names, numbers and addresses are made up. The calculator is a simplified estimate (no income tax, social security, overtime averages or collective agreements) and is not legal advice.

**Live demo:** https://alissonlittig.github.io/valadao-trabalhista/

| Desktop | Mobile (390px) |
|---|---|
| ![desktop](docs/desktop.png) | ![mobile](docs/mobile.png) |

## Features
- Severance calculator: salary balance, notice period (30 days + 3 per year, max 90), proportional 13th salary, vacation + 1/3, FGTS fine (40%, or 20% for mutual agreement).
- Four termination types: without cause, resignation, mutual agreement, for cause.
- Fully client-side; the contact form is a simulation and sends nothing.
- Self-hosted variable fonts, responsive down to 390px, keyboard-friendly, reduced-motion aware.

## Stack
Vite + React, Vitest for the calculation logic, GitHub Actions deploying to GitHub Pages.

## Run
```
npm ci
npm test
npm run dev
npm run build
```
