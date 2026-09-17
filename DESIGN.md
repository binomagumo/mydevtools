---
version: alpha
name: "DevToolset"
description: "A quiet, high-contrast developer workbench for quick transformations and inspection."
colors:
  background: "#09090B"
  sidebar: "#0C0C0F"
  panel: "#111114"
  panelElevated: "#151519"
  border: "#24242A"
  foreground: "#F4F4F5"
  secondary: "#A1A1AA"
  muted: "#A1A1AA"
  accent: "#7C3AED"
  success: "#22C55E"
  error: "#EF4444"
  warning: "#F59E0B"
typography:
  sans:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  mono:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  page-max: "87.5rem"
  shell-header: "3.5rem"
  tool-gap: "1rem"
components:
  button:
    height: "2.25rem"
    radius: "0.375rem"
  panel:
    radius: "0.5rem"
    border: "#24242A"
  dialog:
    maxWidth: "40rem"
---

# DevToolset Design System

## Overview

### Creative North Star

DevToolset is a compact terminal-side workbench translated into the browser: quiet surfaces, monospaced output, and one violet instrument light that marks the active operation. It should feel like a dependable utility already open beside a code editor, not a marketing dashboard.

### Product context and register

- **Audience and primary job:** Developers who need a fast, anonymous place to format, inspect, encode, hash, or generate values.
- **Target market(s) and evidence:** Global English-first public utility; the current routes and copy are English and there is no locale provider.
- **Locale(s) and language policy:** English UI with system fallbacks; avoid locale-sensitive claims until localization is added.
- **Usage scene:** Desktop-first beside an editor, with a usable narrow mobile layout for quick checks and copy/paste tasks.
- **Register:** Product utility.
- **Memorable signature:** The active violet edge marker and restrained instrument-panel surfaces.
- **Restraint:** Inputs, outputs, recovery copy, and keyboard focus must stay familiar and legible.
- **Anti-references:** Avoid neon-heavy hacker clichés, card-grid dashboards, decorative gradients, and opaque error states.
- **Token ownership/runtime mapping:** This file mirrors the canonical CSS variables in `DevToolsetFrontend/app/globals.css`; changes to these values must update both files in the same change.

## Colors

The near-black background and layered panel colors establish depth without shadows. Foreground and secondary text preserve a strong reading hierarchy; muted text is reserved for labels and hints. Violet is expressive and interactive, while green, amber, and red are semantic only. Focus uses the accent color with a visible outline. The system currently has one dark theme; forced-colors and reduced-motion behavior must remain browser-operable.

## Typography

The system sans stack provides a compact neutral face for navigation and explanations without requiring a network font fetch during production builds. A system monospaced stack is reserved for tool input, output, and technical values. Controls use sentence case and direct verbs. Long values wrap rather than truncate, and errors remain readable at narrow widths.

## Layout

The shell uses a sticky 56px header, a persistent 230px desktop sidebar, and a document-scrolling main region. Tool content is capped at 1400px with responsive 16/24/40px horizontal padding. Dual input/output panels collapse to one column below the large breakpoint. Inputs and outputs reserve comparable panel height so async feedback does not move primary actions.

## Elevation & Depth

Hierarchy comes from tonal layers and 1px borders rather than ornamental shadows. The elevated panel is used for dialogs, command search, and focused controls. Sticky chrome may use backdrop blur, but tool content stays flat and quiet.

## Shapes

Controls use compact 6px rounding; panels use 8px rounding. Borders are thin and low-contrast. Icon containers are square with the same panel border language. No pill shapes are used for core controls.

## Components

### Foundational visual states

Every interactive control has hover, focus-visible, active/pressed, disabled, and busy states. Loading keeps button geometry stable. Inline errors use a red border/tint plus text and an assertive live region; successful validation uses green plus text, never color alone.

### Buttons and actions

Solid violet is the primary action. Secondary actions use an elevated panel and border. Ghost actions are reserved for shell controls. Copy, clear, encode/decode, and generate keep their verbs consistent across tools.

### Navigation and data display

The sidebar and mobile drawer are the canonical tool navigation. Search is an app-owned command dialog with keyboard access, clear behavior, no-results copy, Escape dismissal, focus containment, and focus restoration.

### Forms and overlays

Tool editors are native textareas with `resize: none`, sufficient height, explicit accessible names, and app-owned error feedback. Dialogs and drawers are modal overlays with accessible names, Escape behavior, focus containment, scroll lock, and trigger focus restoration.

### Iconography

Lucide icons use a consistent 16–20px stroke treatment. Icon-only controls always have an accessible label; text remains visible for primary tool actions.

### Motion

Motion is limited to color/opacity transitions for interaction feedback. Reduced-motion users receive the same state changes without transitions.

### Content and data visualization

Copy is direct and operational: name the operation, explain the failure, and tell the user what to correct. Submitted values and secrets never appear in logs or telemetry.

## Do's and Don'ts

- **Do:** Keep the tool surface quiet so input, output, and recovery copy dominate.
- **Do:** Treat keyboard focus and copy/paste as first-class interaction paths.
- **Don't:** Hide critical state in color, hover, or transient notifications.
- **Don't:** Add decorative dashboard chrome that competes with the transformation task.
