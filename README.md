# Datahub Manifest Upload Service

## Security updates

The Docker image uses Node.js 22 on Alpine 3.24 and upgrades Alpine packages
during the build. The runtime requires OpenSSL libraries (`libcrypto3` and
`libssl3`) at version `3.5.9-r1` or newer; the build fails if those patches
are unavailable. npm overrides pin `qs` to `6.16.1` and `fast-xml-parser` to
`5.12.0`, with resolved versions tracked in `package-lock.json`.

Rebuild without cached package-install layers to pick up Alpine security updates:

```sh
docker build --pull --no-cache -t bento-cds-interoperation .
```

BusyBox `1.37.0-r31` remains affected by CVE-2025-60876; no patched package
was available in the Alpine 3.24 repository at remediation time. Re-scan the
rebuilt image and rebuild again when an upstream patch becomes available.
