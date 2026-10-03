#!/bin/sh
# The one place LTeX is invoked, so the pre-push hook and the CI job cannot
# disagree about what it checks.
#
# In CI the job container is the ltex-cli-plus image, so the binary is already
# on PATH. Anywhere else the same image runs through Docker, which beats every
# machine keeping its own copy of a ~300 MB JDK-bundling tarball current.
#
# ltex-cli-plus exits 3 on findings, not 1; this script passes whatever code it
# gets straight through, so any non-zero fails the caller.
#
# The files are named rather than passing `.`: LTeX traverses recursively and
# reads plain text as prose, so a bare dot lints the committed Vale vocabulary
# as though it were a document. The two directories hold nothing but prose, so
# naming them is safe. dev-docs/*.md skips dev-docs/design, which is images.
set -eu

# renovate: datasource=docker depName=ghcr.io/alrayyes/ltex-cli-plus
IMAGE="ghcr.io/alrayyes/ltex-cli-plus:18.7.0@sha256:bf8c54087ad5418da57d9ef5a9604b4dd70aa0737fa0d732b2a2d5cd81e64c18"

cd "$(dirname "$0")/.."

set -- --client-configuration=.ltex.json README.md CONTRIBUTING.md SECURITY.md \
  src/content/docs/docs dev-docs/*.md

if command -v ltex-cli-plus >/dev/null 2>&1; then
  exec ltex-cli-plus "$@"
fi

if command -v docker >/dev/null 2>&1; then
  exec docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/work -w /work "$IMAGE" "$@"
fi

echo "lint-ltex: need ltex-cli-plus on PATH or Docker to run its image" >&2
exit 2
