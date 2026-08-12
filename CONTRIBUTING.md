# Contributing

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use a development Firebase project and never commit populated environment files.

## Quality checks

```bash
npm run lint
npm run format:check
npm run build
npm test
```

Pull requests should include focused tests for behavior changes and
documentation updates for configuration or user-facing workflow changes.

## Community and security

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md);
do not open a public issue for security-sensitive findings.

Contributions are accepted under the repository's
[Elastic License 2.0](LICENSE).
