// js/config.js
//
// Supabase project connection details.
//
// These are the PUBLIC "anon" key and project URL — Supabase is designed
// for these to be embedded in client-side code (this whole app is a public,
// no-login page after all). Data safety comes from the Row Level Security
// policy in supabase/schema.sql, which only allows this key to INSERT rows,
// never read/update/delete them. Do not paste your Supabase "service_role"
// key here — that one must stay secret and has no business in a browser.
//
// Setup (see CLAUDE.md "Install / run / build" for the full steps):
//   1. Create a free project at https://supabase.com
//   2. Run supabase/schema.sql in the Supabase SQL editor
//   3. Project Settings -> API -> copy "Project URL" and "anon public" key
//   4. Paste them below
//
// 2026-09-03: repointed to a NEW, dedicated Supabase project
// ("Product Education Quiz", ref hlfcaczeayotkfkukaca). The previous
// project was shared with an unrelated app, which dropped this app's
// tables — see MEMORY.md's decision log. Nothing else may share this
// project.

const SUPABASE_URL = "https://hlfcaczeayotkfkukaca.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZmNhY3plYXlvdGtma3VrYWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDk0MTYsImV4cCI6MjEwNDAyNTQxNn0.X2ZIqqg04QdnHe9EESzT6PoQAyZdJx144HB06S8laOI";
