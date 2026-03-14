# 执行报告：task-{{task_id}}

## 基本信息
- 任务 ID: task-{{task_id}}
- 开始时间: {{start_time}}
- 结束时间: {{end_time}}
- 总耗时: {{duration}}
- 状态: {{status}}

## 执行阶段
| 阶段 | 状态 | 开始时间 | 结束时间 | 耗时 |
|------|------|----------|----------|------|
| Planning | {{planning_status}} | {{planning_start}} | {{planning_end}} | {{planning_duration}} |
| Init | {{init_status}} | {{init_start}} | {{init_end}} | {{init_duration}} |
| Git Prepare | {{git_status}} | {{git_start}} | {{git_end}} | {{git_duration}} |
| Knowledge | {{knowledge_status}} | {{knowledge_start}} | {{knowledge_end}} | {{knowledge_duration}} |
| Execution | {{execution_status}} | {{execution_start}} | {{execution_end}} | {{execution_duration}} |
| Quality Gate | {{quality_status}} | {{quality_start}} | {{quality_end}} | {{quality_duration}} |
| Completion | {{completion_status}} | {{completion_start}} | {{completion_end}} | {{completion_duration}} |

## Agent 执行情况
{{#each agents}}
### {{@index}}. {{name}}
- 状态: {{status}}
- 耗时: {{duration}}
- 结果: {{result}}
{{/each}}

## Quality Gate 结果
- 静态分析: {{static_analysis_status}}
- 安全扫描: {{security_scan_status}}
- 自动测试: {{tests_status}}

## 错误和异常
{{#if errors}}
{{#each errors}}
- [{{timestamp}}] {{stage}}: {{error}}
{{/each}}
{{else}}
无
{{/if}}

## 总结
{{summary}}
