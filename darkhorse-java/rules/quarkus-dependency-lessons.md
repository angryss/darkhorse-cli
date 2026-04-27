# Quarkus Dependency Lessons Learned

## 1. `quarkus-resteasy-reactive-multipart` does not exist — never declare it

### What happened
`backend/bffs/pom.xml` declared a dependency on `io.quarkus:quarkus-resteasy-reactive-multipart` (with no version, expecting the BOM to resolve it). Maven failed at POM validation during Docker build:

```
'dependencies.dependency.version' for io.quarkus:quarkus-resteasy-reactive-multipart:jar
is missing. @ line 45, column 21
```

Checking Maven Central confirmed the artifact returns HTTP 404 for all Quarkus versions, including 3.8.6. The Quarkus extension catalogue lists no such extension.

### Root cause
In **RESTEasy Classic** (Quarkus 2.x legacy), multipart support required `quarkus-resteasy-multipart` as a separate artifact. This pattern was incorrectly carried over when implementing file upload in RESTEasy Reactive (Quarkus 3.x).

In **RESTEasy Reactive** (Quarkus 3.x), multipart support — including `org.jboss.resteasy.reactive.multipart.FileUpload` — is built into `quarkus-resteasy-reactive` and is transitively provided by `quarkus-resteasy-reactive-jackson`. No additional dependency is needed.

### Fix
Remove the non-existent dependency from `pom.xml`. The `FileUpload` class compiles and runs correctly with only `quarkus-resteasy-reactive-jackson` on the classpath.

### Rule for new code
- **Never** add `quarkus-resteasy-reactive-multipart` to any `pom.xml`. It does not exist.
- For multipart/file upload endpoints using RESTEasy Reactive, ensure `quarkus-resteasy-reactive-jackson` (or `quarkus-resteasy-reactive`) is declared — that is sufficient.
- For RESTEasy Classic (if ever used), the correct artifact is `quarkus-resteasy-multipart` (no "reactive" in the name).
- When adding a new Quarkus dependency without a version tag (relying on the BOM), verify the artifact exists at `https://repo1.maven.org/maven2/io/quarkus/<artifactId>/<version>/` before committing.

---

## 2. Stale Docker layer cache can produce phantom TypeScript errors

### What happened
After fixing TypeScript errors locally (`tsc --noEmit` passed cleanly), the Docker build of the frontend still failed with the original TypeScript errors. The error was a stale cached layer from before the fix was applied.

### Root cause
Docker caches build layers. If source files change but the `COPY` instruction's cache key matches a prior layer (e.g. due to context timestamp), the stale source is used inside the container.

### Fix
Always run `docker compose build --no-cache` when diagnosing build failures that were previously fixed locally. Do not trust a cached build to reflect current source state.

### Rule for new code
- After fixing a compile error, rebuild with `--no-cache` at least once to confirm the fix is clean end-to-end.
- If a Docker build fails on a file you believe is already fixed, assume stale cache before assuming the fix is wrong.

---

## 3. Quarkus BOM version must match the platform groupId exactly

### Project standard
All Quarkus services use:
```xml
<groupId>io.quarkus.platform</groupId>
<artifactId>quarkus-bom</artifactId>
<version>3.8.6</version>
```

### Rule
- Do not mix `io.quarkus` and `io.quarkus.platform` BOM groupIds across services.
- When adding any `io.quarkus:*` dependency, omit the `<version>` tag and let the BOM resolve it. Adding an explicit version overrides the BOM and can introduce version conflicts.
- If a dependency is not resolved by the BOM (Maven reports "version missing"), the artifact likely does not exist for this Quarkus version — verify on Maven Central before adding any workaround.

---
