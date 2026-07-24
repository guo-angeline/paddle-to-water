# Item 137 disclaimer treatment

## Goal

Reduce the visual prominence of the Paddle Now modal disclaimer while preserving its approved wording and its placement beside the conditions claim.

## Approved design

The owner selected mockup C, “Whisper.”

- Keep the copy exactly: “Guidance only, not a safety guarantee. Conditions shift fast on the water.”
- Change the disclaimer from 14px primary ink to 10px lighter secondary ink.
- Use `#718399` for the lighter treatment.
- Keep the existing 6px top gap, line height, modal structure, claim, and call to action.
- Apply the treatment in both modal states because they share the same disclaimer element.

## Accessibility and legal guardrails

- Do not hide, shorten, defer, or conditionally render the disclaimer.
- Keep it in the normal reading order immediately after the conditions claim.
- Verify the chosen color against the white modal background and run the required legal gate before deployment. If the legal gate rejects the selected treatment, return to the owner with the smallest compliant adjustment instead of silently changing the design.

## Verification

- Add or update the focused style test to lock the 10px size and chosen color.
- Preserve the existing verbatim-copy test.
- Render the modal at 1280px and 390px and confirm the disclaimer remains readable without crowding or clipping.
- Run the relevant component tests, then the normal project verification required for deployment.
