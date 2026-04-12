# Lastenheft: Mobile Spiel-App (generisch)

**Dokumenttyp:** Anforderungsspezifikation (Lastenheft)  
**Version:** 1.0  
**Stand:** April 2026  
**Gültigkeit:** Vorlage für Casual- bis Midcore-Mobile-Games (iOS / Android); projektspezifisch anpassen.

---

## 1. Zweck und Geltungsbereich

### 1.1 Zweck
Dieses Lastenheft beschreibt **was** eine mobile Spiel-App leisten muss – aus Sicht von Nutzer:innen, Betrieb und Auftraggeber. Es dient als Grundlage für Pflichtenheft, UX-Design, Architektur und Abnahme.

### 1.2 Geltungsbereich
- Native oder **Cross-Platform**-Apps (z. B. React Native, Flutter, Unity) für **Smartphones** (optional Tablets).
- **Nicht** zwingend: PC-Konsolen, reine Web-Spiele (Teilanforderungen übernehmbar).

### 1.3 Begriffe
| Begriff | Bedeutung |
|--------|-----------|
| Client | Installierte App auf dem Gerät |
| Backend | Server-APIs, Datenbanken, LiveOps-Tools |
| IAP | In-App-Käufe |
| LiveOps | Zeitlich begrenzte Events, A/B-Tests, Remote-Config |
| DAU/MAU | Tägliche/monatlich aktive Nutzer:innen |

---

## 2. Ziele und Erfolgskriterien

### 2.1 Geschäftsziele (Beispiele)
- Hohe **Retention** (D1/D7/D30), monetarisierbare Nutzerbasis, niedrige **Churn-Rate**.
- Skalierbarer Betrieb ohne manuellen Eingriff für Standard-Flows.

### 2.2 Produktziele (Beispiele)
- Intuitives **Onboarding** &lt; 2 Minuten bis erster „Erfolgsmoment“.
- **Stabile** Performance auf definierten Mindestgeräten (siehe Nicht-funktional).

### 2.3 Messbare KPIs (Auswahl)
- Crash-Free-Sessions ≥ Zielwert (z. B. 99,5 %).
- Median **Time-to-Interactive** nach Kaltstart ≤ Zielwert.
- Tutorial-Completion-Rate, Level-1-Completion-Rate, Shop-Conversion.

---

## 3. Zielgruppen und Rollen

### 3.1 Primäre Zielgruppe
- Definieren: Alter, Spielerfahrung, Session-Länge, Monetarisierungsbereitschaft.

### 3.2 Rollen im System
| Rolle | Beschreibung |
|-------|--------------|
| Spieler:in | Standardnutzer:in |
| Gast (optional) | Spielen ohne Konto mit Einschränkungen |
| Moderator:in | Chat/Reports bearbeiten |
| Admin | Inhalte, Konfiguration, Support-Tools |
| Analytics/Business | Auswertung, keine direkte Spielinteraktion |

---

## 4. Plattformen und Geräte

### 4.1 Plattformen
- **F-PLAT-01:** Unterstützung **iOS** (min. Version X) und **Android** (min. SDK Y).
- **F-PLAT-02:** Anpassung an **Safe Areas**, Notch, faltbare Displays (wo relevant).
- **F-PLAT-03:** Unterstützung **Hochformat**; Querformat nur wenn konzipiert.

### 4.2 Eingaben
- **F-PLAT-04:** Touch, Multitouch-Gesten gemäß Game Design.
- **F-PLAT-05:** Optional: **Controller**, Tastatur (Tablet/Desktop-Varianten).

### 4.3 Stores
- **F-PLAT-06:** Einreichung **App Store** / **Google Play** inkl. Metadaten, Screenshots, Alterskennzeichnung.
- **F-PLAT-07:** Einhaltung **Store-Richtlinien** (IAP, Lootbox-Hinweise, Datenschutz).

---

## 5. Funktionale Anforderungen – Übersicht

Nachfolgend **modular** – je nach Spiel nicht alle Punkte verpflichtend; im Pflichtenheft als „muss / soll / kann“ priorisieren.

---

## 6. Installation, Start und Update

| ID | Anforderung |
|----|-------------|
| F-INS-01 | Erster Start: Laden aller **kritischen** Assets oder gestaffelter Download mit klarer Warteanzeige. |
| F-INS-02 | **Hotfix-fähig:** Kritische Konfigurationen serverseitig änderbar (Remote Config). |
| F-INS-03 | **App-Updates:** Hinweis bei Pflicht-Update; optionales Update mit Changelog. |
| F-INS-04 | Speicherplatz-Check vor großen Downloads; Abbruch/Wiederaufnahme. |
| F-INS-05 | Integrität geprüfter Pakete (Anti-Tampering wo sinnvoll). |

---

## 7. Konto, Identität und Sicherheit

| ID | Anforderung |
|----|-------------|
| F-ACC-01 | Registrierung/Login per **E-Mail**, **OAuth** (Apple, Google, …) gemäß Store-Vorgaben. |
| F-ACC-02 | **Passwort**-Reset, E-Mail-Verifikation (falls E-Mail-Login). |
| F-ACC-03 | **Account-Verknüpfung** (z. B. Gast → dauerhaftes Konto ohne Fortschrittsverlust). |
| F-ACC-04 | **Abmelden**, **Konto löschen** (DSGVO/Recht auf Löschung), Export personenbezogener Daten (falls Pflicht). |
| F-ACC-05 | **2FA** optional für sensible Konten (Admin getrennt). |
| F-ACC-06 | Sichere Speicherung von Tokens (**Keychain** / **Keystore**); keine Klartext-Passwörter in Logs. |
| F-ACC-07 | **Gerätebindung** / mehrere Geräte: Synchronisation oder explizite Einschränkung dokumentieren. |
| F-ACC-08 | Erkennung **kompromittierter** Sessions (Logout aller Geräte optional). |

---

## 8. Onboarding, Tutorial und Hilfe

| ID | Anforderung |
|----|-------------|
| F-ONB-01 | **Erklärfilm** oder **interaktives Tutorial** für Kernmechanik. |
| F-ONB-02 | Tutorial **überspringbar** oder **wiederholbar** (Einstellungen). |
| F-ONB-03 | Kontextuelle **Tooltips** bei neuen UI-Elementen. |
| F-ONB-04 | **Hilfe-Center**: FAQ, Kontakt Support, Links zu AGB/Datenschutz. |
| F-ONB-05 | **Barrierefreiheit:** verständliche Sprache, ggf. reduzierte Tutorial-Geschwindigkeit. |

---

## 9. Kern-Gameplay

| ID | Anforderung |
|----|-------------|
| F-PLY-01 | Beschreibung der **Spielschleife** (Match, Runde, Level, Run, …) als Pflichtenheft-Detail. |
| F-PLY-02 | **Spielzustände:** Menü, Pause, Spiel läuft, Sieg, Niederlage, Unterbrechung (Telefonanruf). |
| F-PLY-03 | **Pause:** Unterbrechung ohne unfairen Verlust (konfigurierbare Regeln). |
| F-PLY-04 | **Fairness:** deterministische oder servervalidierte Ergebnisse bei Wettkampf. |
| F-PLY-05 | **Anti-Cheat** (je nach Genre): Manipulation von Scores, Zeit, Speicherständen erkennen/eindämmen. |
| F-PLY-06 | **Replay** optional: Wiederholung letzter Züge / Run. |
| F-PLY-07 | **Kinoreifes Feedback:** Animation, Partikel, Kamera-Shake (abschaltbar). |

---

## 10. Level, Welt und Progression

| ID | Anforderung |
|----|-------------|
| F-PRG-01 | **Level-Katalog:** linear, Welt-Karten, oder offene Struktur – inkl. Sperr-/Freischaltlogik. |
| F-PRG-02 | **Schwierigkeitskurve** und ggf. dynamische Anpassung (optional). |
| F-PRG-03 | **Sterne/Bewertung** pro Level (Zeit, Züge, Sammelobjekte). |
| F-PRG-04 | **Checkpoints** / **Fortsetzen** bei langen Sessions (optional). |
| F-PRG-05 | **Neu spielen** abgeschlossener Level ohne Progressionsbruch. |
| F-PRG-06 | **Story** (optional): Dialoge, Cutscenes, überspringbar. |

---

## 11. Meta-Spiel: Wirtschaft, Inventar, Crafting

| ID | Anforderung |
|----|-------------|
| F-META-01 | **Währungen:** Soft-Currency, Hard-Currency (Premium), ggf. Energie/Leben. |
| F-META-02 | **Inventar** mit Kategorien, Sortierung, Detailansicht. |
| F-META-03 | **Shop** (In-Game): Kauf mit Soft/Hard-Currency; Angebote, Bundles. |
| F-META-04 | **IAP:** Produktkatalog, Kaufabwicklung, **Quittung/Restore** (iOS), **Acknowledgement** (Play). |
| F-META-05 | **Booster/Power-Ups:** Erwerb, Aktivierung, Restriktionen (z. B. nicht in bestimmten Modi). |
| F-META-06 | **Crafting/Fusion** (optional): Rezepte, Wartezeiten, sofortige Fertigstellung gegen Premium. |
| F-META-07 | **Tägliche Belohnungen**, **Streak**, Login-Kalender. |
| F-META-08 | **Werbung** (optional): Rewarded Ads, Frequency Capping, Kinderschutz. |

---

## 12. Soziale Funktionen und Community

| ID | Anforderung |
|----|-------------|
| F-SOC-01 | **Freundesliste** / Einladungen über Code, Link oder soziale Plattformen. |
| F-SOC-02 | **Bestenlisten:** global, Freunde, lokal (optional); Anti-Cheat. |
| F-SOC-03 | **Gilden/Clans** (optional): Chat, Ziele, Belohnungen. |
| F-SOC-04 | **Chat:** Text, Moderation, **Report**, Filter, Minderjährigenschutz. |
| F-SOC-05 | **Teilen:** Screenshots, Ergebnisse (OS-Share-Sheet). |
| F-SOC-06 | **PvP** / **Kooperativ** (optional): Matchmaking, Latenz-Handling, Disconnect-Regeln. |

---

## 13. Events, LiveOps und Personalisierung

| ID | Anforderung |
|----|-------------|
| F-LIVE-01 | **Zeitlich begrenzte Events** mit eigenen Regeln und Belohnungstabellen. |
| F-LIVE-02 | **Remote Config:** Parameter (Balancing, Preise, Feature-Flags) ohne App-Update. |
| F-LIVE-03 | **A/B-Tests** (optional): ethisch korrekt, dokumentiert, Auswertung. |
| F-LIVE-04 | **Push-Kampagnen** zu Events (siehe Abschnitt 15). |
| F-LIVE-05 | **Season Pass** / Battle Pass (optional): freie und Premium-Spur. |
| F-LIVE-06 | **Lokalisierung:** mindestens DE/EN oder definierte Sprachen; RTL wo nötig. |

---

## 14. Audio, Haptik und Darstellung

| ID | Anforderung |
|----|-------------|
| F-AUD-01 | **Musik** und **SFX** mit separaten Lautstärkeregler oder Master + Mute. |
| F-AUD-02 | **Stummschaltung** respektiert OS „Stiller Modus“ / Fokusmodi (plattformtypisch). |
| F-AUD-03 | **Haptik** optional, abschaltbar. |
| F-AUD-04 | **Grafikqualität** (Low/Med/High) für schwächere Geräte (optional). |
| F-AUD-05 | **Batterie-/Datensparmodus** reduziert FPS, Effekte oder Asset-Qualität (optional). |

---

## 15. Benachrichtigungen und Kommunikation

| ID | Anforderung |
|----|-------------|
| F-PUSH-01 | **Opt-in** für Push gemäß OS-Richtlinien; granulare Themen (Events, Social, Marketing). |
| F-PUSH-02 | **Lokale Erinnerungen** (z. B. Energie voll) optional. |
| F-PUSH-03 | **In-App Inbox** für Systemnachrichten und Belohnungen. |
| F-PUSH-04 | E-Mail-Newsletter nur mit **Einwilligung** (DSGVO). |

---

## 16. Einstellungen

| ID | Anforderung |
|----|-------------|
| F-SET-01 | Sprache, Ton, Haptik, **Bewegungsreduktion** (Accessibility). |
| F-SET-02 | **Datenschutz:** Einwilligungen Analytics/Marketing verwalten. |
| F-SET-03 | **Konto:** Abmelden, Löschen, Datenexport. |
| F-SET-04 | **Gameplay:** Steuerung, Kamera, Schwierigkeit (falls vorgesehen). |
| F-SET-05 | **Impressum**, AGB, Datenschutzerklärung, Open-Source-Lizenzen. |

---

## 17. Barrierefreiheit und Inklusion

| ID | Anforderung |
|----|-------------|
| F-A11Y-01 | Schriftgröße oder OS-Skalierung berücksichtigen (wo machbar). |
| F-A11Y-02 | Farbblind-Modus oder klare Form-Codierung kritischer UI (optional). |
| F-A11Y-03 | **Reduce Motion:** Animationen reduzieren/deaktivieren. |
| F-A11Y-04 | Screenreader: kritische Screens mit Labels/Hints (mindestens Menüs). |
| F-A11Y-05 | Keine ausschließliche Steuerung über **Zeit** ohne Alternative (wo gesetzlich relevant). |

---

## 18. Offline, Sync und Konflikte

| ID | Anforderung |
|----|-------------|
| F-SYNC-01 | Verhalten bei **keinem Netz:** klar kommunizieren (Banner, graue Buttons). |
| F-SYNC-02 | **Offline-Spielen** nur wenn fachlich erlaubt; sonst Block mit Erklärung. |
| F-SYNC-03 | **Konfliktauflösung** bei mehreren Geräten (Last-Write-Wins vs. serverseitige Merge-Regeln). |
| F-SYNC-04 | **Wiederholung** fehlgeschlagener Requests; Idempotenz für Käufe und Belohnungen. |

---

## 19. Datenschutz, Compliance und Jugendschutz

| ID | Anforderung |
|----|-------------|
| F-LEG-01 | **DSGVO:** Rechtsgrundlagen, AV-Verträge, Speicherfristen, Löschkonzept. |
| F-LEG-02 | **Alterseinstufung** (USK/PEGI/ESRB) und altersgerechte Inhalte/IAP. |
| F-LEG-03 | **COPPA** / Kinderkonten falls Zielgruppe &lt; 16 (eingeschränkte Features, keine personalisierte Werbung ohne Einwilligung Eltern). |
| F-LEG-04 | **Cookie/Tracking**-Hinweise bei WebViews und Analytics. |
| F-LEG-05 | **Lootbox-/Glücksspiel**-Hinweise nach Jurisdiktion. |
| F-LEG-06 | **Sanctions / Region Locking** falls erforderlich. |

---

## 20. Analytics, Crash-Reporting und Support

| ID | Anforderung |
|----|-------------|
| F-ANA-01 | **Events** (Funnel, Economy, Retention) – datenschutzkonform, dokumentiert. |
| F-ANA-02 | **Crash Reporting** mit Symbolication (iOS/Android). |
| F-ANA-03 | **Support-Tickets:** Geräteinformation, User-ID (pseudonymisiert), Log-Export optional. |
| F-ANA-04 | **Feature-Flags** für schrittweise Rollouts. |

---

## 21. Backend, CMS und Administration

| ID | Anforderung |
|----|-------------|
| F-BE-01 | **REST/GraphQL/gRPC** APIs mit Versionierung und Authentifizierung. |
| F-BE-02 | **CMS** oder Admin-UI für Level, Texte, Shop, Events (rollenbasiert). |
| F-BE-03 | **Audit-Log** für kritische Admin-Aktionen. |
| F-BE-04 | **Rate Limiting**, DDoS-Grundschutz. |
| F-BE-05 | **Backups** und Disaster-Recovery-Ziele (RPO/RTO) definieren. |

---

## 22. Sicherheit (technisch)

| ID | Anforderung |
|----|-------------|
| N-SEC-01 | TLS für alle API-Kommunikation; Certificate Pinning optional. |
| N-SEC-02 | Keine Secrets im Client-Bundle; Lizenzschlüssel serverseitig validieren. |
| N-SEC-03 | **OWASP Mobile Top 10** berücksichtigen (Injection, unsichere Datenablage, …). |
| N-SEC-04 | Regelmäßige **Abhängigkeits-Updates** und Schwachstellenscans. |

---

## 23. Performance und Qualität

| ID | Anforderung |
|----|-------------|
| N-PERF-01 | Kaltstart-Zielwert und **Speicherverbrauch**-Obergrenzen pro Geräteklasse. |
| N-PERF-02 | **Frame-Ziel** (z. B. 60 FPS) auf Referenzgeräten; Graceful Degradation. |
| N-PERF-03 | **Akku- und Wärmeentwicklung** im akzeptablen Rahmen bei 30-Min-Session. |
| N-PERF-04 | **Downloadgröße** und **Patchgröße** gemäß Store-Limits und UX-Zielen. |

---

## 24. Test und Abnahme

| ID | Anforderung |
|----|-------------|
| N-QA-01 | Teststrategie: Unit, Integration, E2E, **Store-Review-Checkliste**. |
| N-QA-02 | **Gerätematrix** (Hersteller, OS-Version, RAM). |
| N-QA-03 | **Lokalisierungstest** und **RTL-Layout** (falls relevant). |
| N-QA-04 | Abnahmekriterien pro **Epic/Feature** mit Akzeptanztests verknüpfen. |

---

## 25. Dokumentation und Übergabe

| ID | Anforderung |
|----|-------------|
| N-DOC-01 | Architekturübersicht, API-Dokumentation, Runbooks für Betrieb. |
| N-DOC-02 | **Datenmodell** und Migrationen versioniert. |
| N-DOC-03 | Übergabe an **2nd-Level-Support** mit Eskalationspfaden. |

---

## 26. Priorisierung (MoSCoW – zur Ausfüllung)

| Muss | Soll | Kann | Wird nicht |
|------|------|------|------------|
| (z. B. Login, Kernloop, IAP-Basics) | (z. B. Gilden) | (z. B. AR-Modus) | (z. B. Smartwatch) |

---

## 27. Anhänge (Checkliste für Workshops)

- [ ] Genre und Kernschleife in einem Satz  
- [ ] Monetarisierung: Premium, IAP, Ads, Abo – Kombination  
- [ ] Mindest-Sprachen und Märkte  
- [ ] Wettbewerber-Referenzen (3–5 Apps)  
- [ ] Rechtliche Ansprechpartner:in (Datenschutz, IP)  
- [ ] Launch-Zeitraum und Soft-Launch-Region  

---

**Ende des Lastenhefts.**  
*Nächster Schritt:* Priorisierung MoSCoW, dann **Pflichtenheft** (technische Realisierung, Schnittstellen, Datenfelder, UI-Spezifikation).
