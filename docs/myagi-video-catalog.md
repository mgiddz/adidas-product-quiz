# Myagi running-shoe lesson catalog (pulled 2026-09-29)

Source: Myagi channel "adidas Brand Specialist Program"
(myagi.rallyware.com/channels/a79ab4cd-b29c-41ec-8b26-9371fb0aa484).
Each lesson = presenter video (MP4 on Myagi's CDN, loads WITHOUT login — verified
with a cookie-less HEAD request, 200 / video/mp4) + tech-sheet PDF (download only)
+ flip cards + 2–4 quiz questions.

CDN base: https://myagi.rallyware.com/cdn2/uploads/5ec7c35e-a754-4e3b-9897-27452e51cccc/units/file/

| Shoe | Lesson | Video (append to CDN base) | Myagi Qs | Used in app |
|---|---|---|---|---|
| Supernova Rise 3 | SUPERNOVA RISE 3 101 | b4eafeb9-97f6-4146-bf28-cf469ed30009/wistia_video_XzQ9Ao.mp4 (24 MB) | 2 | ✅ products.video_url |
| Boston 13 | BOSTON 13 101 | 31ff97ea-0b9b-4d04-a31d-8b0f46162372/wistia_video_w9blak.mp4 | 4 | ✅ products.video_url |
| Boston 13 | Boston 13 Deep Dive | 72e2f2e1-c109-4497-9fe8-11383aa4d31a/wistia_video_kfpH59.mp4 | 2 | spare |
| Evo SL | Adizero Evo SL Overview | f32b1580-2fc2-4b91-9890-e9f417fbf064/wistia_video_iY4Jfr.mp4 | 3 | ✅ products.video_url |
| Evo SL | EVO SL DEEP DIVE | 8ebd5458-fcca-40d7-be40-f375251c1b56/wistia_video_Sj1umH.mp4 | 2 | spare |
| Evo SL | EVO SL UNBOXING | 83999c8c-53f8-48a6-b5bc-ee14dae4ba34/wistia_video_Ahdj6F.mp4 | 2 | spare |
| Adios Pro 4 | ADIOS PRO 4 101 | ef40f58a-dc3b-420e-b888-9ded42f7ea58/wistia_video_pNCcUf.mp4 | 4 | no — Pro 5 replaced it |
| Adios Pro 4 | ADIZERO ADIOS PRO 4 101 (older) | 60b6ceeb-6bb8-4cc7-b769-8d0eef9e9e0f/wistia_video_Awv3wn.mp4 | 3 | no |
| Supernova Prima 2 | PRIMA 2 101 | fcd58357-8694-4ec2-bbf8-bf3bb42aaa24/wistia_video_yPU4RN.mp4 | 2 | not in lineup yet |
| Supernova Prima 2 | PRIMA 2 Deep Dive | c34e8eef-afa6-4b22-96f1-95881c74d678/wistia_video_xFQmLQ.mp4 | 3 | not in lineup yet |
| Adistar 4 | ADISTAR 4 - THIS OR THAT | 7f10af5a-a981-4b7d-a43a-f79a42e8b557/wistia_video_YzU1Xe.mp4 | 2 | no |
| Adistar Control 5 (lifestyle) | GRWM | c62f9150-f968-442f-a474-ecea35d24eae/wistia_video_xEKd4P.mp4 | 2 | no |
| Adios 8 | Overview / Quick Hits | no video (PDF + flip cards only) | 0 | no |
| Terrex Agravic Flow 2 | Overview / Quick Hits | no video | 2 | no |

**Not on Myagi at all:** Hyperboost Edge, Adios Pro 5, Hyperboost Run, Supernova
Prima 3, Pro Evo 3. These run with a hero photo + "what to know" bullets
(`products.intro_bullets`) until Mike gets videos (director is sourcing them).

Risk: these URLs live on Myagi's infrastructure. If Myagi moves or locks them,
the module page falls back gracefully only if `video_url` is cleared — so when a
video 404s, null it out in `products` and the photo intro takes over. Long-term:
re-host in Supabase Storage once on Pro.
