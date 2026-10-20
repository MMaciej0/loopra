#!/usr/bin/env bash
set -euo pipefail

MIN_DAYS="${MIN_DAYS:-20}"
status=0

for host in "$@"; do
  if ! cert="$(openssl s_client -connect "$host:443" -servername "$host" \
    -verify_hostname "$host" -verify_return_error </dev/null 2>/dev/null | openssl x509 2>/dev/null)"; then
    echo "::error::$host: no valid certificate"
    status=1
    continue
  fi

  end="$(openssl x509 -noout -enddate <<<"$cert" | cut -d= -f2)"
  if openssl x509 -noout -checkend $((MIN_DAYS * 86400)) <<<"$cert" >/dev/null; then
    echo "$host: ok, expires $end"
  else
    echo "::error::$host: expires $end, less than $MIN_DAYS days left"
    status=1
  fi
done

exit "$status"
