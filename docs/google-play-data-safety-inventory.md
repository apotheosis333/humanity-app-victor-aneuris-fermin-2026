# Google Play Data Safety Inventory

Date: 2026-07-30

This inventory maps the current Android app, backend, database schema, and
production service providers to Google Play Data Safety categories. It contains
no credentials or private user data. It is a technical inventory, not legal
advice.

## Current Providers

- Clerk: authentication, user identifiers, sessions, and account security.
- Railway: backend hosting, PostgreSQL, request handling, and operational logs.
- Cloudflare R2/S3-compatible storage: profile photo objects.
- OpenAI: generated Walk in Their Shoes narratives and generated world-news
  content. User-selected country, age, gender, and occupation can be sent for
  the narrative request; the app does not store that prompt as a user record.
- Google Play/Android WebView: app distribution and platform runtime.

## Play Data Types

| Play category | Select | App evidence | Primary purposes |
| --- | --- | --- | --- |
| Approximate location | Conservative yes | Clerk/hosting receive network data that can include IP-derived location; no native location permission exists | Security, fraud prevention, service operation |
| Precise location | No | No location permission, GPS API, or precise-location field | Not used |
| Name | Yes | Profile display name and optional Clerk name | App functionality, personalization, account management |
| Email address | Yes | Clerk account, account mapping, optional profile email | Authentication, account management, security |
| User IDs | Yes | Clerk user ID throughout account, profile, connection, message, report, and block records | Authentication, app functionality, security |
| Address | No | No postal-address field | Not used |
| Phone number | No | Phone authentication and phone profile fields are not enabled | Not used |
| Race and ethnicity | Conservative yes | Optional cultural-background profile field may contain this information | User profile and personalization |
| Political or religious beliefs | No explicit collection | Country content includes public cultural facts, but the user profile has no explicit belief field | Not used as user data |
| Sexual orientation | No | No profile field | Not used |
| Other personal info | Yes | Username, bio, country, languages, interests, books, music, profile-song metadata, and optional AI narrative inputs | App functionality and personalization |
| User payment info, purchase history, credit score, other financial info | No | No billing, ads, purchases, or financial features | Not used |
| Health and fitness data | No | No health features or health fields | Not used |
| Emails | No | The app does not read or store users' email messages | Not used |
| SMS or MMS | No | No SMS permission or messaging integration | Not used |
| Other in-app messages | Yes | Direct-message body, sender, recipient, and timestamps | User communication and safety |
| Photos | Yes | User-selected profile photo uploaded to R2/S3-compatible storage | Profile functionality and personalization |
| Videos | No user upload | Country video URLs are public content, not user-collected video | Not used as user data |
| Voice or sound recordings | No | No microphone permission or recording flow | Not used |
| Music and audio files | No file collection | Users may save profile-song metadata/URLs, but do not upload an audio file | Not used as an uploaded file |
| Files and docs | No | No document upload flow | Not used |
| Calendar | No | No calendar permission or integration | Not used |
| Contacts | No | No contacts permission or integration | Not used |
| App interactions | Yes | Connections, countries explored, pledges, reactions, saves, blocks, reports, and humanity score | App functionality, personalization, safety |
| In-app search history | No persistent collection | Country/member searches are not stored as history | Not used |
| Installed apps | No | No package inventory access | Not used |
| Other user-generated content | Yes | Profile bio and attributes, dinner answers, report reasons/details, and other submitted social content | App functionality, community, moderation |
| Web browsing history | No | The app does not collect browsing history | Not used |
| Crash logs | No app crash SDK observed | No Sentry, Firebase Crashlytics, or equivalent app crash SDK is installed | Not collected by the developer app |
| Diagnostics | Conservative yes | Backend, Clerk, Railway, and storage providers process operational/error metadata | Reliability and security |
| Other app performance data | No explicit collection | No performance-monitoring SDK is installed | Not used |
| Device or other IDs | Yes | Clerk sessions and platform/network security metadata | Authentication, fraud prevention, security |

## Collection And Sharing

- The app collects required data types because they are transmitted from the
  device to Clerk, the Railway backend/PostgreSQL, R2, or OpenAI.
- Production endpoints use HTTPS, and direct R2 uploads use signed HTTPS URLs.
- The current proposed Play answer is that data is not sold and is not shared
  for advertising.
- Transfers to Clerk, Railway, R2, and OpenAI are intended as service-provider
  processing for app functionality. Whether each transfer qualifies for
  Google's service-provider sharing exemption must be confirmed against the
  final provider agreements before submission.

## Required And Optional Data

- Account identifiers are required for signed-in social functionality.
- Profile fields beyond display name are optional and user-controlled.
- Messages, connections, photos, reports, blocks, pledges, reactions, and
  dinner answers are optional feature use.
- AI narrative inputs are optional and used only when the user requests that
  feature.

## Retention And Deletion

- Users can request account deletion in the app or at the public Data Deletion
  URL.
- The operational target is completion within 30 days after a verified request,
  unless legal, fraud-prevention, security, or moderation retention applies.
- The current implementation records deletion requests for manual review; it
  does not yet automatically erase every PostgreSQL row, Clerk account, R2
  object, provider log, or moderation record.
- Provider log-retention periods and the final moderation retention schedule
  remain owner/legal confirmation items.

## Submission Gate

Before submitting Data Safety, confirm:

1. Service-provider sharing exemptions for Clerk, Railway, Cloudflare R2, and
   OpenAI.
2. Provider log-retention periods.
3. Whether IP-derived approximate location should remain selected.
4. Whether cultural background should remain disclosed as race and ethnicity.
5. The final retention rule for reports, blocks, and abuse-prevention records.
