---
name: Dr Wessam Photo System
description: Typed photo slots, session photos, visibility system architecture for PatientFile
---

## Photo Slot Types
- **Face** (cat=`face`): `frontal_rest`, `frontal_smile`, `lateral`
- **Intraoral** (cat=`intraoral`): `frontal_occlusion`, `upper_jaw`, `lower_jaw`, `right_lateral`, `left_lateral`
- **X-rays** (cat=`xray`): `panorama`, `lateral`, `cbct`
- **Session** (linked to session _id): same 5 as intraoral

## API Routes Added
- `POST /patients/:id/images` — add image to patient
- `PATCH /patients/:id/images/:category/:imageId` — update image (visibility, descriptions)
- `DELETE /patients/:id/images/:category/:imageId` — delete image
- `PATCH /patients/:id/visibility` — save visibility settings object
- `POST /sessions/:id/images` — add image to session
- `PATCH /sessions/:id/images/:imageId` — update session image
- `DELETE /sessions/:id/images/:imageId` — delete session image
- `PATCH /sessions/:id/visibility` — toggle session isVisibleToPatient

## Visibility System
- Patient model has `visibility: { diagnosis, treatmentPlan, treatmentStages, instructions, faceImages, intraOralImages, xrays, sessions, financials }` — all Boolean default true
- Each image has `isVisibleToPatient` Boolean default true
- Each Session document has `isVisibleToPatient` Boolean default true
- GET /patients/:id and GET /sessions filter data for patient role based on these flags

## React Rule
**Why:** Inner components defined inside PatientFile caused "Invalid hook call" React warning.
**How to apply:** Always define `ImageSlot`, `XraySlot`, `VisToggleBtn` etc. at MODULE level (outside the default export function), passing handlers as props.

## OnboardingTour Note
`@media(max-width:600px)` syntax does NOT work in React inline style objects — remove it or use a state-based approach.
