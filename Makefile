# Sovereign HPP - Unified Command Interface
# NC-11300: Operation Rosetta

.PHONY: dev check clean

# Start the full development environment (Frontend + Docker DB)
dev:
	@echo "Starting Sovereign HPP System..."
	@npm run dev

# Verify system integrity (Types, Tests, Manifest)
check:
	@echo "Running System Integrity Check..."
	@echo "[1/3] TypeScript Compiler..."
	@npx tsc --noEmit
	@echo "[2/3] Unit Tests (Vitest)..."
	@npm run test
	@echo "[3/3] Manifest Verification..."
	@node scripts/generate-manifest.mjs
	@echo "✅ System Secure."

# Purge all temporary artifacts and logs
clean:
	@echo "Purging temporary artifacts..."
	@rm -rf dist
	@rm -rf node_modules/.cache
	@rm -rf coverage
	@rm -rf test-results
	@rm -rf *.log
	@rm -f tsconfig.tsbuildinfo
	@echo "✅ Cleanup Complete."
