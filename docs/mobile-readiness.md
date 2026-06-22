# Mobile Readiness

Step 14 focused on mobile browser readiness before adding Capacitor. The app keeps the existing HuMANity visual identity and uses small responsive fixes rather than a redesign.

## Pages And Components Audited

- Auth gates and signed-out prompts.
- Home and landing content.
- Navigation-adjacent shared surfaces, including dialogs and sheets.
- Profile display and profile edit.
- Search, users, connections, and messages.
- World Dinner Table community flow.
- Explore, country discovery, live map, globe, and humanity timeline.
- Legal/support/compliance surfaces added in earlier app-store work.
- Report, block, and account deletion controls.

## Fixes Made

- Removed the `maximum-scale=1` viewport setting so users can pinch zoom.
- Added global horizontal overflow protection and disabled fixed background attachment on mobile screens to reduce iOS scroll jank.
- Bounded shared dialogs and alert dialogs to the mobile viewport with internal scrolling.
- Made sheets scrollable on short mobile screens.
- Increased tap targets for connection, report/block, profile edit, messaging, dinner table, and filter controls.
- Improved mobile wrapping for profile action buttons, report/block controls, connection cards, request actions, and profile edit actions.
- Reduced phone-size padding on large glass panels where content could feel cramped.
- Made the connections tab bar horizontally scrollable on narrow screens instead of squeezing all tabs.
- Improved messages on phones with a taller mobile chat panel, wider message bubbles, smaller scroll padding, and safe-area padding for the composer.
- Adjusted live map heading sizes, container padding, globe mobile height caps, and globe overlay text so the 3D surface fits shorter screens.
- Tuned landing, explore, timeline, and dinner table type, padding, buttons, and horizontally scrolling timeline cards for phone widths.

## Remaining Mobile Risks

- The globe pages still depend on WebGL, external globe assets, and device GPU performance. Real iOS and Android testing is still required.
- Clerk auth flows need validation in Safari, Chrome on Android, and later inside Capacitor webviews.
- Image uploads need real-device testing with camera roll/photo picker behavior after Capacitor is added.
- Messaging should be checked on phones with the virtual keyboard open.
- App-store compliance flows are present, but reporting, blocking, and account deletion still need end-to-end QA against production services.

## Manual Browser Device Checklist

- Test at 320px, 375px, 390px, 414px, 430px, and a small Android landscape viewport.
- Confirm no page creates horizontal document scrolling.
- Sign in and sign out through Clerk.
- Open the home page, explore page, timeline, dinner table, profile, profile edit, connections, messages, live map, privacy, terms, and support pages.
- Check that all primary buttons are easy to tap and text does not overlap.
- Open report/block controls and account deletion request UI.
- Open dialogs and sheets on short mobile heights and confirm content scrolls.
- Start a message thread, type a long message, and check the composer with the virtual keyboard open.
- Upload or replace a profile image in browser device mode, then repeat later on real devices.
- Open the live globe and confirm it renders, fits, and degrades gracefully if WebGL fails.

## Pre-Capacitor Checklist

- Frontend typecheck passes.
- Frontend production build passes with `PORT` and `BASE_PATH` set.
- Backend typecheck and build still pass.
- Set `VITE_API_BASE_URL` to the deployed backend URL for mobile builds.
- Confirm Clerk allowed origins and redirect URLs for deployed web and future mobile webviews.
- Confirm storage provider configuration and CORS for direct browser/mobile uploads.
- Run real-device QA after Capacitor is added.
