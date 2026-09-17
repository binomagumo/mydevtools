# DevToolset UX Contract

## Product behavior

- Anonymous users enter through the default JSON formatter and can navigate to any tool from the sidebar, mobile drawer, or command search.
- Each tool owns one explicit operation. The primary button uses the operation verb and becomes busy without changing size. Duplicate activation is blocked while the request is pending.
- Tool input is preserved on failure. Errors are inline, text-based, actionable, and announced to assistive technology. Successful output remains available for copying.
- Clear resets input, output, validation state, and error state for the current tool only.
- Tool routes are independently bookmarkable and use the title format `{Tool} — DevToolset`.

## Navigation and overlays

- Desktop navigation is a persistent sidebar; narrow navigation is an app-owned modal drawer.
- Command search is an app-owned modal dialog. `Ctrl/Cmd+K` opens it, Escape closes the topmost overlay, Tab stays within the overlay, and focus returns to the trigger after close.
- Search is local and immediate. A non-empty query has an explicit clear button and an accessible name.

## Accessibility target

The target is WCAG 2.2 AA for native semantics, visible focus, accessible names, keyboard operation, live status/error feedback, responsive reflow, and reduced motion. Screenshot review alone is insufficient; browser keyboard and screen-reader checks remain release evidence.

## Privacy and data handling

- Tool inputs are sent only to the API required for the requested transformation.
- The API does not persist tool content. Operational logs must exclude request bodies, JWTs, secrets, and tool output.
- The privacy page must describe transit, operational metadata, retention configuration, and a contact path without promising legal guarantees the implementation cannot prove.
