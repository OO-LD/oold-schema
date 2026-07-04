# Pin zensical to match .github/workflows/main.yml for reproducible
# documentation builds. Override on the command line, e.g. `make docs ZENSICAL_VERSION=0.0.27`.
ZENSICAL_VERSION ?= 0.0.46
ZENSICAL := uvx zensical@$(ZENSICAL_VERSION)

# Node interpreter for the generator / validation scripts. Override when `node`
# is not on PATH (e.g. on WSL with only a Windows install):
#   make spec NODE="/mnt/c/Program Files/nodejs/node.exe"
NODE ?= node

.PHONY: install
install: ## Install the Node dependencies
	@npm install

.PHONY: validate
validate: ## Validate the example schemas against the OO-LD meta-schema
	@"$(NODE)" scripts/validate.mjs

# Regenerate the committed artifacts (spec/generated/vocabulary.md and
# docs/spec/index.html) from spec/ and meta/*.json. Run after editing either.
.PHONY: spec
spec: ## Regenerate the spec + vocabulary table from spec/ and meta/*.json (needs Node)
	@echo "🚀 Regenerating the ReSpec spec and vocabulary table"
	@"$(NODE)" scripts/build-spec.mjs

.PHONY: docs
docs: ## Serve the docs with live reload (serves committed artifacts; no Node)
	@$(ZENSICAL) serve

.PHONY: preview
preview: spec ## Regenerate, then serve the docs with live reload (needs Node)
	@$(ZENSICAL) serve

.PHONY: check
check: validate spec ## Validate schemas, lint the regenerated spec, and build the site
	@"$(NODE)" scripts/check-spec.mjs
	@$(ZENSICAL) build --clean

.PHONY: clean
clean: ## Remove build artifacts (./site)
	@rm -rf site

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
