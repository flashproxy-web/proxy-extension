# Security Policy

## Supported versions

Only the latest release of the extension receives security fixes. Please check that the problem still exists in the latest version (or on `main`) before reporting it.

## Reporting a vulnerability

Report vulnerabilities privately through GitHub's private vulnerability reporting:

**[Report a vulnerability](https://github.com/flashproxy-web/proxy-extension/security/advisories/new)**

Do not open a public issue, pull request or discussion for a security problem.

Please include:

- The affected version or commit, and the browser and version.
- A description of the problem and its impact (for example, a leaked credential, a proxy bypass, or a PAC rule that escapes its string).
- Steps to reproduce or a proof of concept.
- Any suggested fix, if you have one.

Never include real API keys, proxy usernames or passwords, or other credentials in a report. Use placeholder values, and revoke any credential you think may have been exposed.

## What to expect

We aim to acknowledge reports within 5 business days and to keep you updated while we investigate. Once a fix is released, we are happy to credit you in the advisory unless you prefer to stay anonymous. Please give us reasonable time to release a fix before disclosing the issue publicly.

## Scope

This policy covers the code in this repository: the browser extension, its service worker and pages, and the build and test scripts.

FlashProxy's web services (the website, dashboard, API and proxy servers) are not part of this repository, but you can report vulnerabilities in them the same way and we will route them to the right team.
