#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND_DIR"

export PATH="/opt/homebrew/opt/openjdk@17/bin:/opt/homebrew/bin:$PATH"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"

set -a
[ -f ../.env ] && source ../.env
set +a

mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting Spring Boot backend..."
for attempt in $(seq 1 60); do
  if curl -fsS http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "Backend is ready. Re-indexing catalog embeddings..."
    curl -fsS -X POST http://localhost:8080/api/rag/index
    echo
    echo "RAG index is ready. Backend logs: $BACKEND_DIR/backend.log"
    wait "$BACKEND_PID"
    exit $?
  fi
  sleep 1
done

echo "Backend did not become ready. Check $BACKEND_DIR/backend.log" >&2
exit 1
