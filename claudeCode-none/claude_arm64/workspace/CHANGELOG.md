# Changelog

All notable changes to the Claude Code Multi-Agent System will be documented in this file.

## [Unreleased]

## [1.1.0] - 2026-03-12

### Added
- Intent recognition system for automatic Analysis/Coding mode switching
- Graded scheduling mechanism (simple/standard/deep tasks)
- Concurrent execution of analysis layer subagents
- Research Ledger structure for systematic analysis output
- Action decision framework with post-analysis recommendations
- Subagent failure handling strategies

### Changed
- **BREAKING**: Removed "Agent tool" mechanism descriptions from instructions
- Changed from "并行调度" (parallel dispatch) to "同时启动" (concurrent start) for clearer imperative language
- Replaced "调用" (call) with "启动" (start) throughout codebase
- Updated execution rules to emphasize concurrent/parallel execution over mechanism details
- Simplified instruction language to direct imperative commands

### Fixed
- Orchestrator now properly delegates to subagents instead of simulating roles
- Concurrent execution is now explicitly enforced in both orchestrator.md and CLAUDE.md

## [1.0.0] - 2026-03-11

### Added
- Initial multi-agent orchestrator system
- 6 analysis layer agents (task-planner, product-manager, backend-engineer, frontend-engineer, qa-engineer, security-tester)
- 2 execution layer agents (dev-coder, script-coder)
- 1 support layer agent (ops-engineer)
- Dual-mode architecture (Analysis Mode / Coding Mode)
- Knowledge system (domains.md, tools.md, patterns.md, corrections.md)
- Authorization and security boundary framework
