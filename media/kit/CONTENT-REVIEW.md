# Content review

A contact sheet answers "what do the slides look like". `review.mjs` answers "what did this
pull request change". Neither answers "can someone who was not in the room read this, and is
it true", and that is the question a silent explainer lives or dies on.

This is the pass that answers it. It is a read of the rendered stills by someone with no
context, followed by measurement. It is not a substitute for the pixel diff; it runs once the
frames are worth reading at all, and again after a substantial rewrite.

## Who runs it

Someone, or something, that has not seen the project. The value is entirely in the absence of
context: an author cannot un-know what a frame means, and every reviewer who sat in the
planning meeting will supply the missing antecedent without noticing they did it.

Give the reviewer the stills, the runtime, and nothing else. Whether they can say what the
thing is, from the frames alone, is the first result.

## The pass

**1. Cold read.** Go through the frames in order and write down what you understood at each
one, including every place you guessed or stalled. Then answer without looking back: what is
this, what problem does it address, what does it actually do, and what would you tell a
colleague about it. A partial answer is a finding, not a failure of the reviewer.

**2. Timing.** For each frame, take the dwell of the fully built state, not the length of the
scene, and count the words that arrive in that window. Text that appears late is read in the
time that remains after it appears. `readingLoadReport` in `legibility.mjs` does the
arithmetic and sorts the worst first.

Report per state. A total is misleading: a timeline averages inside the band while half its
frames run at three times the ceiling and the other half hold a finished state with nothing
arriving. That is a distribution problem, and only a per-state table prompts the fix, which
is usually redistribution rather than cutting.

**3. Claims.** Take every factual or causal statement on screen and ask what an informed
sceptic says to it. Absolutes are where this bites: a word like *stop*, *all*, *for good* or
*nothing* turns a defensible statement into one that the next frame often contradicts by
itself. Quantities that appear nowhere in the source material are worse, because they invite
the one question the video cannot answer.

**4. Language.** Jargon, terms used before they are defined, acronyms never expanded,
pronouns with no antecedent, and any sentence that had to be read twice. Garden-path
sentences are the common one: they parse cleanly on the second reading, which is exactly why
the author never sees them.

**5. Composition and typography.** Alignment against the composition axis, elements that are
equidistant from two things they might belong to, type that carries meaning at a size that
will not survive the embed, and any shape that changes meaning between frames.

**6. Compliance surface.** Funder marks, attribution, disclaimers. Check the frame against
itself before checking it against the template: a name spelled one way in a logo and another
way in the paragraph below it is what a viewer sees, whatever the template says.

## Failure modes worth checking by name

These recur, they all pass the obvious check, and each one shipped at least once.

**Contrast that only fails after compositing.** A scene dims a layer to bring an overlay
forward. The palette still declares the same two colours, so contrast measured on the
declared values passes; the type did not change size, so a type floor passes too. What
changed is the ink. Text at a comfortable ratio can land below the 3:1 non-text threshold
once its layer is composited at 40% opacity, and the frame reads as blank on a projector
while every check is green. Measure the blend, not the palette. `blend` in `legibility.mjs`.

**A type floor that only covers styled text.** A raster is one image to the renderer, so a
floor enforced on the type scale says nothing about a strapline baked into a logo strip,
which is routinely the smallest meaningful mark on the frame and can sit several times below
the project's own stated minimum. Measure raster text by hand and assert it alongside the
rest.

**Labels equidistant from two anchors.** A label centred over a span, and a mark drawn at the
edge of that span, can end up exactly as far from its own mark as from the next one.
Proximity then carries no information at all and the reader attaches the label to whichever
mark they scan first. Measure the distances; do not judge this by eye, because the author
knows the answer.

**A fix that ships alongside the bug.** An asset extracted so it can be corrected, while the
original stays embedded in the composite it was extracted from. Both are then on screen, the
correction is invisible, and the commit message says it was fixed. Grep the frame, not the
changelog.

**One word doing two jobs.** A term with a common meaning in the subject area and another in
ordinary speech will be read the ordinary way every time, and using it for two different
things in one video guarantees at least one misread.

**Geometry that argues against the text.** A list that steps downward reads as decline; a
series of filters drawn as a branch is not a series. When the sentence and the picture
disagree, viewers believe the picture.

**The project named late, or never.** The clearest single finding this pass tends to produce.
A video can make an argument for a minute on behalf of a party it has not named, and no
amount of polish elsewhere recovers it. An end card is too late: by then the viewer has
already decided what kind of thing they are watching.

## Output

Rank findings as **must fix**, **should fix** and **taste**, most severe first. For each: the
frame, what is wrong, and what a viewer would misread. Where wording is the problem, propose
the replacement wording. "Unclear" is not actionable.

Close with the single change that would help most, and the reading-load number. Both force a
judgement that a ranked list lets the reviewer avoid.

Measure rather than assert. A reviewer who says the contrast looks low can be argued with; a
reviewer who says it is 1.87:1 cannot.
