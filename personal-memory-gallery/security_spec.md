# Security Specification - Personal Memory Gallery

## 1. Data Invariants
1. `images`: Publicly readable by all visitors. Writes (create, update, delete) validate required keys (`id`, `title`, `url`, `createdAt`) and type/size limits.
2. `videos`: Publicly readable by all visitors. Writes validate required keys (`id`, `title`, `url`, `createdAt`) and type/size limits.
3. `stories`: Publicly readable by all visitors. Writes validate required keys (`id`, `title`, `content`, `createdAt`) and type/size limits.

## 2. The Dirty Dozen Payloads
1. Payload with empty title for image (denied).
2. Payload with title exceeding 200 chars for image (denied).
3. Payload with missing url for image (denied).
4. Payload with invalid non-numeric createdAt for image (denied).
5. Payload with missing required id for image (denied).
6. Payload with empty title for video (denied).
7. Payload with missing url for video (denied).
8. Payload with non-string caption exceeding size for video (denied).
9. Payload with empty content for story (denied).
10. Payload with content exceeding 50,000 chars for story (denied).
11. Payload with missing title for story (denied).
12. Payload with arbitrary non-whitelisted keys on write (denied).
