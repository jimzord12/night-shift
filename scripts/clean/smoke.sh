#!/bin/sh
# Inside the clean container: what a stranger does with a fresh clone, then a tiny night played
# by hand (no agent) and the Viewer asked for it. Arguments: <repository url> <branch> <v<N>>.
# The last line is PASS, or FAIL with the step that broke.
set -eu
url="$1"; ref="$2"; version="$3"
step() { echo; echo "== $1"; }
fail() { echo; echo "FAIL: $1"; exit 1; }

step "clone $url ($ref)"
git clone --quiet --branch "$ref" "$url" night-shift || fail "git clone"
git config --global user.name stranger
git config --global user.email stranger@example.com

step "build and install $version, as the README says"
(cd night-shift && npm run --silent release build "$version") || fail "npm run release build $version"
(cd night-shift && npm run --silent release install "$version") || fail "npm run release install $version"
PATH="$HOME/.night-shift/bin:$PATH"
out=$(night-shift --version) || fail "night-shift --version"
echo "$out"
case "$out" in "$version "*) ;; *) fail "night-shift --version says '$out', not $version" ;; esac

step "a tiny night in a throwaway repository"
mkdir shop && cd shop
git init --quiet -b main
git commit --quiet --allow-empty -m init
night-shift install . || fail "night-shift install ."
mkdir -p .night-shift
cat > .night-shift/input.json <<'JSON'
{ "schema": "night-shift/plan@2", "tasks": [ { "id": "T1", "title": "Say hello", "source": "clean-machine check", "done_when": ["hello.txt exists"] } ] }
JSON
night-shift start --file .night-shift/input.json || fail "night-shift start"
echo hello > hello.txt
cat > .night-shift/input.json <<'JSON'
{ "task": "T1", "outcome": "done", "checks": [true], "evidence": [ { "type": "command", "command": "cat hello.txt", "exit_code": 0, "excerpt": "hello" } ] }
JSON
night-shift record --file .night-shift/input.json || fail "night-shift record"
night-shift close --summary "Said hello." || fail "night-shift close"
night-shift check . || fail "night-shift check"

step "the Viewer shows it"
night-shift view --port 4747 > /tmp/view.log 2>&1 &
for i in 1 2 3 4 5 6 7 8 9 10; do curl -sf http://127.0.0.1:4747/api/overview > /tmp/overview.json && break; sleep 1; done
[ -s /tmp/overview.json ] || { cat /tmp/view.log; fail "the Viewer did not answer"; }
grep -q '"summary":"Said hello."' /tmp/overview.json || { cat /tmp/overview.json; fail "the Viewer does not list the night"; }
curl -sf http://127.0.0.1:4747/ | grep -qi '<div id="root"' || fail "the Viewer's page is not built"

echo
echo "PASS: a fresh clone builds and installs $version, runs a night, and the Viewer shows it"
