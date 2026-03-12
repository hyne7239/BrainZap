#!/usr/bin/env node
// validate-questions.js — Run before deploying to catch all common errors
// Usage: node validate-questions.js
// Exit code: 0 = clean, 1 = errors found

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "src", "questions");
const VALID_DIFF = new Set(["easy", "medium", "hard"]);

let errors = 0;
let warnings = 0;
let total = 0;
const allIds = new Set();
const allQuestions = [];

const files = readdirSync(DIR).filter(f => f.endsWith(".json")).sort();

console.log(`\n🔍 Validating question bank in ${DIR}\n`);

for (const file of files) {
  const path = join(DIR, file);
  let questions;

  try {
    questions = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`❌ [${file}] INVALID JSON: ${e.message}`);
    errors++;
    continue;
  }

  if (!Array.isArray(questions)) {
    console.error(`❌ [${file}] Root must be a JSON array`);
    errors++;
    continue;
  }

  let fileErrors = 0;
  const diffCounts = { easy: 0, medium: 0, hard: 0 };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const ref = `[${file}][${i}] id=${q.id}`;
    total++;

    // Required fields present
    for (const field of ["id", "difficulty", "question", "options", "correct", "explanation"]) {
      if (q[field] === undefined || q[field] === null || q[field] === "") {
        console.error(`  ❌ ${ref}: missing/empty field "${field}"`);
        errors++; fileErrors++;
      }
    }

    // Unique IDs
    if (q.id) {
      if (allIds.has(q.id)) {
        console.error(`  ❌ ${ref}: DUPLICATE id "${q.id}"`);
        errors++; fileErrors++;
      } else {
        allIds.add(q.id);
      }
    }

    // Difficulty value
    if (q.difficulty && !VALID_DIFF.has(q.difficulty)) {
      console.error(`  ❌ ${ref}: invalid difficulty "${q.difficulty}" — must be easy/medium/hard`);
      errors++; fileErrors++;
    } else if (q.difficulty) {
      diffCounts[q.difficulty]++;
    }

    // Options array
    if (!Array.isArray(q.options)) {
      console.error(`  ❌ ${ref}: options must be an array`);
      errors++; fileErrors++;
    } else if (q.options.length !== 4) {
      console.error(`  ❌ ${ref}: options must have exactly 4 items (got ${q.options.length})`);
      errors++; fileErrors++;
    } else {
      // Check each option is a non-empty string
      q.options.forEach((opt, oi) => {
        if (typeof opt !== "string" || opt.trim() === "") {
          console.error(`  ❌ ${ref}: options[${oi}] is empty or not a string`);
          errors++; fileErrors++;
        }
      });
    }

    // Correct index
    if (typeof q.correct !== "number" || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) {
      console.error(`  ❌ ${ref}: "correct" must be integer 0–3 (got ${q.correct})`);
      errors++; fileErrors++;
    } else if (Array.isArray(q.options) && q.options[q.correct] === undefined) {
      console.error(`  ❌ ${ref}: options[${q.correct}] does not exist`);
      errors++; fileErrors++;
    }

    // Warn about very short explanations
    if (q.explanation && q.explanation.length < 20) {
      console.warn(`  ⚠️  ${ref}: explanation seems very short (${q.explanation.length} chars)`);
      warnings++;
    }

    allQuestions.push({ ...q, _file: file });
  }

  const status = fileErrors === 0 ? "✅" : "❌";
  const diffStr = `easy:${diffCounts.easy} medium:${diffCounts.medium} hard:${diffCounts.hard}`;
  console.log(`${status} ${file.padEnd(24)} ${String(questions.length).padStart(3)} questions  ${diffStr}`);
}

// Summary
console.log(`\n${"─".repeat(60)}`);
console.log(`📊 Summary`);
console.log(`   Files:     ${files.length}`);
console.log(`   Questions: ${total}`);
console.log(`   Easy:      ${allQuestions.filter(q=>q.difficulty==="easy").length}`);
console.log(`   Medium:    ${allQuestions.filter(q=>q.difficulty==="medium").length}`);
console.log(`   Hard:      ${allQuestions.filter(q=>q.difficulty==="hard").length}`);
if (warnings > 0) console.log(`   ⚠️  Warnings: ${warnings}`);

if (errors > 0) {
  console.error(`\n❌ ${errors} error(s) found. Fix before deploying.\n`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${total} questions are valid. Safe to build and deploy.\n`);
}
