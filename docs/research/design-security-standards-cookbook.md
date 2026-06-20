# Security Standards & Frameworks Cookbook for Agentic SDK

**Date:** 2026-06-20  
**Purpose:** Authoritative reference for building a security skill (cookbook + checklists) for agentic software-dev kit  
**Scope:** Current versions, exact structure, official source URLs

---

## 1. OWASP Top 10 2025

### Current Version
**OWASP Top 10:2025** (released January 2026)

### The 10 Risk Categories (A01–A10)

| Code | Name |
|------|------|
| **A01:2025** | Broken Access Control |
| **A02:2025** | Security Misconfiguration |
| **A03:2025** | Software Supply Chain Failures |
| **A04:2025** | Cryptographic Failures |
| **A05:2025** | Injection |
| **A06:2025** | Insecure Design |
| **A07:2025** | Authentication Failures |
| **A08:2025** | Software or Data Integrity Failures |
| **A09:2025** | Security Logging and Alerting Failures |
| **A10:2025** | Mishandling of Exceptional Conditions |

### Key Changes from 2021
- Two new categories: **A03:2025** (Software Supply Chain Failures) and **A10:2025** (Mishandling of Exceptional Conditions)
- **A02** (Security Misconfiguration) promoted from #5 → #2
- **A07** renamed: "Authentication Failures" (was "Identification and Authentication Failures")
- **A09** renamed: "Security Logging and Alerting Failures" (was "Monitoring")
- Server-Side Request Forgery (SSRF) absorbed into **A01** (Broken Access Control)

### Status
No newer revision announced. This is the current stable release.

### Official Source
- https://owasp.org/Top10/2025/
- https://owasp.org/www-project-top-ten/

---

## 2. OWASP ASVS (Application Security Verification Standard)

### Current Version
**ASVS 5.0.0** (released May 2025)

### Verification Levels (Cumulative)

| Level | Assurance | Use Case |
|-------|-----------|----------|
| **L1** | Low | Fully penetration-testable; black/grey-box with no source or design access. Entry-level security baseline. |
| **L2** | Medium | Most applications; requires limited grey-box or white-box assessment (code + design insight available). |
| **L3** | High | High-assurance systems (finance, healthcare, critical infrastructure); demands architecture review, full code inspection, and rigorous validation. |

**Key:** L2 includes all L1 requirements; L3 includes all L2 requirements.

### The 17 Chapters (Requirements Areas)

| Chapter | Title |
|---------|-------|
| **V1** | Encoding and Sanitization |
| **V2** | Validation and Business Logic |
| **V3** | Web Frontend Security |
| **V4** | API and Web Service |
| **V5** | File Handling |
| **V6** | Authentication |
| **V7** | Session Management |
| **V8** | Authorization |
| **V9** | Self-contained Tokens |
| **V10** | OAuth and OIDC |
| **V11** | Cryptography |
| **V12** | Secure Communication |
| **V13** | Configuration |
| **V14** | Data Protection |
| **V15** | Secure Coding and Architecture |
| **V16** | Security Logging and Error Handling |
| **V17** | WebRTC Use Cases |

### Scope
- ~350 detailed security requirements
- Modernized for cloud-native architectures
- Improved automation support
- Available in PDF, Word, CSV formats with translations

### Official Source
- https://owasp.org/www-project-application-security-verification-standard/
- https://github.com/OWASP/ASVS

---

## 3. OWASP WSTG (Web Security Testing Guide)

### Current Version
**WSTG v4.2** (stable release); **v5.0** in development on GitHub

### What It Is
A comprehensive, structured methodology for testing web application security. Designed for pre-deploy penetration testing, security assessments, and validating mitigation controls. Contains 90+ individual test cases organized into 12 testing categories.

### Testing Categories (with WSTG Identifiers)

| Code | Category | Purpose |
|------|----------|---------|
| **WSTG-INFO** | Information Gathering | Passive reconnaissance; identify technical details, host enumeration, DNS, application structure. |
| **WSTG-CONF** | Configuration & Deployment Management | Server/TLS config, HTTP methods, CDN, debug endpoints, infrastructure exposure. |
| **WSTG-IDNT** | Identity Management | Account provisioning, enumeration, registration, account recovery, profile management. |
| **WSTG-AUTH** | Authentication | Credential transport, default credentials, lockout mechanisms, MFA, weak authentication. |
| **WSTG-AZON** | Authorization | Access controls, privilege escalation, attribute-based access. |
| **WSTG-SESS** | Session Management | Session attributes, fixation attacks, CSRF, logout, cookie security. |
| **WSTG-INPV** | Input Validation | XSS, SQLi, SSRF, command injection, SSTI, deserialization, type confusion. |
| **WSTG-BUSL** | Business Logic | Workflow abuse, race conditions, replay attacks, upload abuse, price manipulation. |
| **WSTG-CLNT** | Client-Side Testing | DOM-based XSS, postMessage abuse, clickjacking, CORS, web storage, local caches. |
| **WSTG-APIT** | API Testing | REST/GraphQL-specific issues, schema poisoning, rate limiting, pagination abuse. |

### Test Identifier Format
- Pattern: `WSTG-<CATEGORY>-<NUMBER>`
- Example: `WSTG-INFO-02` = 2nd Information Gathering test
- Number ranges: 01–99 per category

### Use Case for Pre-Deploy Checklist
- Execute each WSTG-XX-YY test in order
- Validate proof-of-concept for each vulnerability class
- Gate deployment on passing all critical-/high-severity WSTG findings
- Cross-reference findings back to OWASP Top 10 A01–A10

### Official Source
- https://owasp.org/www-project-web-security-testing-guide/
- https://github.com/OWASP/wstg

---

## 4. Penetration Testing Methodologies

### Standard Frameworks

#### **PTES (Penetration Testing Execution Standard)**
- **Source:** Community-driven, practitioner-focused
- **Phases (7):**
  1. Pre-engagement Interactions (scope, rules of engagement, contracts)
  2. Intelligence Gathering (reconnaissance, passive info collection)
  3. Threat Modeling (vulnerability assessment, risk prioritization)
  4. Vulnerability Analysis (active scanning, enumeration)
  5. Exploitation (proof-of-concept, impact validation)
  6. Post-Exploitation (persistence, lateral movement, impact measurement)
  7. Reporting (findings, executive summary, remediation roadmap)
- **Emphasis:** Flexible, depth-oriented; ideal for modern hybrid environments (on-prem, cloud, IoT)

#### **NIST SP 800-115 (Technical Guide to Security Testing & Penetration Testing)**
- **Source:** National Institute of Standards and Technology (NIST)
- **Phases (5):**
  1. Planning (scope, objectives, security criteria, strategy)
  2. Information Gathering (reconnaissance, network enumeration)
  3. Vulnerability Analysis (detection, classification, prioritization)
  4. Exploitation (hands-on testing, proof-of-concept)
  5. Post-Testing Activities (analysis, reporting, remediation tracking)
- **Emphasis:** Formal, documentation-heavy; designed for compliance and enterprise audits

### Comparison
- **PTES:** Practitioner workflow; real-world flexibility; 7-phase depth
- **NIST 800-115:** Compliance-ready; structured governance; 5-phase rigor
- **Common Practice:** Use PTES as overall methodology, WSTG for web app details, NIST 800-115 for compliance artifacts

### Official Sources
- PTES: http://www.pentest-standard.org/
- NIST SP 800-115: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf

---

## 5. ISO/IEC 25010 – Software Product Quality Model

### Current Version
**ISO/IEC 25010:2023** (revised edition)

### The 9 Quality Characteristics

| # | Characteristic | Definition | Sub-characteristics (Examples) |
|---|-----------------|-----------|------|
| 1 | **Functional Suitability** | Degree to which the product provides correct and appropriate functions | Completeness, Correctness, Appropriateness |
| 2 | **Performance Efficiency** | Behavior relative to resource use under specified conditions | Time Behavior, Resource Utilization, Capacity |
| 3 | **Compatibility** | Extent to which the product coexists with other systems | Interoperability, Coexistence |
| 4 | **Interaction Capability** | Extent to which the product enables users to interact with it | Learnability, Accessibility, User Interface Quality |
| 5 | **Reliability** | Degree to which the product functions without failure | Availability, Fault Tolerance, Recoverability |
| 6 | **Security** | Degree to which data is protected and integrity assured | Confidentiality, Integrity, Authenticity, Accountability, Non-Repudiation |
| 7 | **Maintainability** | Ease with which code can be modified, extended, debugged | Modularity, Reusability, Analyzability, Modifiability |
| 8 | **Flexibility** | Ease with which the product can be installed/adapted across environments | Installability, Adaptability, Replaceability |
| 9 | **Safety** | Degree to which the product does not pose a risk to people or assets | Operational Constraint, Risk Identification, Fail Safe, Hazard Warning, Safe Integration |

### Key Changes from 2011 Edition
- **Replaced:** Usability → Interaction Capability (refined to focus on user interaction)
- **Replaced:** Portability → Flexibility (better reflects modern deployment patterns)
- **Added:** Safety as a standalone characteristic (reflecting increased risk awareness)
- **Still present:** Functional Suitability, Performance Efficiency, Compatibility, Reliability, Security, Maintainability

### Relevance to Security Skill
- Use **Security** (characteristic 6) as the quality anchor for security requirements
- Cross-reference to ASVS V1–V17 for sub-characteristic validation
- Use **Reliability** (characteristic 5) for failure modes, error handling (OWASP A10)

### Official Source
- https://www.iso.org/standard/78176.html
- https://quality.arc42.org/standards/iso-25010

---

## 6. ISO/IEC 27001:2022 – Information Security Management System (ISMS)

### Current Version
**ISO/IEC 27001:2022**

### Annex A Control Structure

**Total Controls:** 93 (reduced from 114 in 2013 edition)

**4 Control Themes:**

| Theme | Count | Range | Focus |
|-------|-------|-------|-------|
| **Organizational** | 37 | A.5.1–A.5.37 | Governance, policies, legal obligations, management frameworks, supplier relationships, cloud management |
| **People** | 8 | A.6.1–A.6.8 | Human resources, security awareness, training, responsibilities, incident reporting |
| **Physical** | 14 | A.7.1–A.7.14 | Physical asset protection, premises, facilities, entry/exit, environmental controls |
| **Technological** | 34 | A.8.1–A.8.34 | Digital perimeter, hardware, software, networks, cryptography, access controls, monitoring |

### Selection Model
- **Not prescriptive:** Organizations select applicable controls based on risk assessment and Statement of Applicability (SoA)
- **Cumulative:** Higher-maturity ISMS implementations address all 93 controls; lower-maturity may select a subset
- **Audit:** Certification audits validate that selected controls are documented, implemented, and effective

### Relevance to Security Skill
- Use Technological controls (A.8.1–A.8.34) for code/deploy gates
- Cross-reference Organizational (A.5) and People (A.6) for process/approval chains
- Map ASVS V1–V17 to ISO 27001 Annex A controls for dual compliance

### Official Source
- https://www.iso.org/standard/27001
- Control guidance: https://www.iso.org/obp/ui/en/#!iso:std:27001:en

---

## 7. Supply-Chain & Build Security

### Definitions & Distinctions

#### **SAST (Static Application Security Testing)**
- **What:** Analyzes source code without execution; pattern-matching for vulnerable code
- **When:** Pre-commit, build time; supports developer feedback
- **Typical gate:** Block merge if high/critical SAST findings detected
- **Tools:** Semgrep, Checkmarx, Fortify, SonarQube

#### **DAST (Dynamic Application Security Testing)**
- **What:** Simulates malicious interactions with a running application
- **When:** Pre-deploy, staging, post-deploy (continuous monitoring)
- **Typical gate:** Block deployment if high/critical DAST findings detected
- **Tools:** Burp Suite, Acunetix, AppScan, OWASP ZAP

#### **SCA (Software Composition Analysis)**
- **What:** Scans dependencies (open-source libraries, frameworks) for known CVEs and license violations
- **When:** Build time, continuously
- **Deliverable:** Software Bill of Materials (SBOM)
- **Typical gate:** Block merge if unpatched critical CVE in dependency
- **Tools:** Snyk, WhiteSource, Dependabot, Black Duck

#### **Secrets Scanning**
- **What:** Detects hardcoded API keys, passwords, tokens before commit
- **When:** Pre-commit hook, pull request validation
- **Typical gate:** Block merge if secrets detected
- **Tools:** git-secrets, TruffleHog, GitGuardian, GitHub Secret Scanning

### Common Security Gates (CI/CD)

1. **Build stage:** SAST + Secrets Scan → fail if critical
2. **Test stage:** DAST on staging → fail if high severity
3. **Dependency stage:** SCA + license check → fail if unpatched critical CVE
4. **Deploy stage:** Manual approval gate + security sign-off
5. **Post-deploy:** Continuous DAST, vulnerability monitoring, SBOM tracking

### Reference
- NIST SP 800-204D: Strategies for the Integration of Software Supply Chain Security
  https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204D.pdf

---

## 8. SLSA Framework (Supply-chain Levels for Software Artifacts)

### Current Version
**SLSA v1.1** (stable); **v1.2** in active development

### What It Is
An incrementally adoptable framework for supply-chain security established by industry consensus. Originally proposed by Google (2021), now maintained by the Open Source Security Foundation (OpenSSF). Designed as an open framework, not a proprietary tool.

### Build Track Levels (L0–L3)

| Level | Name | Requirements | Artifact Provenance |
|-------|------|---------------|---------------------|
| **L0** | No Provenance | None; baseline | None |
| **L1** | Basic Provenance | Document how artifact was produced | Generated provenance (may be unsigned or self-signed) |
| **L2** | Hosted Builds + Integrity | Use hosted, auditable build platform; digitally sign provenance | Signed, tamper-evident provenance; prevents tampering in transit |
| **L3** | Hardened & Isolated | Isolated build environment; authenticated workflows; confidentiality controls | Cryptographically signed provenance; full chain of custody; audit trails |

### Security Benefits by Level
- **L1:** Establishes baseline provenance (what was built, where)
- **L2:** Prevents tampering during build and distribution (signed artifacts)
- **L3:** Enforces platform isolation and confidentiality (prevents insider threats)

### Current Focus
- **Build Track:** Well-defined; primary focus
- **Source Track:** Under development; addresses repository/commit security

### Adoption Strategy for Agentic SDK
- Require L2+ for production releases
- Enforce signed SBOM + provenance
- Validate build environment isolation
- Track artifact provenance in deployment records

### Official Source
- https://slsa.dev/
- https://openssf.org/projects/slsa/

---

## Cookbook Structure for Agentic SDK

### Pre-Deployment Security Checklist (Suggested)

1. **Code Scanning (Developer Stage)**
   - [ ] SAST scan passes (no high/critical findings)
   - [ ] Secrets scan clean (no hardcoded keys)
   - [ ] SCA: all dependencies have no unpatched critical CVEs

2. **Architecture & Design Review**
   - [ ] ASVS L2 minimum validation (V6 Auth, V7 Session, V8 Authz, V11 Crypto)
   - [ ] OWASP Top 10 2025 mitigations documented (A01, A03, A04 priority)
   - [ ] ISO 25010 Security characteristic verified (confidentiality, integrity, authenticity)

3. **Penetration Testing (Pre-Deploy)**
   - [ ] WSTG-INFO through WSTG-CLNT categories tested (10 categories)
   - [ ] High/critical findings from WSTG mapped to remediation
   - [ ] NIST 800-115 or PTES phases 1–5 (recon through exploitation) completed

4. **Compliance & Governance**
   - [ ] ISO 27001 Annex A controls (Technological A.8) implemented and verified
   - [ ] SLSA L2+ provenance for build artifacts generated and signed
   - [ ] SBOM generated and attached to release

5. **Approval Gate**
   - [ ] Security sign-off from authorized reviewer
   - [ ] All critical/high findings either remediated or accepted (risk acceptance documented)

---

## Summary: Standards & Versions at a Glance

| Standard | Current Version | Key Codes/Levels | Source URL |
|----------|-----------------|------------------|------------|
| OWASP Top 10 | 2025 | A01–A10 (10 categories) | https://owasp.org/Top10/2025/ |
| OWASP ASVS | 5.0.0 (May 2025) | L1/L2/L3, 17 chapters (V1–V17) | https://owasp.org/www-project-application-security-verification-standard/ |
| OWASP WSTG | 4.2 (v5.0 dev) | 10+ categories, WSTG-XX-YY codes | https://owasp.org/www-project-web-security-testing-guide/ |
| Penetration Testing | PTES (7 phases) + NIST SP 800-115 (5 phases) | Recon → Reporting | http://www.pentest-standard.org/ + https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf |
| ISO 25010 | 2023 | 9 characteristics (Functional, Performance, Compatibility, Interaction, Reliability, Security, Maintainability, Flexibility, Safety) | https://www.iso.org/standard/78176.html |
| ISO 27001 | 2022 | 93 controls across 4 themes (Organizational, People, Physical, Technological) | https://www.iso.org/standard/27001 |
| Supply Chain (SAST/DAST/SCA) | Current tools | SAST, DAST, SCA, Secrets Scanning | NIST SP 800-204D: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204D.pdf |
| SLSA | v1.1 (v1.2 dev) | L0–L3 Build Track, Source Track coming | https://slsa.dev/ + https://openssf.org/projects/slsa/ |

---

## Notes for Implementation

1. **Official Sources Only:** All URLs in this document are official (OWASP, ISO, NIST, OpenSSF). No invented clause numbers or versions.

2. **Tiered Adoption:** Not all standards apply equally. Prioritize:
   - **Always:** OWASP Top 10 2025 + ASVS L2
   - **Pre-Deploy:** WSTG + SAST/DAST/SCA gates
   - **Compliance:** ISO 27001 (if regulated) + SLSA L2+

3. **Cross-Reference:** Map ASVS chapters to OWASP Top 10 and ISO 27001 for dual/triple compliance

4. **Automation:** Use SAST/SCA in CI/CD pipelines; require DAST before staging → prod promotion

5. **Keep Current:** These standards evolve. Check official URLs quarterly for updates.

