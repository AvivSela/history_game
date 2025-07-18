# Documentation Organization Plan

## Current State
We have documentation files scattered across the repository:

**Root Level:**
- README.md
- CHANGELOG.md
- TECHNICAL_DEBT.md
- GETGAMESETTINGS_BUG_INVESTIGATION.md
- BEHAVIOR_TEST_CONVERSION_PLAN.md
- DUPLICATE_TEST_CONSOLIDATION_ANALYSIS.md
- REMOTE_AGENT_GUIDE.md
- DOCUMENTATION_ORGANIZATION_PLAN.md
- SETTINGS_TESTS_FIX_PLAN.md

**Existing docs/ directory:**
- docs/CI-CD-SETUP.md
- docs/FE-001-Animation-Performance-Plan.md
- docs/FE-002-Component-Organization-Plan.md
- docs/FE-003-Test-File-Consistency-Plan.md
- docs/FE-004-State-Management-Plan.md
- docs/FE-013-017-Code-Quality-Improvements-Plan.md
- docs/FE-018-Frontend-State-Persistence-Plan.md
- docs/PR-STATUS-TROUBLESHOOTING.md
- docs/technical-debt-guide.md

**Frontend-specific:**
- timeline-frontend/README.md
- timeline-frontend/BEHAVIOR_TEST_CONVERSION_PLAN.md
- timeline-frontend/OVERLY_GRANULAR_TESTS_ANALYSIS.md
- timeline-frontend/OVERLY_GRANULAR_TESTS_CLEANUP_SUMMARY.md
- timeline-frontend/TESTING_GUIDELINES.md

**Test-related:**
- src/tests/GAME_STATE_TEST_PLAN.md
- src/tests/LAYOUT_FIX_TESTING.md
- src/tests/README.md
- src/tests/STABLE_TESTING_APPROACH.md

## Proposed Structure (Reorganizing Existing Files Only)

```
docs/
├── guides/                        # Development guides
│   ├── remote-agent-guide.md      # REMOTE_AGENT_GUIDE.md
│   └── testing-guidelines.md      # timeline-frontend/TESTING_GUIDELINES.md
├── technical/                     # Technical documentation
│   ├── debt/                      # Technical debt tracking
│   │   ├── technical-debt.md      # TECHNICAL_DEBT.md
│   │   └── technical-debt-guide.md # docs/technical-debt-guide.md
│   ├── investigations/            # Technical investigations
│   │   ├── getgamesettings-bug.md # GETGAMESETTINGS_BUG_INVESTIGATION.md
│   │   └── duplicate-tests.md     # DUPLICATE_TEST_CONSOLIDATION_ANALYSIS.md
│   ├── plans/                     # Technical improvement plans
│   │   ├── animation-performance.md    # docs/FE-001-Animation-Performance-Plan.md
│   │   ├── component-organization.md   # docs/FE-002-Component-Organization-Plan.md
│   │   ├── test-file-consistency.md    # docs/FE-003-Test-File-Consistency-Plan.md
│   │   ├── state-management.md         # docs/FE-004-State-Management-Plan.md
│   │   ├── code-quality-improvements.md # docs/FE-013-017-Code-Quality-Improvements-Plan.md
│   │   ├── frontend-state-persistence.md # docs/FE-018-Frontend-State-Persistence-Plan.md
│   │   ├── behavior-test-conversion.md  # BEHAVIOR_TEST_CONVERSION_PLAN.md
│   │   ├── settings-tests-fix.md       # SETTINGS_TESTS_FIX_PLAN.md
│   │   └── documentation-organization.md # DOCUMENTATION_ORGANIZATION_PLAN.md
│   └── testing/                   # Testing documentation
│       ├── game-state-test-plan.md    # src/tests/GAME_STATE_TEST_PLAN.md
│       ├── layout-fix-testing.md      # src/tests/LAYOUT_FIX_TESTING.md
│       ├── testing-approach.md        # src/tests/STABLE_TESTING_APPROACH.md
│       ├── overly-granular-tests-analysis.md    # timeline-frontend/OVERLY_GRANULAR_TESTS_ANALYSIS.md
│       └── overly-granular-tests-cleanup.md     # timeline-frontend/OVERLY_GRANULAR_TESTS_CLEANUP_SUMMARY.md
├── ci-cd/                         # CI/CD documentation
│   ├── setup.md                   # docs/CI-CD-SETUP.md
│   └── troubleshooting.md         # docs/PR-STATUS-TROUBLESHOOTING.md
└── frontend/                      # Frontend-specific docs
    └── README.md                  # timeline-frontend/README.md

## Migration Plan

1. Create new directory structure (guides/, technical/, ci-cd/, frontend/)

2. Move existing files:
   **To docs/guides/:**
   - REMOTE_AGENT_GUIDE.md → docs/guides/remote-agent-guide.md
   - timeline-frontend/TESTING_GUIDELINES.md → docs/guides/testing-guidelines.md

   **To docs/technical/debt/:**
   - TECHNICAL_DEBT.md → docs/technical/debt/technical-debt.md
   - docs/technical-debt-guide.md → docs/technical/debt/technical-debt-guide.md

   **To docs/technical/investigations/:**
   - GETGAMESETTINGS_BUG_INVESTIGATION.md → docs/technical/investigations/getgamesettings-bug.md
   - DUPLICATE_TEST_CONSOLIDATION_ANALYSIS.md → docs/technical/investigations/duplicate-tests.md

   **To docs/technical/plans/:**
   - docs/FE-001-Animation-Performance-Plan.md → docs/technical/plans/animation-performance.md
   - docs/FE-002-Component-Organization-Plan.md → docs/technical/plans/component-organization.md
   - docs/FE-003-Test-File-Consistency-Plan.md → docs/technical/plans/test-file-consistency.md
   - docs/FE-004-State-Management-Plan.md → docs/technical/plans/state-management.md
   - docs/FE-013-017-Code-Quality-Improvements-Plan.md → docs/technical/plans/code-quality-improvements.md
   - docs/FE-018-Frontend-State-Persistence-Plan.md → docs/technical/plans/frontend-state-persistence.md
   - BEHAVIOR_TEST_CONVERSION_PLAN.md → docs/technical/plans/behavior-test-conversion.md
   - SETTINGS_TESTS_FIX_PLAN.md → docs/technical/plans/settings-tests-fix.md
   - DOCUMENTATION_ORGANIZATION_PLAN.md → docs/technical/plans/documentation-organization.md

   **To docs/technical/testing/:**
   - src/tests/GAME_STATE_TEST_PLAN.md → docs/technical/testing/game-state-test-plan.md
   - src/tests/LAYOUT_FIX_TESTING.md → docs/technical/testing/layout-fix-testing.md
   - src/tests/STABLE_TESTING_APPROACH.md → docs/technical/testing/testing-approach.md
   - timeline-frontend/OVERLY_GRANULAR_TESTS_ANALYSIS.md → docs/technical/testing/overly-granular-tests-analysis.md
   - timeline-frontend/OVERLY_GRANULAR_TESTS_CLEANUP_SUMMARY.md → docs/technical/testing/overly-granular-tests-cleanup.md

   **To docs/ci-cd/:**
   - docs/CI-CD-SETUP.md → docs/ci-cd/setup.md
   - docs/PR-STATUS-TROUBLESHOOTING.md → docs/ci-cd/troubleshooting.md

   **To docs/frontend/:**
   - timeline-frontend/README.md → docs/frontend/README.md

3. Update references:
   - Update links in root README.md
   - Update references in code comments
   - Update CI/CD script references
   - Update links between documentation files

## Documentation Standards

1. File Names:
   - Use lowercase
   - Use hyphens for spaces
   - Use .md extension
   - Be descriptive but concise

2. Content Structure:
   - Clear headings (H1 for title, H2 for sections)
   - Table of contents for longer documents
   - Code examples in appropriate blocks
   - Links to related documentation
   - Date of last update

3. Markdown Style:
   - Use consistent formatting
   - Include code syntax highlighting
   - Use tables for structured data
   - Use lists for steps/items

4. Maintenance:
   - Regular reviews (quarterly)
   - Version tracking in CHANGELOG.md
   - Clear update/review process
   - Automated link checking

## Implementation Steps

1. Create directory structure:
   - docs/guides/
   - docs/technical/debt/
   - docs/technical/investigations/
   - docs/technical/plans/
   - docs/technical/testing/
   - docs/ci-cd/
   - docs/frontend/

2. Move existing files to new locations (as detailed in Migration Plan)

3. Update file references:
   - Update root README.md links
   - Update code comment references
   - Update CI/CD script paths
   - Update cross-references between docs

4. Review and validate:
   - Ensure all links work correctly
   - Verify file organization makes sense
   - Test that documentation is easily discoverable

## Success Criteria

1. All existing documentation is:
   - Logically organized by category
   - Easy to find in the new structure
   - Properly linked with updated references
   - Consistently located (no scattered files)

2. The reorganized structure allows developers to:
   - Quickly find relevant documentation by type
   - Navigate between related documents easily
   - Understand the relationship between different docs
   - Access technical details in appropriate categories

3. The reorganization achieves:
   - Clear separation of concerns (guides vs technical vs plans)
   - Reduced clutter in root directory
   - Better discoverability of related documents
   - Consistent file naming and organization 