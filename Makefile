# Pin zensical to match .github/workflows/main.yml for reproducible
# documentation builds. Override on the command line, e.g. `make docs ZENSICAL_VERSION=0.0.47`.
ZENSICAL_VERSION ?= 0.0.46
# --with pyyaml==6.0.2 so the shared macros (macros.py) can import yaml to render the
# JSON / "View as YAML" example tabs during the docs build.
ZENSICAL := uvx --with pyyaml==6.0.2 zensical@$(ZENSICAL_VERSION)

# The spec renderer runs on Python via uv (like zensical); its dependencies are
# pinned inline in the script (PEP 723), so `uv run` needs no extra flags and the
# generated HTML stays reproducible (the CI drift guard compares byte-for-byte).

# Validation runs on oold-python, the reference implementation this specification is
# developed against. Pinned so a validator release cannot change what CI means without a
# commit here. --meta . points it at THIS working tree rather than a released tag, so a
# rule added in a branch is enforced by the run that introduces it.
OOLD_VERSION ?= 0.18.0
OOLD := uv run --with "oold[validation]==$(OOLD_VERSION)" oold

# scripts/validate.mjs is frozen: kept runnable as the reference the Python port is
# compared against (oold-python's parity suite), but no longer what CI runs. Override
# when `node` is not on PATH: make validate-reference NODE="/c/.../node.exe"
NODE ?= node

.PHONY: install
install: ## Install the Node dependencies (schema validation)
	@npm install

.PHONY: validate
validate: ## Validate example schemas + instances against this working tree's meta-schemas
	@$(OOLD) validate examples --meta . --offline
	@$(OOLD) compliance examples/compliance --meta . --offline

.PHONY: validate-reference
validate-reference: ## Run the frozen JS reference validator (not run by CI)
	@"$(NODE)" scripts/validate.mjs

.PHONY: spec
spec: ## Regenerate docs/spec/index.html + meta/oold-rules.json from spec/sections (via uv)
	@echo "🚀 Extracting the rule catalog from spec/"
	@uv run scripts/extract_rules.py
	@echo "🚀 Rendering the ReSpec spec from spec/"
	@uv run scripts/render_spec.py
	@echo "🚀 Rendering the rule catalogue page from meta/oold-rules.json"
	@uv run scripts/render_rules_page.py

.PHONY: rules
rules: ## Check the rule catalogue against the accepted baseline
	@uv run scripts/rules_baseline.py check

.PHONY: rules-accept
rules-accept: ## Accept reworded rule(s): make rules-accept IDS="OOLD-RT-08f2 OOLD-EXT-6ea3"
	@test -n "$(IDS)" || { echo 'usage: make rules-accept IDS="OOLD-RT-08f2 [...]"' >&2; exit 2; }
	@uv run scripts/rules_baseline.py accept $(IDS)

.PHONY: rules-mint
rules-mint: ## Fill :rule[OOLD-XX-?] placeholders with freshly minted ids
	@uv run scripts/mint_rule_ids.py $(ARGS)

.PHONY: check-extensions
check-extensions: ## Check zensical.toml still restates Zensical's default Markdown extensions
	@uv run --with zensical==$(ZENSICAL_VERSION) scripts/check_markdown_extensions.py

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
	@uv run scripts/rules_baseline.py check
	@$(MAKE) --no-print-directory check-extensions
	@$(ZENSICAL) build --clean

.PHONY: clean
clean: ## Remove build artifacts (./site)
	@rm -rf site

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
