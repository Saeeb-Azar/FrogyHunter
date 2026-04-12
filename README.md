# Froggy Hunt

Modernes **Hidden-Object**-Webspiel (React + Vite + TypeScript): Finde alle versteckten Froggys im Bild. Premium-Dark-UI mit Neon-Lime-Akzenten, Framer Motion, optional Firebase (Auth, Firestore, Storage) – mit **Mock-Fallback**, wenn keine `.env` gesetzt ist.

## Schnellstart

```bash
cd FroggySmile
npm install
npm run dev
```

Ohne Firebase: Starte die App und nutze auf der Login-Seite **„Demo starten“**. Unter **Einstellungen** kannst du den **lokalen Admin-Modus** aktivieren und `/admin` öffnen.

## Firebase einrichten

1. Projekt in der [Firebase Console](https://console.firebase.google.com/) anlegen.
2. **Authentication** → Sign-in method → **Google** aktivieren (nur Sign-In, kein Gmail-API-Zugriff).
3. **Firestore** und **Storage** anlegen (Standard-Region ist ok).
4. Web-App registrieren und Config-Werte kopieren.
5. Im Projektroot eine `.env` anlegen – Vorlage: `.env.example` oder `src/config/firebase.env.placeholder.txt`.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=
# optional:
VITE_ADMIN_UIDS=firebaseUid1,firebaseUid2
```

6. **Admin-Zugriff:** In Firestore Dokument `admins/{uid}` mit Feld `role: "admin"` anlegen (`uid` = Firebase Auth User ID). Alternativ `VITE_ADMIN_UIDS` setzen.

### Firestore Collections (Überblick)

| Collection       | Dokument-ID        | Wichtige Felder |
|-----------------|--------------------|-----------------|
| `users`         | `{uid}`            | `name`, `email`, `photoURL`, `createdAt`, optional `preferences` |
| `userProgress`  | `{uid}__{levelId}` | `uid`, `levelId`, `startedAt`, `completedAt`, `durationMs`, `clicks`, `misses`, `foundFroggys`, `completed` |
| `levels`        | auto               | `title`, `imageUrl`, `status` (`draft`/`published`), `publishAt`, `frogCount`, `createdAt`, `updatedAt` |
| `levelMarkers`  | `{levelId}`        | `levelId`, `markers: [{ id, x, y, radius }]`, `updatedAt` |
| `admins`        | `{uid}`            | `role`: `admin` |
| `levelStats`    | `{levelId}`        | optional Aggregation: `completions`, `totalDurationMs`, `totalClicks` (wird bei Abschluss inkrementiert) |

**Hinweis:** Für Produktion unbedingt [Security Rules](https://firebase.google.com/docs/firestore/security/get-started) für Firestore und Storage definieren (z. B. nur authentifizierte Leser für veröffentlichte Level, Schreiben nur für Admins).

## Routing

| Pfad | Beschreibung |
|------|----------------|
| `/` | Lobby |
| `/login` | Google / Demo |
| `/play` | Aktuelles Level |
| `/history` | Natur-Pfad / Zeitleiste |
| `/settings` | Ton, Theme, Motion |
| `/info` | Spielinfos |
| `/admin` | Admin-Home (geschützt) |
| `/admin/levels` | Level-Liste |
| `/admin/levels/new` | Neues Level + Upload |
| `/admin/levels/:id` | Editor (Marker) |
| `/admin/levels/:id/preview` | Test mit Spiel-Logik |

## Koordinaten / Hit-Test

- `x`, `y`: 0–1 relativ zur **linken oberen Ecke** des Bildes (Breite/Höhe).
- `radius`: 0–1 relativ zur **Anzeige-Breite** des Bildes (gleiche Logik wie im Spiel-Hit-Test).

## Sound

Dateien unter `src/assets/audio/` ablegen und in `src/audio/soundManager.ts` in `paths` eintragen.

## Build

```bash
npm run build
npm run preview
```

## Tech-Stack

React 19, Vite 8, TypeScript, React Router 7, Firebase 12, Framer Motion, Zustand (Settings + `persist`).
