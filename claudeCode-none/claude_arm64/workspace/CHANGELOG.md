# Changelog

All notable changes to the Claude Code Intelligent Task Execution System will be documented in this file.

## [2.0.0] - 2026-03-15

### Major Changes
- **BREAKING**: Complete system redesign from 660-line config-driven to 96-line intent-driven
- Removed: 2-stage execution model, config.yaml, stages/, complex state management
- Added: 3-mode auto-detection (Quick/Standard/Full)

### Added
- **Forced MODE DECISION output**: Must declare mode before any action
- **Quick mode**: Direct execution for simple tasks (0 agents, no state files)
- **Standard mode**: Default safe buffer with 1-2 agents, plan confirmation
- **Full mode**: Requires env var `CLAUDE_FULL_MODE=1`, default reject if not set
- **Mode-specific execution files**: quick-mode.md, standard-mode.md, full-mode.md
- **Conservative decision logic**: Any uncertainty → Standard mode
- **Explicit skill ban**: No auto-debugging skills unless user requests
- **Sequential agent execution**: No concurrent agents (Claude's concurrency is narrative-level)

### Changed
- CLAUDE.md: 660 lines → 96 lines (85% reduction)
- Intent-driven > Config-driven
- Solve problems > Prove compliance
- workflow/ from config to reference documentation
- Agent team: 9 agents → 5 agents (removed task-planner, orchestrator, ops-engineer, script-coder)

### Removed
- config.yaml
- stages/ (6 stage files)
- stages/templates/ (3 template files)
- task_plans/, subtask_queues/, execution_logs/, agent-memory/
- PROTOCOL.md (obsolete)
- 4 unused agents (orchestrator, task-planner, ops-engineer, script-coder)

### Fixed
- Claude no longer skips mode declaration
- Full mode now properly rejects without environment variable
- No more automatic skill usage
- Clear execution entry point for each mode

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
- Changed from "并行调度" (parallel dispatch) to "同时启动" (concurrent start)
- Replaced "调用" (call) with "启动" (start) throughout codebase
- Simplified instruction language to direct imperative commands

### Fixed
- Orchestrator now properly delegates to subagents
- Concurrent execution explicitly enforced

## [1.0.0] - 2026-03-11

### Added
- Initial multi-agent orchestrator system
- 6 analysis layer agents
- 2 execution layer agents
- 1 support layer agent
- Dual-mode architecture (Analysis/Coding)
- Knowledge system (domains, tools, patterns, corrections)
- Authorization and security boundary framework
