# Pin zensical to match .github/workflows/main.yml for reproducible
# documentation builds. Override on the command line, e.g. `make docs ZENSICAL_VERSION=0.0.47`.
ZENSICAL_VERSION ?= 0.0.46
ZENSICAL := uvx zensical@$(ZENSICAL_VERSION)

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
validate: ## Validate the example schemas against the OO-LD meta-schema
	@"$(NODE)" scripts/validate.mjs

.PHONY: spec
spec: ## Regenerate docs/spec/index.html from spec/sections + meta/*.json (via uv)
	@echo "🚀 Rendering the ReSpec spec from spec/"
	@uv run scripts/render_spec.py

.PHONY: docs
docs: ## Serve the docs with live reload (serves the committed spec artifact)
	@$(ZENSICAL) serve

.PHONY: preview
preview: spec ## Regenerate the spec, then serve the docs with live reload
	@$(ZENSICAL) serve

.PHONY: check
check: validate spec ## Validate schemas, lint the regenerated spec, and build the site
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
