# R3 research card: iris colour and light

Phase R3 of `docs/EYE_REALISM_PLAN.md`:
- the iris's colour comes from a Kubelka–Munk model of its layers, evaluated offline for our one person and baked into the colour map, so crypts and furrows darken physically;
- light enters through the cornea: refracted, with Fresnel transmission, a lid shadow where it enters, and a caustic crescent on the far side;
- the era never recolours the iris. It changes only the light.

Status (2026-10-28): colour from the layers built (batch A, bake/iris.ts `kmLayer`), with the soft limbus; light through the cornea still to do. Fitted values: `.claude/skills/eye-iris-pupil/references/iris-numbers.md`. Melanin alone at λ^−3.48 fits an olive hue (~70°); the stroma's blood brings it to ~62°.

## 1. What makes a dark brown iris brown

| Fact | Number | Source | What R3 does with it |
|---|---|---|---|
| Brown is absorption, blue is scattering | A brown iris has so much melanin that it absorbs most light entering it. A blue one has almost none, and its stroma's collagen scatters short wavelengths (Tyndall). | [bioRxiv 2024](https://www.biorxiv.org/content/10.1101/2024.01.17.576074v1.full.pdf); [ILIT model](https://diglib.eg.org/items/9e1190de-6e18-4aa8-8fce-7c55b67795f1) | Our person's colour is absorption-led. Scattering is small; that matches R2's scatter × (1 − melanin). |
| The layers that set colour | The anterior border layer (ABL) and the stroma hold the melanin. The posterior pigment epithelium is two cells thick and heavily pigmented in every iris. | [Iris (anatomy)](https://en.wikipedia.org/wiki/Iris_(anatomy)); [PathologyOutlines: uvea](https://www.pathologyoutlines.com/topic/eyeanatomyuvea.html) | Three layers: ABL (the shell), stroma (the floor's depth), epithelium (black, under all of it). |
| Where the melanin sits matters | A brown iris looks darker when most of its melanin is in the ABL rather than the stroma. | [Baranoski & Lam 2007](https://ebooks.spiedigitallibrary.org/journals/journal-of-biomedical-optics/volume-12/issue-03/030501/Qualitative-assessment-of-undetectable-melanin-distribution-in-lightly-pigmented-irides/10.1117/1.2747205.full) | Our person is ABL-heavy (melanin 0.85). Where the ABL opens (crypts), the less pigmented stroma shows, so crypt walls read warmer before the floor goes dark. |
| Eumelanin to pheomelanin | ~14.8 : 1 in dark brown irides; 1.3 : 1 in blue-green ones. Melanosomes are the same size; only the mix differs. | [Peles & Simon 2010](https://dukespace.lib.duke.edu/items/0c0462ef-f016-4a14-9a94-bfd09053970c) | Mostly eumelanin: brown-black, little red-yellow. Pheomelanin ≈ 6 %. |
| Melanin's spectrum | Melanosome absorption ≈ 1.70 × 10¹² · λ^−3.48 cm⁻¹ (λ in nm), a fit to the shape; concentration varies ~10×. Eumelanin and pheomelanin spectra differ only slightly in shape. | [OMLC, Jacques](https://omlc.org/spectra/melanin/mua.html); [OMLC extinction](https://omlc.org/spectra/melanin/extcoeff.html) | Per channel, against red (650 nm): green (550) absorbs ×1.79, blue (450) ×3.60. That one exponent gives K–M's K per channel. |
| Pigment amount | Brown irides carry ~40 % more melanin than other colours (Wielgus & Sarna 2005, as cited). Blue irides have very little; brown ones mixed (Prota 1998). | [Jang 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6085209) (citing Wielgus & Sarna); [Prota 1998](https://https.ncbi.nlm.nih.gov/pubmed/9778410) | Sets the ratio between the ABL's and the stroma's K. |

## 2. Thickness: why crypt floors go dark

| Fact | Number | Source | What R3 does with it |
|---|---|---|---|
| Iris thickness | 0.365 ± 0.048 mm temporal, 0.372 ± 0.044 nasal (swept-source OCT, 233 healthy Chinese adults) | [Measurement of iris thickness, PMC8131156](https://pmc.ncbi.nlm.nih.gov/articles/PMC8131156/) | Stroma ≈ 0.37 mm. R2's relief is 0.22 mm deep, so a crypt floor sits close to the black epithelium: K–M with the epithelium as the backing. |
| Crypts mean thinner tissue | Irides with more crypts are thinner. Darker irides and more furrows go with a thicker periphery. | [Sidhartha et al. 2014, Ophthalmology](https://scholars.duke.edu/publication/1080345); [Tun et al. 2016, BJO](https://bjo.bmj.com/content/100/12/1682) | The colour is a function of the local stroma left over the epithelium: thinner means darker and less saturated. |

## 3. Measured colour of brown irides

| Fact | Number | Source | Our person now |
|---|---|---|---|
| Korean brown irides (slit-lamp photographs, 100 eyes) | L\* ≈ 21.7, a\* ≈ 22, b\* ≈ 29, hue 45–55° | [Jang et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6085209) | Inner zone `#5e3c22` L\* 28.7, a\* 12.0, b\* 22.0, hue 61°. Outer zone `#4a2e1a` L\* 21.9, a\* 10.4, b\* 18.0, hue 60°. |

- **Caveat:** that study keeps each iris's highest-chroma colour, so the iris's mean colour is less saturated than its numbers. Our lightness matches. Our hue sits ~8° more yellow, and our chroma is lower, as expected for a mean.
- **Not found:** measured CIELAB for South Asian dark brown irides. Edwards et al. 2015 measured them, but only the abstract was reachable. Your own photo is the better target anyway.

## 4. Light entering through the cornea

| Fact | Number | Source | What R3 does with it |
|---|---|---|---|
| Refraction into the eye | Cornea n 1.376, aqueous 1.336; keratometric 1.3375 for a single-surface model | Gullstrand schematic eye (as in R1, `anatomy.ts`) | The key's direction inside the eye uses R1's two surfaces, already built for the view ray. |
| The iris caustic | Oblique light is focused by the cornea onto the far side of the iris, a bright crescent opposite the light, with the near side darker | Seen in renders ([Maxwell forum](https://forum.maxwellrender.com/viewtopic.php?p=331278)); real-time eye shaders implement it ([Jimenez, Next-Generation Character Rendering, GDC 2013, slides 229–231](https://discussions.unity.com/t/eye-shader-physically-based-refraction-source-code/646027)); a SIGGRAPH 2017 talk approximates it by pushing the iris back ([Lopez 2017](https://history.siggraph.org/wp-content/uploads/2022/09/2017-Talks-Lopez_The-Eyes-Have-It-Comprehensive-Eye-Control-for-Animated.pdf)) | Today's caustic is a fixed crescent. R3 derives its side, width and strength from the refracted key and the cornea's curvature. |
| The lids shade the light where it enters | The upper lid hides the top of the cornea from a light above | (geometry; R1's lid margins) | Shadow the key by the lids at the point where it enters the cornea, not where it lands on the iris. |

## 5. Not yet verified († until checked)

- †**K–M scattering of the stroma (S)** and the **ABL's melanin share**: ILIT's parameters are in the paper, which was not reachable (Eurographics 2006). Plan: fit S and the ABL/stroma split to your photo (section 7), within the bounds above, rather than invent them.
- †**Haemoglobin and carotenoids** in the stroma: ILIT lists them as minor contributors. R3 leaves them out unless your photo shows a red cast in the crypts.
- †**Jimenez's caustic formulation:** the slides were not reachable. R3 derives the crescent from our own refraction instead of copying a formula.

## 6. Per era: what R3 must re-check (plan §8.7)

| Era | Why | Watch for |
|---|---|---|
| 1995 | web-safe palette | the iris must land on ≥ 2 browns, not one flat step |
| 1997 | 4:2:0 chroma | the bleed onto the white stays a pixel; the hue stays brown |
| 2003 | saturation ×1.3 | brown never turns rust |
| 2009 | warm fade | the iris doesn't muddy into the skin |
| 1970, 1981, 1991, 2026 | luminance only | colour is invisible; only lightness and crypt contrast count |

## 7. Your eye (received 2026-10-28)

`docs/era-pov/ref/user-eye.webp`: a graded macro (cool, sharpened), so it sets relationships, not hue. Measured with the same probe as our renders (`docs/era-pov/ref/yours-vs-ours.png`):
- **The iris body** is near-black, L\* ≈ 16 flat from 0.15 to 0.9 R, about 23× darker than the white (L\* 78). The pupil barely separates from it. Fibres are faint: L\* rms 3.7 above a 9 px mean.
- **The limbus** is a soft ramp, L\* 18 → 24 → 34 → 56 → 73 at 0.90 / 0.95 / 1.00 / 1.05 / 1.10 R. No ring is darker than the iris.
- **Ours, where the page leaves the iris visible,** is as dark (L\* 6–14). Its limbus is a darker ring then a sharp step. R3 fixes that, and colours the body from the layers rather than two painted zones.
- **Still wanted:** a daylight shot without the grade (shot 1 below) would pin the hue; until then hue comes from the physics and the measured brown band (section 3).

## 8. More references that would help

Your own eye is the benchmark (decision 4). Phone or camera, macro if you have it, autofocus on the iris, no beauty filter, HDR off, flash off unless asked. RAW if your phone can.

1. **Daylight:** facing a window, indirect daylight, pupil small. The colour target.
2. **A screen as the only light:** a white page on a monitor or laptop in a dark room, as the loader imagines. The page in your cornea and the colour under screen light.
3. **A warm lamp:** a desk lamp to one side, eye looking straight ahead. The caustic crescent on the far side.
4. **Large pupil:** dim room, a few seconds after the light goes down. The pupillary band and the collarette when dilated.
5. **Side view, ~30–45° off axis.** The depth under the cornea and the iris's relief.
6. **Optional:**
   - a white or grey card in shot 1, so the colour can be calibrated;
   - any dark brown iris macro you like as a style target, with its source.

Any subset helps. 1 and 2 matter most, then 3.
