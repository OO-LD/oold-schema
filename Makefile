# Pin zensical to match .github/workflows/main.yml for reproducible
# documentation builds. Override on the command line, e.g. `make docs ZENSICAL_VERSION=0.0.47`.
ZENSICAL_VERSION ?= 0.0.46
# --with pyyaml==6.0.2 so the shared macros (macros.py) can import yaml to render the
# JSON / "View as YAML" example tabs during the docs build.
ZENSICAL := uvx --with pyyaml==6.0.2 zensical@$(ZENSICAL_VERSION)

# The spec renderer runs on Python via uv (like zensical); its dependencies are
# pinned inline in the script (PEP 723), so `uv run` needs no extra flags and the
# generated HTML stays reproducible (the CI drift guard compares byte-for-byte).

# Node runs only the schema validator. Override when `node` is not on PATH
# (e.g. WSL with only a Windows install): make validate NODE="/c/.../node.exe"
NODE ?= node

.PHONY: install
install: ## Install the Node dependencies (schema validation)
	@npm install

.PHONY: validate
validate: ## Validate example schemas + instances (meta-schema, formats, JSON-LD)
	@"$(NODE)" scripts/validate.mjs

.PHONY: spec
spec: ## Regenerate docs/spec/index.html from spec/sections + meta/*.json (via uv)
	@echo "🚀 Rendering the ReSpec spec from spec/"
	@uv run scripts/render_spec.py

.PHONY: stage-schemas
stage-schemas: ## Copy meta/ + examples/ into docs/ so the build serves them (versioned per release)
	@mkdir -p docs/meta docs/schemas
	@cp meta/*.json docs/meta/
	@cp examples/*.schema.json docs/schemas/

.PHONY: docs
docs: stage-schemas ## Serve the docs with live reload (serves the committed spec artifact)
	@$(ZENSICAL) serve

.PHONY: preview
preview: spec stage-schemas ## Regenerate the spec, then serve the docs with live reload
	@$(ZENSICAL) serve

.PHONY: check
check: validate spec stage-schemas ## Validate schemas, lint the regenerated spec, and build the site
	@uv run scripts/check_spec.py
	@$(ZENSICAL) build --clean

.PHONY: clean
clean: ## Remove build artifacts (./site)
	@rm -rf site

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
