# Design research — platform surfaces (web / PWA / LINE OA / mobile)

**Date:** 2026-11-04  
**Mode:** DESIGN

## Web responsive (default)

Mobile-first breakpoints XS–XL, semantic tokens, wireframe regions, state matrix
(empty/loading/error). Primary kit path.

## PWA

Constraints beyond web: installability, offline shell, safe-area, home-screen icon,
service worker update UX. Design pack must call these out explicitly.

## LINE OA

Not web CSS. Design in Messaging API terms: rich menu tap map, Flex bubble JSON
limits, reply vs push, LIFF for complex forms. Rendering differs by OS/LINE version —
prototype in Flex Message Simulator; test on device.

## Mobile app

Touch targets, platform nav (tab/stack), system typography conventions. Prefer
native patterns over ported web chrome.

## Kit implication

`surfaces:` in OVERVIEW/STATE. Default `web-responsive`. Other surfaces require
`docs/design/<surface>/` packs before UI build on that surface.
