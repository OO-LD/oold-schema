---
title: Video tutorials
---

# Video tutorials

Five short episodes, each building on the one before, from first principles to the Python library. They are silent: the text on screen carries the script, so they work with the sound off.

Every episode is also a slideshow. Use **View as slideshow** to step through the same beats as stills, at your own pace, which is usually the better way to read the code.

<div class="tut" data-episode="ep1" markdown>
<div class="tut__head" markdown>
<h2 class="tut__title">1. Why data needs meaning</h2>
<button class="tut__toggle" type="button" aria-pressed="false">View as slideshow</button>
</div>

Why a schema on its own is not enough. A schema constrains the shape of your data and says nothing about what it means; a context supplies meaning and says nothing about shape.

<video class="tut__video" controls playsinline preload="metadata" aria-label="Episode 1: why data needs meaning"></video>
<div class="tut__gallery" tabindex="0">
  <img class="tut__slide" alt="">
  <div class="tut__controls"><button class="tut__prev" type="button" aria-label="Previous slide">&larr;</button><span class="tut__caption"></span><button class="tut__next" type="button" aria-label="Next slide">&rarr;</button></div>
</div>
</div>

<div class="tut" data-episode="ep2" markdown>
<div class="tut__head" markdown>
<h2 class="tut__title">2. Anatomy of an OO-LD document</h2>
<button class="tut__toggle" type="button" aria-pressed="false">View as slideshow</button>
</div>

A close reading of [`Minimal.schema.json`](../schemas/Minimal.schema.json), keyword by keyword: `$schema`, `$id`, `@context`, and the ordinary JSON Schema keywords beside them.

<video class="tut__video" controls playsinline preload="metadata" aria-label="Episode 2: anatomy of an OO-LD document"></video>
<div class="tut__gallery" tabindex="0">
  <img class="tut__slide" alt="">
  <div class="tut__controls"><button class="tut__prev" type="button" aria-label="Previous slide">&larr;</button><span class="tut__caption"></span><button class="tut__next" type="button" aria-label="Next slide">&rarr;</button></div>
</div>
</div>

<div class="tut" data-episode="ep3" markdown>
<div class="tut__head" markdown>
<h2 class="tut__title">3. Building objects from objects</h2>
<button class="tut__toggle" type="button" aria-pressed="false">View as slideshow</button>
</div>

Composition: `$ref` for reuse, `allOf` for extension, and what happens to the `@context` when schemas compose. See [Composition](composition.md) for the written version.

<video class="tut__video" controls playsinline preload="metadata" aria-label="Episode 3: building objects from objects"></video>
<div class="tut__gallery" tabindex="0">
  <img class="tut__slide" alt="">
  <div class="tut__controls"><button class="tut__prev" type="button" aria-label="Previous slide">&larr;</button><span class="tut__caption"></span><button class="tut__next" type="button" aria-label="Next slide">&rarr;</button></div>
</div>
</div>

<div class="tut" data-episode="ep4" markdown>
<div class="tut__head" markdown>
<h2 class="tut__title">4. Identity, instances and the graph</h2>
<button class="tut__toggle" type="button" aria-pressed="false">View as slideshow</button>
</div>

How instances get identity, how an instance plus its schema's context expands into triples, and how a set of documents becomes a graph. See [Schema Instances](schema-instances.md) and [Identification & Versioning](identification-versioning.md).

<video class="tut__video" controls playsinline preload="metadata" aria-label="Episode 4: identity, instances and the graph"></video>
<div class="tut__gallery" tabindex="0">
  <img class="tut__slide" alt="">
  <div class="tut__controls"><button class="tut__prev" type="button" aria-label="Previous slide">&larr;</button><span class="tut__caption"></span><button class="tut__next" type="button" aria-label="Next slide">&rarr;</button></div>
</div>
</div>

<div class="tut" data-episode="ep5" markdown>
<div class="tut__head" markdown>
<h2 class="tut__title">5. oold in Python</h2>
<button class="tut__toggle" type="button" aria-pressed="false">View as slideshow</button>
</div>

Putting it to work with the [`oold`](https://pypi.org/project/oold/) reference library: the graph-object binding, links, validation, and the DSL.

<video class="tut__video" controls playsinline preload="metadata" aria-label="Episode 5: oold in Python"></video>
<div class="tut__gallery" tabindex="0">
  <img class="tut__slide" alt="">
  <div class="tut__controls"><button class="tut__prev" type="button" aria-label="Previous slide">&larr;</button><span class="tut__caption"></span><button class="tut__next" type="button" aria-label="Next slide">&rarr;</button></div>
</div>
</div>

## Source

The episodes are authored in code, in `media/tutorials` in this repository, and rendered in a light and a dark cut from the same source. The stills behind the slideshow are the same frames the reviewers look at in every pull request.
