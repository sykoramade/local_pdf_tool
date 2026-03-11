# Executive Summary
_Last updated: 2026-03-11_

## What It Is
A browser-based PDF editor. Users edit text directly in their PDF, preserving the original layout and fonts, then download the result — without uploading their file to any server.

## Who It Serves
People who need to make a quick edit to a PDF (fix a typo, update a date, change a name) and keep hitting paywalls, forced sign-ups, or privacy concerns with existing tools. Primary use cases: lease agreements, invoices, contracts, forms, CVs.

## The Problem It Solves
Every top-ranking PDF tool online uses the same playbook: let the user do all the work, then demand payment at the download button. Files are uploaded to unknown servers. Fonts get destroyed. It's a bad experience deliberately designed to extract money.

## The Differentiator
- **100% in-browser**: files never leave the user's computer. Verifiable (check the network tab — zero uploads).
- **Honest pricing**: free tier works. No bait-and-switch at download.
- **Font matching**: edits blend into the original document rather than pasting an obvious text box over it.

## Business Goal
$1,500 MRR. ~170 users at $9/month Pro tier.
Not a moonshot. A useful tool that grows steadily as SEO compounds.

## Route to Revenue
1. Ship the core text editor (Sprint 1)
2. Add utility tools — compress, merge, split — to capture more search queries
3. SEO content targeting "alternative to [scammy tool]" and "pdf editor no upload" queries
4. Modest paid acquisition ($200-400/month) on low-CPC privacy-focused keywords once tool is solid

## Check-in Dates
- **2026-06-11** (3 months): Is the tool working and getting organic traction?
- **2026-09-11** (6 months): Are people paying? Is SEO indexing?

## Stack
Next.js 14, TypeScript, Tailwind, PDF.js + pdf-lib (client-side), Stripe, Supabase, Vercel.

## Current Status
Spike complete (2026-03-11). Font matching works for ~85% of real-world PDFs in-browser.
Bold preservation and outlier fonts are known gaps — solvable, not blockers.
Next: scaffold Next.js app → upload UI → PDF viewer → text editor → download.
