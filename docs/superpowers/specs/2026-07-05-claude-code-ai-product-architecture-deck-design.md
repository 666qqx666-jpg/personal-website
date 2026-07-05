# 从 Claude Code 到 AI 产品架构 Deck 设计 Spec

## 1. 背景

个人网站的 AI 落地实战栏目已有 `Personal Knowledge Harness` 旗舰 deck，讲述个人知识库与多 agent 记忆系统的产品化过程。第三个 deck 需要承接其中的起源线索：Claude Code 源码学习不是一个孤立的技术笔记，而是后续知识库、上下文工程和多 agent 记忆系统的方法论来源。

本 deck 的目标不是复述 Claude Code 源码章节，也不是做逐行教程，而是从源码学习中抽象出一套可迁移的 AI 产品架构框架。

## 2. 定位

标题建议：

《从 Claude Code 到 AI 产品架构》

副标题建议：

我从 AI Coding Agent 源码里抽象出的可迁移产品架构方法

一句话定位：

拆开 Claude Code 后，我意识到 AI 产品的核心不是“套一个模型”，而是设计模型能看到的输入、能调用的工具、能保留的状态、必须遵守的边界，以及持续反馈的工作闭环。

## 3. 受众与阅读目标

主要受众：

- 评估作者 AI 产品能力的访客。
- 对 agent 产品、AI coding、个人知识库和多 agent workflow 感兴趣的人。
- 想理解作者为什么能把 Claude Code 源码学习迁移到 Personal Knowledge Harness 实践的人。

读完后希望访客记住：

- 作者通过源码学习形成了自己的 AI 产品架构方法。
- 作者不是只会使用 AI coding 工具，而是理解其工程抽象，并能迁移到自己的产品设计中。
- 作者看 AI 产品时会同时关注输入、工具、上下文、控制、运行时和协作系统。

## 4. 内容策略

选择“产品方法论型”表达：

- 弱化“我当时怎么学”的过程。
- 强调“我从源码中抽象出了什么框架”。
- 每屏保留中等源码密度：一个关键认知配一个小源码片段、伪代码或流程图。
- 源码证据服务于方法论，不让技术细节压过主线。

每屏的标准结构：

1. 关键认知：这一屏要让访客记住的产品架构判断。
2. 源码证据：一个最小代码片段或流程图，证明这个判断来自真实工程机制。
3. 方法论抽象：把源码机制翻译成可迁移的 AI 产品设计原则。

## 5. Deck 结构

### S1 封面

标题：

从 Claude Code 到 AI 产品架构

核心文案：

我拆开的不是一个 coding 工具，而是一套 AI 产品如何组织输入、工具、状态、权限与协作的工程方法。

视觉建议：

左侧为标题和一句话定位，右侧为从 `system / messages / tools` 发散到 `context / control / runtime / multi-agent` 的架构图。整体保持深色 deck 风格，延续现有 `DeckLayout` 的 aurora 氛围，但图形要更偏工程架构。

### S2 第一性原理：模型看到的世界很小

关键认知：

再复杂的 harness，最终也只是把信息塞进 `system`、`messages` 和 `tools`。

源码证据：

```python
response = client.messages.create(
    system=SYSTEM,
    messages=messages,
    tools=TOOLS,
)
```

方法论抽象：

AI 产品经理设计的不是“页面流程”本身，而是模型能看到什么、不能看到什么、如何理解当前任务，以及能选择哪些行动入口。

### S3 Agent Loop：动态控制流

关键认知：

Agent 产品不是固定 workflow，而是模型驱动的动态控制流。

源码证据：

```python
while True:
    response = call_model(messages, tools)
    if response.stop_reason != "tool_use":
        return response
    results = run_tools(response.content)
    messages.append(tool_results(results))
```

方法论抽象：

传统产品设计“用户点哪里，系统做什么”；AI 产品设计“模型判断下一步，系统约束它怎么做”。产品职责从编排固定步骤，转向设计可控的行动空间。

### S4 Tool Interface：能力必须被模型理解

关键认知：

工具不是功能按钮，而是模型可理解、可选择、可调用的能力接口。

源码证据：

用三段式图表达：

`schema -> tool_use -> handler -> tool_result`

补充小片段：

```python
tools = [{"name": "read_file", "description": "..."}]
output = TOOL_HANDLERS[block.name](**block.input)
```

方法论抽象：

AI 产品里的功能设计必须同时面向两类用户：人类用户需要结果，模型需要清晰的工具名称、description、参数边界和失败反馈。

### S5 Context Architecture：上下文是产品瓶颈

关键认知：

Subagent、Skill、Compact 看似是不同模块，本质都在解决同一个问题：上下文怎么进、怎么出、怎么被压缩。

源码证据：

三栏对比：

- subagent：独立 `sub_messages`，只把摘要回传父 agent。
- skill：system prompt 放目录，tool result 按需加载全文。
- compact：超限后用摘要替换历史 messages。

方法论抽象：

AI 产品的关键不是让模型“知道更多”，而是让它每次只看到足够完成当前任务的最小上下文。

### S6 Control Plane：把控制权交给模型后，必须加控制层

关键认知：

一旦让模型决定下一步，产品就必须设计权限、拦截、恢复和观测。

源码证据：

流程图：

`tool_use -> permission gate -> handler -> hook -> tool_result`

补充机制：

- permission：拒绝危险工具调用，并把拒绝原因作为 `tool_result` 回写。
- hook：在固定时机插入审计、提醒、阻止或补充信息。
- recovery：输出截断、上下文过长、网络抖动分别走不同恢复策略。

方法论抽象：

AI 产品不能只设计“模型能做什么”，还要设计“模型什么时候不能做、被拦后如何知道、失败后如何继续”。

### S7 Runtime Layer：从聊天变成工作系统

关键认知：

真正可用的 AI 产品必须把一次对话升级为可持续推进的工作系统。

源码证据：

四种状态载体对比：

- todo：会话内计划草稿。
- task：落盘的持久工作目标和依赖图。
- background：慢命令后台运行，完成后通知主循环。
- cron：在未来某个时间自动注入一条 user message。

方法论抽象：

AI 产品里的“任务”不只是聊天里的待办项，而应该有生命周期、依赖关系、执行槽位和时间触发机制。

### S8 Multi-Agent Layer：多 agent 是系统设计，不是多开模型

关键认知：

多 agent 的核心不是同时调用多个模型，而是角色、状态、通信、协议、执行隔离和外部能力接入。

源码证据：

流程图：

`lead -> teammate inbox -> request record -> task claim -> worktree -> MCP tools`

补充模块：

- teammate：长期存在，有自己的 messages 和 inbox。
- protocol：用 request id 和状态机追踪协作。
- claim policy：决定谁能认领什么任务。
- worktree：为并行任务提供隔离执行目录。
- MCP：把外部能力接入同一条工具管道。

方法论抽象：

多 agent 产品要先设计组织结构和协作协议，再谈模型数量。否则只是把一个不稳定 agent 复制多份。

### S9 我的 AI 产品架构框架

关键认知：

从 Claude Code 源码中，可以抽象出一套可迁移的 AI 产品架构框架。

框架建议：

1. 输入层：`system / messages / tools`，决定模型看到的世界。
2. 工具层：schema、handler、tool result，决定模型能做什么。
3. 上下文层：skill、memory、subagent、compact，决定模型如何获得刚好够用的信息。
4. 控制层：permission、hook、recovery、budget，决定系统如何保持安全可靠。
5. 运行时层：todo、task、background、cron、team、worktree、MCP，决定工作如何持续推进和扩展。

视觉建议：

五层堆叠架构图，底部是用户目标，顶部是可交付结果，中间用箭头表示模型决策循环。

### S10 落到我的实践

关键认知：

Personal Knowledge Harness 不是凭空来的，而是这套 AI 产品架构方法在个人工作系统上的一次落地。

内容连接：

- Context Architecture -> 三层知识库与 context-pack。
- Control Plane -> 能力层、加载规则、入库门禁。
- Runtime Layer -> skill 工作流、复盘、计划、长期任务。
- Multi-Agent Layer -> Claude、Codex、OpenClaw 共用 Obsidian Vault 和共享 skills。

收束文案：

读 Claude Code 源码让我意识到：AI 产品的真正设计对象，不是模型本身，而是模型周围那套让它可靠工作的环境。

## 6. 信息架构与现有站点关系

建议路由：

`/ai/claude-code-architecture/`

建议 AI 栏目卡片更新：

- title：从 Claude Code 到 AI 产品架构
- hook：拆开 AI Coding Agent 源码，抽象出输入、工具、上下文、控制层与运行时的产品架构框架
- tags：`方法论`、`源码学习`、`AI 产品架构`

与现有 deck 的关系：

- `Personal Knowledge Harness` 是实践案例篇。
- 本 deck 是方法论来源篇。
- 两者互相跳转：本 deck 结尾链接到 Knowledge Harness，Knowledge Harness 的起源页可反向链接到本 deck。

## 7. 视觉与交互原则

- 复用 `DeckLayout` 的深色全屏 scroll-snap 结构，保持站内一致。
- 不做代码文档页；代码片段应短、准、可扫描。
- 每屏图形承担解释任务，避免大段文字堆叠。
- 图形风格偏架构图、流程图、状态机，不做装饰型插画。
- 每屏主标题控制在一行到两行，方法论句子控制在 1-2 句。
- 保留底部时间轴导航，节点可命名为：封面、输入、循环、工具、上下文、控制、运行时、多 agent、框架、实践。

## 8. 后续实现范围

下一阶段 implementation plan 应包含：

1. 新增 `/ai/claude-code-architecture/` deck 页面。
2. 复用或轻微扩展 `DeckLayout`，避免影响已上线 deck。
3. 更新 `/ai/` 列表卡片，把 Claude Code 条目链接到新 deck。
4. 增加基础 e2e 覆盖：页面可访问、10 个 section 存在、导航锚点可用。
5. 做桌面和移动端视觉 QA，重点检查代码片段、架构图和底部导航是否拥挤。

明确不做：

- 不引入新前端框架。
- 不做真实源码仓库浏览器。
- 不把 4000 行聊天记录全文搬进页面。
- 不改变现有 Knowledge Harness deck 的内容结构。

## 9. 验收标准

内容验收：

- 访客能在 1 分钟内理解本 deck 不是源码教程，而是 AI 产品架构方法论。
- 每屏都有明确的方法论抽象，不停留在模块介绍。
- 至少 5 屏包含短代码片段或流程图证据。
- 结尾能自然连接到 `Personal Knowledge Harness`。

体验验收：

- 桌面端每屏首屏内容完整可读，不需要横向滚动。
- 移动端不出现正文、代码片段、导航互相遮挡。
- 底部时间轴节点数量和标签长度不破坏现有布局。
- 深色主题下代码片段对比度足够，字号不压迫。

工程验收：

- `npm run build` 通过。
- 相关 Playwright 测试通过，或新增测试能稳定运行。
- 不引入与 deck 无关的全站样式回归。

## 10. Spec 自检

- 无待定内容：标题、路由、10 屏结构、内容密度和验收标准已明确。
- 无范围冲突：本阶段只定义 design spec，不进入页面实现。
- 与现有项目一致：沿用 `DeckLayout` 和 AI 栏目结构。
- 与用户方向一致：产品方法论型，中等源码密度，强调可迁移架构框架。
