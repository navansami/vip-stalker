# FTP · The Guest Collection

A Next.js App Router application with a dimensional guest card gallery, a live-preview modal editor, MongoDB Atlas persistence and Cloudinary photographs.

## Run

Requires Node.js 20.9+ (Node 22 LTS recommended).

```sh
npm install
cp .env.example .env.local
# Fill in the five variables in .env.local
npm run dev
```

Open http://localhost:3000. The interface works without credentials; loading/saving requires Atlas and uploading requires Cloudinary. Missing connections show an explicit message; completed cards are saved to Atlas. Unfinished work is automatically backed up in this browser’s local storage.

## Connect services

1. Create a MongoDB Atlas database user with read/insert/update access to your database. The `/clear` administration page requires the database user to have `remove` permission on the `cards` collection; dropping collections is not required. Allow your deployment's IP in Atlas Network Access and copy the connection string to `MONGODB_URI`. URL-encode special characters in the password. Set `MONGODB_DB` to the database name.
2. Copy your Cloudinary cloud name, API key and API secret from the Cloudinary dashboard. The key must have create/upload permission in the selected product environment and access to the `ftp-stalker` folder; a successful API ping alone does not establish upload permission. Uploads are server-side, signed by the SDK, stored in `ftp-stalker`, limited to JPEG/PNG/WebP and 8 MB. Secrets never enter the client bundle.
3. Restart the server after editing environment variables.

## Behaviour

- All original fields, editable title following the main name, a single arrival/departure calendar with hover range preview, night count and keyboard navigation, up to ten photographs with names and relationships, single-click clipboard paste, double-click file upload, Ctrl+V / ⌘V paste on focused photo boxes, and 2× PNG export.
- Required creator/editor name, immutable creation attribution, edit timestamps and full snapshots in each MongoDB document's `history` array.
- Unfinished new cards and edits are saved to browser local storage as you type. Close confirmation offers “Keep editing” or “Close & keep draft”; recovery buttons restore drafts after closing or refreshing. Successful saves clear only that card’s draft.
- Reloading or leaving with active unsaved changes triggers the browser’s standard warning when supported. Draft recovery is limited to the same browser and origin; clearing browser data removes backups. If browser storage is unavailable, drafts remain in memory and the interface reports that limit.
- Optimistic revision checking prevents overwriting concurrent edits, including recovered drafts.
- Photographs can be removed from a guest while retaining their name and relationship. Accompanying guest slots can also be removed; the principal guest slot is kept. Changes appear in the live preview and draft and are committed with Save changes. Removing a photograph detaches it from the card; Cloudinary originals remain available for historical revisions.
- No individual saved-card deletion or permanent Cloudinary asset deletion API. The `/clear` administration page can permanently delete every card after server-side hotel code verification and explicit confirmation. Configure `HOTEL_CLEAR_CODE` in the server environment (never a `NEXT_PUBLIC_` variable). GET requests do not delete data; `/api/clear` accepts POST only. Successful deletion also removes draft backups from the browser used to clear the collection; other browsers retain their local drafts. Cloudinary assets are preserved.
- 3D perspective browsing, keyboard arrows, grid view, search, animated empty state, responsive modal, reduced-motion support.
- Existing localStorage cards in the old app are not automatically migrated; the old app stores them in its own origin's browser storage.

## Check and deploy

```sh
npm run typecheck
npm test
npm run build
npm start
```

Deploy to Vercel or another Node.js-compatible Next.js host; configure the same environment variables there and allow its network access in Atlas. Use a stable outbound IP or provider-supported Atlas networking configuration.

This version captures operator names as entered; it does not authenticate them. Host behind your team's access control before exposing real guest information. Public deployments should add authenticated users and per-user upload rate limits before use. Route handlers enforce same-origin browser mutations; this is not a replacement for authentication.

Fonts use Google Fonts with local system fallbacks. All visual depth is CSS; no WebGL dependency is required.

## WhatsApp and social previews

The root page includes Open Graph and Twitter large-image metadata, a generated 1200×630 PNG at `/opengraph-image`, and favicon assets from the FTP phonebook. The share image contains no real guest information. Set `SITE_URL` to the application's public HTTPS address in the deployment environment before building. Without it, metadata links default to `http://localhost:3000`, which WhatsApp cannot fetch. The HTML, image and favicon must be publicly reachable for WhatsApp's crawler. Existing WhatsApp previews may remain cached after changes.

## Indexing and caching

Every page declares `noindex`, `nofollow`, `noarchive`, `nosnippet` and `noimageindex`. All routes include `X-Robots-Tag`; `robots.txt` disallows all crawling. App pages and the OG image render dynamically, and responses request no browser or CDN storage. Next.js may still cache immutable framework assets that contain no guest records.

These directives do not enforce privacy or erase existing copies. Google cannot read a page’s noindex directive if robots.txt blocks crawling; URLs already known to a search engine may require removal in its webmaster tools. Cloudinary delivery URLs and this app’s APIs still require access controls if the application is public. WhatsApp may cache share previews independently. Browser draft recovery and MongoDB/Cloudinary persistence remain enabled as application features. Use authenticated access to restrict who can retrieve guest data.
