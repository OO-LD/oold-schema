# Pin zensical to match .github/workflows/validate-schemas.yml for reproducible
# documentation builds. Override on the command line, e.g. `make docs ZENSICAL_VERSION=0.0.27`.
ZENSICAL_VERSION ?= 0.0.26
ZENSICAL := uvx zensical@$(ZENSICAL_VERSION)

.PHONY: install
install: ## Install the Node dependencies (ajv, json-schema-ref-parser)
	@echo "🚀 Installing dependencies with npm"
	@npm install

.PHONY: validate
validate: ## Validate the example schemas against the OO-LD meta-schema
	@echo "🚀 Validating OO-LD schemas"
	@npm run validate

.PHONY: docs
docs: ## Build and serve the documentation with live reload
	@echo "🚀 Serving documentation (zensical)"
	@$(ZENSICAL) serve

.PHONY: docs-build
docs-build: ## Build the documentation site into ./site
	@echo "🚀 Building documentation into ./site"
	@$(ZENSICAL) build --clean

.PHONY: docs-test
docs-test: ## Test that the documentation builds in strict mode (warnings fail)
	@echo "🚀 Test-building documentation in strict mode"
	@$(ZENSICAL) build -s

.PHONY: check
check: validate docs-test ## Run schema validation and the strict docs build

.PHONY: clean
clean: ## Remove build artifacts (./site)
	@echo "🚀 Removing build artifacts"
	@rm -rf site

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-14s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
