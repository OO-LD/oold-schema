"""Shared documentation macros - the single source of truth for reused resources.

Registered with zensical's macros extension for the guide (docs/) and reused by
the /spec renderer so both renderers consume identical output. Every macro
returns plain Markdown (or HTML) that either renderer can process, so examples,
the keyword vocabulary, etc. live in exactly one place (examples/, meta/, ...).
"""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


def example(name, lang="json"):
    """Inline an example schema from examples/<name>.schema.json as a code block."""
    path = os.path.join(ROOT, "examples", f"{name}.schema.json")
    with open(path, encoding="utf-8") as fh:
        content = fh.read().rstrip("\n")
    return f"```{lang}\n{content}\n```"


def vocabulary():
    """Render the x-oold-* keyword table from every meta/*.json (single source)."""
    meta_dir = os.path.join(ROOT, "meta")
    rows = []
    for fname in sorted(os.listdir(meta_dir)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(meta_dir, fname), encoding="utf-8") as fh:
            schema = json.load(fh)
        for name, defn in (schema.get("properties") or {}).items():
            if name.startswith("x-oold-"):
                desc = " ".join((defn.get("description") or "").split()).replace("|", "\\|")
                rows.append((name, desc))
    lines = ["| Keyword | Description |", "| --- | --- |"]
    lines += [f"| `{name}` | {desc} |" for name, desc in rows]
    return "\n".join(lines)


# Macros reused across the project; the /spec renderer registers the same set.
SHARED_MACROS = [example, vocabulary]


def define_env(env):
    """Entry point for zensical's macros extension."""
    for macro in SHARED_MACROS:
        env.macro(macro)
