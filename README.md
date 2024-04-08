# Media & Lifestyle Apps

### Ordnerstruktur

```
media-lifestyle-apps/
|
├── README.md
├── package.json
├── node_modules/
├── .angular/
├── .firebase/
├── .gitignore
├── ...
|
├── dist/
|   ├── recipes/
|   ├── series-movies/
|   └── ...
|
├── projects/
|   ├── recipes/
|   ├── series-movies/
|   └── ...
|
└── shared/
    ├── models/
    ├── pipes/
    ├── services/
    ├── styles/
    ├── utils/
    └── ...
```

### Projekte

- Entertainment (Serien, Filme)
- Ernährung (Rezepte, Einkäufe, Einkaufsliste, ...)
- _Sport_\* (Joggen, Wetter ...)

### Projekte starten

```ps
npm run start-recipes
npm run start-media
```

### Localhost veröffentlichen

```ps
npm run publish-recipes
npm run publish-media
```

### Projekte bauen

```ps
npm run build-recipes
npm run build-media
```

### Projekte mit Firestore veröffentlichen

```ps
npm run deploy-recipes
npm run deploy-media
```

# Commit Nachrichten

### Struktur

```js
[PREFIX_1] PREFIX_2: Kurze Beschreibung

- ggf. mehr Beschreibung
- und noch mehr
```

### Projektbezogene Prefixe

Wenn verwendet, dann als `PREFIX_1`

- `[SHARED]`: Alle Projekte
- `[MEDIA]`: Filme & Serien
- `[REZEPTE]`: Rezepte

### Allgemeine Prefixe

Wenn verwendet, dann als `PREFIX_1`, falls bereits `PREFIX_1` gesetzt als `PREFIX_2`

- `[CLEANUP]`: Cleanups
- `[REF]`: Refactorings
- `[PROJ]`: Projektstruktur / Allgemeines
- `[DOKU]`: Dokumentation
- `[CICD]`: CI/CD Pipelines
- `[IMPORT]`: Import von Daten
- `[TEST]`: Tests

&nbsp;

---

\*Geplante Apps
