# Motion bible

## Easing and durations
- Camera: exponential smoothing (`1 - exp(-dt * 2.6)`).
- Intro: `power1.inOut` throughout; deliberate, unhurried pacing to match an archival examination rather than a cinematic reveal.

## Camera rules
- The camera only ever dollies straight in along one axis toward the painting; it never orbits, matching a conservator's fixed-angle examination photography rather than a cinematic sweep.

## Scroll mapping
- Wheel over the painting steps one imaging modality per gesture (rate-limited 700ms).
- The comparison-lens slider is the one continuous drag surface; it is a global overlay independent of the active modality, not a navigation control.

## Reduced-motion equivalents
- Intro: three static captioned frames.
- Post-intro: camera lerp becomes an instant snap.

## Purpose audit
Every shader branch maps to a real modality selection; the comparison lens always reflects the actual slider value. There is no decorative-only animation; the one continuous motion in the product (the lens drag) is also the one piece of direct physical interaction the book calls for.
