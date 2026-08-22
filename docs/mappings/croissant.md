# Croissant (MLCommons)

[Croissant](https://github.com/mlcommons/croissant) describes ML datasets as JSON-LD built on `schema.org/Dataset` plus the `cr:` vocabulary. Unlike SPDX or LinkML there is no separate model notation to compile: a Croissant document is authored directly as JSON-LD, so its primary notation is the instance-shaped document below. Because it is already JSON-LD, an OO-LD schema over the same terms adds structural validation while preserving the semantics.

## Croissant (JSON-LD, authored directly)

```json
{
  "@context": { "@vocab": "https://schema.org/", "cr": "http://mlcommons.org/croissant/" },
  "@type": "sc:Dataset",
  "name": "simple-pass",
  "recordSet": [
    {
      "@type": "cr:RecordSet",
      "@id": "images",
      "field": [
        { "@type": "cr:Field", "@id": "images/image_content", "dataType": "sc:ImageObject" }
      ]
    }
  ]
}
```

## OO-LD Schema

```json
{
  "@context": { "sc": "https://schema.org/", "cr": "http://mlcommons.org/croissant/", "type": "@type" },
  "$id": "Dataset.schema.json",
  "title": "Dataset",
  "type": "object",
  "properties": {
    "type": { "const": "sc:Dataset" },
    "name": { "type": "string" },
    "recordSet": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "const": "cr:RecordSet" },
          "field": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": { "const": "cr:Field" },
                "dataType": { "type": "string", "x-oold-range": "sc:ImageObject" }
              }
            }
          }
        }
      }
    }
  }
}
```

OO-LD adds structural validation (required fields, cardinalities) and a machine-checkable `x-oold-range` on `dataType`, on top of Croissant's JSON-LD semantics.
