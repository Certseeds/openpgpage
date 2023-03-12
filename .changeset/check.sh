#!/usr/bin/env bash
set -euox pipefail
main() {
    local matches="$(npx changeset status --since=origin/master |
        grep 'info Packages' |
        wc |
        xargs -n 1 |
        head -n 3 |
        head -n 1)"
    if [[ "${matches}" == "0" ]]; then
        exit 1;
    else
        echo 'pass test';
    fi
}
main
