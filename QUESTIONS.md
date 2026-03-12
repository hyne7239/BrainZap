# BrainZap — Question Bank Developer Guide

> **Who this guide is for:** Anyone who wants to add, edit, delete, or restructure trivia questions — no coding background required for content changes.  
> **What you will never need to touch:** `src/App.jsx`, `nginx.conf`, `Dockerfile`, `docker-compose.yml`, or any build tooling.

---

## Table of Contents

1. [How the Question System Works](#1-how-the-question-system-works)
2. [File Structure](#2-file-structure)
3. [Question Format](#3-question-format)
4. [Difficulty Guidelines](#4-difficulty-guidelines)
5. [Step-by-Step: Adding Questions](#5-step-by-step-adding-questions)
6. [Step-by-Step: Editing Questions](#6-step-by-step-editing-questions)
7. [Step-by-Step: Adding a New Category](#7-step-by-step-adding-a-new-category)
8. [Validation Checklist](#8-validation-checklist)
9. [Deployment Procedure](#9-deployment-procedure)
10. [Automated Validation Script](#10-automated-validation-script)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. How the Question System Works

The app is **100% offline**. There is no AI, no external API, no database. All questions live in plain JSON files that are bundled into the app at build time.

```
User opens browser
    ↓
nginx serves the pre-built React app (HTML + JS + JSON, all static files)
    ↓
Browser loads question bank from bundled JSON (no network request)
    ↓
App randomly selects questions from the local pool
```

When you change a question file, you must rebuild and redeploy the Docker container for the change to take effect. The rebuild is a single command and takes ~60 seconds.

---

## 2. File Structure

```
src/
└── questions/
    ├── index.js         ← Aggregator: registers all categories (edit this to add new categories)
    ├── geography.json   ← 60 questions (20 easy, 20 medium, 20 hard)
    ├── science.json     ← 60 questions
    ├── history.json     ← 60 questions
    ├── sports.json      ← 60 questions
    ├── music.json       ← 60 questions
    ├── movies.json      ← 60 questions
    ├── technology.json  ← 60 questions
    ├── food.json        ← 60 questions
    ├── animals.json     ← 60 questions
    └── math.json        ← 60 questions
```

**Rule:** Each `.json` file is a flat array of question objects. That's all it is — no nesting, no special structure.

---

## 3. Question Format

Every question must follow this exact format:

```json
{
  "id":          "geo_m_21",
  "difficulty":  "medium",
  "question":    "Which country has the most UNESCO World Heritage Sites?",
  "options":     ["France", "China", "Spain", "Italy"],
  "correct":     3,
  "explanation": "Italy has 58 UNESCO World Heritage Sites, the most of any country."
}
```

### Field Reference

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | string | ✅ | Unique across ALL files. Format: `{prefix}_{difficulty_code}_{number}`. See table below. |
| `difficulty` | string | ✅ | Must be exactly `"easy"`, `"medium"`, or `"hard"` (lowercase) |
| `question` | string | ✅ | The question text. End with `?`. Max ~200 chars for readability. |
| `options` | array | ✅ | Exactly **4 strings**. Must include the correct answer. |
| `correct` | integer | ✅ | **Zero-based index** of the correct answer in `options`. Must be `0`, `1`, `2`, or `3`. |
| `explanation` | string | ✅ | 1–3 sentences explaining why the answer is correct. Shown after answering. |

### ID Prefix Table

| Category file | Prefix | Example ID |
|---|---|---|
| `geography.json` | `geo` | `geo_e_21` |
| `science.json` | `sci` | `sci_m_21` |
| `history.json` | `his` | `his_h_21` |
| `sports.json` | `spo` | `spo_e_21` |
| `music.json` | `mus` | `mus_m_21` |
| `movies.json` | `mov` | `mov_h_21` |
| `technology.json` | `tec` | `tec_e_21` |
| `food.json` | `foo` | `foo_m_21` |
| `animals.json` | `ani` | `ani_h_21` |
| `math.json` | `mat` | `mat_e_21` |

**ID format breakdown:** `{prefix}_{e|m|h}_{sequential_number}`
- `e` = easy, `m` = medium, `h` = hard
- Number should be the next available integer for that difficulty (check the file to find the highest)

---

## 4. Difficulty Guidelines

### 🟢 Easy
- Target audience: ages 10+ or general knowledge
- Single well-known fact
- The correct answer should be recognizable even with limited expertise
- Wrong options are plausible but clearly distinct
- Examples: capitals of major countries, basic science facts, famous historical events

### 🟡 Medium  
- Requires genuine knowledge or 2-step reasoning
- Correct answer not immediately obvious
- Wrong options are credible and require some thought to eliminate
- Examples: less-famous capitals, secondary details of historical events, scientific processes

### 🔴 Hard
- Requires expertise, deep research, or multi-step reasoning
- Correct answer may surprise even knowledgeable people
- All 4 options are plausible to someone with medium knowledge
- Examples: obscure historical figures, specialist scientific terminology, advanced math

---

## 5. Step-by-Step: Adding Questions

### Step 1 — Open the right file

Navigate to `src/questions/` and open the JSON file for the relevant category.

### Step 2 — Find the correct section

Questions are grouped by difficulty (easy → medium → hard). Find the group matching your question's difficulty and locate the last item in that group.

### Step 3 — Determine the next ID

Look at the last ID in your difficulty section. If the last easy question is `geo_e_20`, your new one is `geo_e_21`.

### Step 4 — Write your question object

```json
{
  "id":          "geo_e_21",
  "difficulty":  "easy",
  "question":    "What is the capital of Portugal?",
  "options":     ["Porto", "Braga", "Coimbra", "Lisbon"],
  "correct":     3,
  "explanation": "Lisbon (Lisboa) is Portugal's capital and largest city, situated on the Tagus River estuary."
}
```

> ⚠️ **Critical**: Count carefully. `"correct": 3` means `options[3]` = `"Lisbon"`. It is zero-indexed: 0=Porto, 1=Braga, 2=Coimbra, 3=Lisbon.

### Step 5 — Add it to the array

Add a comma after the previous last item, then append your new question. The file must remain valid JSON.

**Before:**
```json
  {
    "id": "geo_e_20",
    ...last question...
  }
]
```

**After:**
```json
  {
    "id": "geo_e_20",
    ...last question...
  },
  {
    "id": "geo_e_21",
    "difficulty": "easy",
    "question": "What is the capital of Portugal?",
    "options": ["Porto", "Braga", "Coimbra", "Lisbon"],
    "correct": 3,
    "explanation": "Lisbon (Lisboa) is Portugal's capital and largest city."
  }
]
```

### Step 6 — Validate the JSON

Run the validation script (see [Section 10](#10-automated-validation-script)) or paste the file content into [jsonlint.com](https://jsonlint.com) to check for syntax errors.

### Step 7 — Deploy

Follow the [Deployment Procedure](#9-deployment-procedure).

---

## 6. Step-by-Step: Editing Questions

### Fixing a wrong answer (most common edit)

1. Open the relevant JSON file
2. Find the question by its `id` or by searching for part of the question text
3. Fix either:
   - The `correct` index (if you pointed to the wrong option), **or**
   - The `options` array (if an option contained a typo), **or**
   - The `explanation` text
4. **Never change a question's `id`** — this could break deduplication if you add a new question with the same counter

### Fixing a typo in the question text

Simply edit the `"question"` field. No other field needs to change.

### Changing difficulty level

1. Change `"difficulty"` to `"easy"`, `"medium"`, or `"hard"`
2. Update the `id` to match the new difficulty code: `geo_e_21` → `geo_m_21`
3. Move the question object to the appropriate section of the file (easy block, medium block, or hard block) — this is optional but keeps the file organized

---

## 7. Step-by-Step: Adding a New Category

This requires one small code change in `index.js`.

### Step 1 — Create the question file

Create `src/questions/yourcategory.json` following the same format. Choose a 3-letter prefix that doesn't conflict with existing ones (see table in Section 3).

Minimum recommendation: **30 questions** (10 per difficulty) so the game can always fill a 20-question session from a single category.

### Step 2 — Register it in `index.js`

Open `src/questions/index.js` and make two additions:

**Add the import at the top:**
```javascript
import yourcategory from "./yourcategory.json";
```

**Add an entry to the CATEGORIES array:**
```javascript
{ id: "yourcategory", label: "Your Category", emoji: "🎯", color: "#FF5722", questions: yourcategory },
```

Choose any emoji and any hex color. Colors are used for the category chip in the setup screen.

That's it. The rest of the app picks up the new category automatically — no changes to `App.jsx` needed.

### Step 3 — Deploy

Follow the [Deployment Procedure](#9-deployment-procedure).

---

## 8. Validation Checklist

Before deploying, verify every new or changed question satisfies all of these:

- [ ] **ID is unique** — search the entire `src/questions/` folder for this ID string; it should appear only once
- [ ] **`correct` index is accurate** — manually count: `options[correct]` is the right answer
- [ ] **Exactly 4 options** — count the strings in `"options"` array
- [ ] **`difficulty` is lowercase** — `"easy"`, `"medium"`, or `"hard"` (not `"Easy"`, not `"MEDIUM"`)
- [ ] **JSON is valid** — no missing commas, no trailing commas after the last item, all strings quoted
- [ ] **All 4 options are factually correct statements as distractors** — wrong answers must be plausible but genuinely wrong, not contain false statements that could mislead learners
- [ ] **Explanation is accurate** — fact-check the explanation independently
- [ ] **No duplicate questions** — search for the core fact or phrase to make sure it isn't already asked differently elsewhere

---

## 9. Deployment Procedure

All changes require a container rebuild. The app is statically compiled — question files are bundled at build time.

### Standard rebuild (recommended)

```bash
# From the directory containing docker-compose.yml
docker compose up -d --build
```

This command:
1. Rebuilds the Docker image from scratch (installs npm deps, runs `npm run build` to bundle all JSON into static JS)
2. Replaces the running container with the new image
3. Starts the container in the background

The app will be briefly unavailable (~30–60 seconds) during the rebuild.

### Verify the deployment

```bash
# Check the container is running
docker compose ps

# Check the logs for any errors
docker compose logs brainzap

# Open in browser
open http://localhost:3444
```

### Rolling back a bad deployment

If the new build has errors and the container fails to start:

```bash
# See what went wrong
docker compose logs brainzap

# If you need to roll back to the previous image
docker compose down
git checkout -- src/questions/   # if using git, restores the last committed state
docker compose up -d --build
```

### Development mode (for testing before deploying)

If you have Node.js installed locally, you can test changes instantly without Docker:

```bash
npm install          # only needed once
npm run dev          # starts dev server at http://localhost:5173
```

Changes to `.json` files are reflected immediately on save thanks to Vite's hot module reload.

---

## 10. Automated Validation Script

Save this as `validate-questions.js` in the project root and run it with `node validate-questions.js` before deploying.

```javascript
#!/usr/bin/env node
// validate-questions.js — Run before deploying to catch common errors
const fs   = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "src", "questions");
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
let errors = 0;
let total  = 0;
const allIds = new Set();

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".json"));

files.forEach(file => {
  const filePath = path.join(DIR, file);
  let questions;

  try {
    questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(`❌ INVALID JSON in ${file}: ${e.message}`);
    errors++;
    return;
  }

  if (!Array.isArray(questions)) {
    console.error(`❌ ${file}: root element must be an array`);
    errors++;
    return;
  }

  questions.forEach((q, i) => {
    const ref = `${file}[${i}] id=${q.id}`;
    total++;

    // Required fields
    ["id","difficulty","question","options","correct","explanation"].forEach(field => {
      if (q[field] === undefined || q[field] === null || q[field] === "") {
        console.error(`❌ ${ref}: missing or empty field "${field}"`);
        errors++;
      }
    });

    // Unique IDs
    if (allIds.has(q.id)) {
      console.error(`❌ ${ref}: duplicate id "${q.id}"`);
      errors++;
    } else {
      allIds.add(q.id);
    }

    // Difficulty value
    if (!VALID_DIFFICULTIES.has(q.difficulty)) {
      console.error(`❌ ${ref}: invalid difficulty "${q.difficulty}" (must be easy/medium/hard)`);
      errors++;
    }

    // Options length
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      console.error(`❌ ${ref}: options must be an array of exactly 4 items (got ${Array.isArray(q.options)?q.options.length:"non-array"})`);
      errors++;
    }

    // Correct index
    if (typeof q.correct !== "number" || q.correct < 0 || q.correct > 3) {
      console.error(`❌ ${ref}: "correct" must be 0, 1, 2, or 3 (got ${q.correct})`);
      errors++;
    }

    // Correct index points to a real option
    if (Array.isArray(q.options) && q.options[q.correct] === undefined) {
      console.error(`❌ ${ref}: options[${q.correct}] does not exist`);
      errors++;
    }

    // No empty options
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, oi) => {
        if (typeof opt !== "string" || opt.trim() === "") {
          console.error(`❌ ${ref}: options[${oi}] is empty or not a string`);
          errors++;
        }
      });
    }
  });

  console.log(`✅ ${file}: ${questions.length} questions`);
});

console.log(`\n📊 Total: ${total} questions across ${files.length} files`);
if (errors > 0) {
  console.error(`\n❌ ${errors} error(s) found. Fix before deploying.`);
  process.exit(1);
} else {
  console.log(`\n✅ All questions valid. Safe to deploy.`);
}
```

---

## 11. Troubleshooting

### "The container fails to start after my edit"

Almost always a JSON syntax error. Common causes:

| Symptom | Likely Cause | Fix |
|---|---|---|
| `SyntaxError: Unexpected token` | Missing or extra comma | Check the line the error points to |
| `SyntaxError: Unexpected end of JSON` | Missing closing `]` or `}` | Make sure the file ends with `]` |
| Container starts but question is missing | Typo in `difficulty` field (e.g., `"Easy"` instead of `"easy"`) | Lowercase all difficulty values |
| Question shows wrong answer | `correct` index is off by one | Re-count starting from 0 |

### "The new category doesn't appear in the game"

Check that you completed both steps in Section 7:
1. The JSON file exists in `src/questions/`
2. The category is registered in `src/questions/index.js` (both the `import` and the `CATEGORIES` array entry)

### "Running `npm run build` fails"

```bash
docker compose logs brainzap
```

Look for lines containing `error` or `SyntaxError`. The error message will include the filename and line number of the problem.

### "I want to preview my changes before deploying"

If Node.js is available on your machine:
```bash
npm install && npm run dev
```
Vite's dev server will show you changes in real time at `http://localhost:5173`.

---

## Quick Reference Card

```
Add a question:
  1. Open src/questions/{category}.json
  2. Append new object to array with next available ID
  3. Verify correct index (zero-based: 0,1,2,3)
  4. node validate-questions.js
  5. docker compose up -d --build

Edit a question:
  1. Open file, find question by id or text search
  2. Change the field(s)
  3. Verify correct index still valid
  4. node validate-questions.js
  5. docker compose up -d --build

Add a category:
  1. Create src/questions/newcat.json
  2. Add import + entry to src/questions/index.js
  3. node validate-questions.js
  4. docker compose up -d --build

ID format:  {prefix}_{e|m|h}_{number}
            geo_e_21   sci_m_15   his_h_07
correct:    0-indexed position of the right answer in options[]
```
