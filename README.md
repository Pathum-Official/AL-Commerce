# PTM Prime — A/L Commerce Learning Suite 🎓
> Sri Lanka's Premier Digital Learning Platform for G.C.E. Advanced Level Commerce Stream (Accounting, Business Studies, Economics).  
> **A flagship community initiative by PTM Prime.**

---

## ⚡ Tech Stack & Architecture
- **Frontend Core:** React 18 + Vite (SPA Architecture)
- **Styling:** Custom CSS Design System (Dark/Light mode, Glassmorphism, Micro-animations)
- **Mobile Experience:** Native mobile-first responsive layout with Bottom Navigation Bar & Touch Drawers
- **AI Engine:** Google Gemini Multi-Key Rotation Pool with OCR Handwritten Answer Grading
- **Deployment Ready:** GitHub + Vercel / Netlify (`npm run build`)

---

## 🚀 Running Locally & Deployment
```bash
# Install dependencies
npm install

# Start local development server (Vite)
npm run dev
# -> Local server running at http://localhost:5173/

# Build production bundle for Vercel / GitHub
npm run build
# -> Production bundle generated in dist/
```

---

## 📚 Core Subjects Covered
1. **Accounting (ගිණුම්කරණය)** — Units 01 - 16 (444 Videos, Master Notes, Syllabuses)
2. **Business Studies (ව්‍යාපාර අධ්‍යයනය)** — Units 01 - 18 (694 Videos, 115 Theory Parts, Textbooks)
3. **Economics (ආර්ථික විද්‍යාව)** — Units 01 - 12 (567 Videos, PPC Seminars, Past MCQ Packs)

---

## 📁 ගොනු ව්‍යුහය සහ වර්ගීකරණය (System Architecture & Hierarchy)

```text
AL-Commerce/
├── syllabuses/                               # නිල විෂය නිර්දේශ (Official Syllabuses)
│   ├── accounting-syllabus.pdf
│   ├── business-studies-syllabus.pdf
│   └── economics-syllabus.pdf
│
├── past-papers/                              # පසුගිය විභාග ප්‍රශ්න පත්‍ර එකතුව (90 Files, 377.95 MB)
│   ├── accounting/                           # ගිණුම්කරණය (2010 - 2026)
│   │   ├── al-accounting-2010-sinhala.pdf to al-accounting-2026-sinhala.pdf
│   │   ├── english/                          # English Medium Past Papers
│   │   └── tamil/                            # Tamil Medium Past Papers
│   │
│   ├── business-studies/                     # ව්‍යාපාර අධ්‍යයනය (2010 - 2026)
│   │   ├── al-business-studies-2010-sinhala.pdf to al-business-studies-2026-sinhala.pdf
│   │   ├── english/                          # English Medium Past Papers
│   │   └── tamil/                            # Tamil Medium Past Papers
│   │
│   └── economics/                            # ආර්ථික විද්‍යාව (2010 - 2026 + Marking Schemes)
│       ├── al-economics-2010-sinhala.pdf to al-economics-2026-sinhala.pdf
│       ├── al-economics-2020-sinhala-marking.pdf
│       ├── al-economics-2021-sinhala-mcq-answers.jpg
│       ├── english/                          # English Medium Past Papers
│       └── tamil/                            # Tamil Medium Past Papers
│
└── notes/                                    # පාඩම් මාලා සහ කෙටි සටහන් (194 Files, 894 MB)
    ├── accounting/                           # ගිණුම්කරණය
    │   ├── lesson-notes/                     # ඒකක අනුව සවිස්තරාත්මක සටහන්
    │   │   ├── unit-01-need-and-scope-of-accounting/
    │   │   ├── unit-02-accounting-equations/
    │   │   ├── unit-04-prime-entry-books/
    │   │   ├── unit-05-accounting-concepts/
    │   │   ├── unit-06-sole-proprietorships/
    │   │   ├── unit-07-manufacturing-cost-statements/
    │   │   ├── unit-08-incomplete-records/
    │   │   ├── special-topics/ (අගරු චෙක්පත්)
    │   │   └── english-medium/
    │   └── short-notes/                      # Mind Maps, Process, Double Entry, BEP, Full Short Notes
    │
    ├── business-studies/                     # ව්‍යාපාර අධ්‍යයනය
    │   ├── lesson-notes/                     # සම්පූර්ණ පාඩම් 18 (115 Parts + Comprehensive Textbooks)
    │   │   ├── grade-12/ (Lessons 01 - 11)
    │   │   └── grade-13/ (Lessons 12 - 18)
    │   └── short-notes/                      # ඒකක 01 - 13 Short Notes + Full Short Note
    │
    └── economics/                            # ආර්ථික විද්‍යාව
        ├── lesson-notes/                     # ඒකක 01 - 12 සම්පූර්ණ සටහන්, PPC Seminars, MCQ Packs
        │   ├── unit-01-basic-economic-concepts/
        │   ├── unit-02-demand-supply-elasticity-equilibrium/
        │   ├── unit-03-taxes-subsidies-price-controls/
        │   ├── unit-04-production-theory-market-structures/
        │   ├── unit-05-national-accounting/
        │   ├── unit-06-macroeconomic-equilibrium/
        │   ├── unit-07-money-and-price-levels/
        │   ├── unit-08-public-finance/
        │   ├── unit-09-foreign-trade/
        │   ├── unit-10-foreign-finance/
        │   ├── unit-11-contemporary-data/
        │   └── unit-12-population-structure-policies/
        └── short-notes/                      # ඒකක 01 - 09 Short Notes, Book 2, Full Short Notes
```

---

## 🏷️ නාමකරණ සම්මුතිය (Naming Conventions)

- **ප්‍රශ්න පත්‍ර:** `al-[subject]-[year]-[medium].pdf` (උදා: `al-accounting-2023-sinhala.pdf`)
- **ලකුණු දීමේ පටිපාටි:** `al-[subject]-[year]-[medium]-marking.pdf` (උදා: `al-economics-2020-sinhala-marking.pdf`)
- **පාඩම් කොටස්:** `bs-g[grade]-l[lesson]-p[part]-[title].pdf`
- **සවිස්තරාත්මක සටහන්:** `[subject]-unit-[num]-[topic].pdf`
- **කෙටි සටහන්:** `unit-[num]-[topic]-short-note.pdf` හෝ `[subject]-full-short-note.pdf`

---

## 📊 ඩිජිටල් පුස්තකාල සාරාංශය (Grand Summary)

| කාණ්ඩය (Category) | ගොනු ගණන | ධාරිතාව (Size) | ආවරණය (Coverage) |
| :--- | :---: | :---: | :--- |
| **පසුගිය ප්‍රශ්න පත්‍ර (Past Papers)** | **90** | **377.95 MB** | 2010 - 2026 (Sinhala, English, Tamil) |
| **පාඩම් සටහන් (Lesson Notes)** | **156** | **830.40 MB** | විෂයයන් 3 ම සියලු ඒකක සහ සම්පූර්ණ පොත් |
| **කෙටි සටහන් (Short Notes & Mind Maps)** | **38** | **63.63 MB** | විෂයයන් 3 ම සියලු ඒකකවල කෙටි සටහන් |
| **නිල විෂය නිර්දේශ (Syllabuses)** | **3** | **1.14 MB** | Accounting, BS, Economics |
| **මුළු එකතුව (Grand Total)** | **287 ගොනු** | **~1.27 GB** | **100% Validated Data Integrity** |
