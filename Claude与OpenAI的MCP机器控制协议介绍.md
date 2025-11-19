---
AIGC: {"Label": "1", "ContentProducer": "001191330101MA27WPYJ18xliu", "ProduceID": "43d9c9a9-ea2e-46df-9281-4cb16195ed56", "ReserveCode1": "iflow", "ContentPropagator": "iflow", "PropagateID": "iflow", "ReserveCode2": "iflow"}
---


# MCP(机器控制协议)技术详解与实践指南

![LLM API通信协议](./images/llm_api_protocol.jpg)

**报告日期：2025年09月18日**

## 目录
- [1. MCP协议概述](#1-mcp协议概述)
  - [1.1 MCP的技术架构与工作原理](#11-mcp的技术架构与工作原理)
- [2. MCP与Function Call的对比分析](#2-mcp与function-call的对比分析)
  - [2.1 选择指南与最佳实践](#21-选择指南与最佳实践)
- [3. MCP的核心优势与价值](#3-mcp的核心优势与价值)
  - [3.1 MCP的典型应用场景](#31-mcp的典型应用场景)
- [4. 从Function Call迁移到MCP的实施步骤](#4-从function-call迁移到mcp的实施步骤)
  - [4.1 MCP服务器与客户端实现代码示例](#41-mcp服务器与客户端实现代码示例)
  - [4.2 MCP交互流程与最佳实践](#42-mcp交互流程与最佳实践)
- [5. 结论与展望](#5-结论与展望)

## 引言

随着大语言模型(LLM)技术的快速发展，如何更有效地与这些强大的AI模型进行交互成为开发者面临的关键挑战。机器控制协议(Machine Control Protocol, MCP)作为一种新兴的标准化通信协议，正逐渐成为连接人类与AI系统的重要桥梁。本报告将全面介绍MCP的技术细节、应用价值，并通过与传统Function Call方法的对比，为开发者提供从理论到实践的全面指导。

## 1. MCP协议概述

MCP（Model Context Protocol）是由 Anthropic 于 2024 年 11 月提出的面向 AI 系统的人机/机机通信开放协议，旨在标准化模型上下文表达与控制指令，从而在不同模型、工具与应用之间实现一致、可扩展、可治理的交互方式[^1]。它被形象地称为“AI 界的 USB‑C 接口”，强调通用性与互操作性[^1]。

- 定义与背景
  - 面向 LLM 与外部工具/数据源之间的统一通信协议，规范消息格式、能力暴露与控制语义[^1]。
  - 目标是降低各家模型与工具链集成的摩擦，促进生态协同与能力复用[^1]。

- 核心目标与设计目的[^1]
  1) 解耦架构：将“模型能力”与“调用方式”解耦，减少业务/模型强耦合。
  2) 协议层抽象：以协议为边界沉淀通用约束与语义，避免各自为政的私有接口。
  3) 生态建设：面向第三方工具、插件与平台开放统一接入面，促进生态繁荣。
  4) 性能优化：通过协议栈与数据结构优化，降低序列化/传输开销。

- 为什么 MCP 对 LLM 重要
  - 降低接入成本与耦合度：统一能力表述与发现机制，减少重复集成工作。
  - 提升协作与复用：跨模型、跨平台互操作，打通上下游工具链。
  - 增强可观测与治理：协议层定义状态、事件与错误语义，便于监控与审计。
  - 面向未来的兼容性：预留扩展点与版本协商，支持迭代与创新。

- “USB‑C”类比的含义[^1]
  - 通用性：一套协议适配多种模型/运行时/工具。
  - 双向通信：既能发起指令也能回传状态/事件，支持同步与流式交互。
  - 协议扩展：兼容增量扩展与能力升级，保持向后兼容。

- 关键能力边界（概览）
  - 标准化模型控制指令集（如工具调用、资源访问、上下文管理）。
  - 工具/插件注册与发现，能力声明与权限控制。
  - 会话状态管理与上下文注入，跨轮对话一致性保证。
  - 事件与流式更新通道，便于传输中间状态与可观测数据。

### 1.1 MCP的技术架构与工作原理

MCP 采用分层、可插拔的网关—运行时体系结构，以协议适配与会话管理为核心，兼顾高并发与低延迟的工程需求。典型拓扑如下：

```
[Client App] ←HTTP/2→ [MCP Proxy] ←gRPC→ [Model Runtime]
```

- 核心组件
  1) 协议适配层
     - 负责请求/响应的序列化与反序列化。
     - 支持 JSON/Protobuf 等多种编码格式转换，便于在不同系统间互通。
  2) 会话管理器
     - 维护多轮对话的上下文与状态。
     - 提供请求去重、响应缓存与幂等控制，保证一致性与稳定性。
  3) 流量控制器
     - 令牌桶限流与优先级队列调度，保障多租户/多任务场景的公平与性能。
     - 配合熔断与降级策略，提升故障隔离与恢复能力。
  4) 安全与治理（贯穿全栈）
     - 接口鉴权、权限校验与审计日志。
     - 错误语义统一化，便于监控、告警与合规留痕。

- 工作原理（端到端流程）
  1) 客户端通过 REST/HTTP/2 发起结构化请求（包含工具/资源声明与上下文）。
  2) MCP Proxy 完成协议转换与安全校验，将请求路由至指定 Model Runtime。
  3) Model Runtime 执行推理与工具调用，按协议返回结构化结果与中间状态。
  4) 反馈通道支持实时回传进度/事件，客户端可进行交互式消费与控制。

- 数据与交互特性
  - 数据模型：面向消息与指令的强约束结构，统一字段与错误码。
  - 序列化：JSON 便于可读与调试，Protobuf 便于高性能与跨语言。
  - 交互范式：既支持请求/响应式，也支持服务端流式推送中间结果。

- 工程化指标（示例）
  - 延迟：平均延迟 < 50ms，P99 < 200ms（取决于模型负载与网络栈）。
  - 吞吐：10K+ QPS 的水平扩展能力，通过无状态网关与分片部署实现。
  - 稳定性：内置熔断与降级机制，保护下游模型与外部工具的可用性。

## 2. MCP与Function Call的对比分析

![Function Call与MCP对比](./images/function_call_vs_mcp.jpg)

MCP 是面向端到端的人机/机机交互协议，内置对话状态与上下文控制；而 Function Call 则是将自然语言转换为结构化 API 调用的机制，常用于单次或短链路的工具调用[^34][^102]。两者并非对立：在很多系统中，MCP 作为上层协议框架承载能力治理与状态管理，而底层仍可通过 Function Call 来完成具体的工具调用与参数编排[^34][^102]。在企业级需要多系统深度集成与合规治理的场景，MCP 更具优势；在一次性或轻量化调用场景，Function Call 则具备极高的性价比[^107][^102]。

| 维度 | MCP | Function Call | 实际影响 |
|---|---|---|---|
| 协议层级 | 端到端交互协议 | API 调用规范 | MCP 解耦系统分层与能力治理；Function Call 上手快、学习成本低 |
| 状态管理 | 内置对话状态与上下文注入 | 需应用自行维护会话状态 | 长事务/多轮任务更宜 MCP；简单调用 FC 即可 |
| 安全与治理 | 多层防护（鉴权、权限、审计）与一致错误语义 | 基础校验与速率限制，治理多依赖外部设施 | 合规和审计要求高时更宜 MCP[^36] |
| 扩展与互操作 | 模块化能力声明、工具注册与发现，可跨语言/运行时 | 函数级扩展，接口以模型厂商 API 为中心 | 异构系统集成与复用更宜 MCP[^34] |
| 能力发现与约束 | 统一能力/资源声明与权限边界 | 通过 JSON Schema 暴露接口能力 | MCP 有利于规模化治理；FC 便于快速暴露能力[^34][^102] |
| 交互范式 | 请求-响应 + 流式事件/中间态 | 以请求-响应为主 | 人机协作与长链路反馈 MCP 更友好 |
| 实施复杂度与成本 | 前期集成与治理设计成本较高 | 快速原型与小规模落地成本低 | 按业务阶段权衡选择 |

- 迁移影响与权衡
  - 可观测性与可控性：协议层统一状态、事件与错误码，便于端到端追踪与审计[^36]。
  - 工程复杂度：初次落地需要能力建模、权限边界与上下文分层设计；可通过“先包裹核心调用，后扩展治理”的策略降低一次性改造成本[^107]。
  - 性能与资源：引入协议网关与会话层后，冷启动与序列化开销上升；通过“工具预加载”“连接复用”“结构化压缩”可抵消主要开销（在多数工作负载下）。
  - 生态与兼容：MCP 有利于统一不同模型/工具的调用面；迁移期建议保留 Function Call 作为 fallback，按模块逐步切换[^107]。

### 2.1 选择指南与最佳实践

- 决策清单（快速判断）
  - 业务流程复杂度与时长：长事务/多轮、多工具编排、需要阶段性回传进度 → 倾向 MCP[^107]。
  - 安全与合规：需要细粒度权限、审计留痕、防滥用 → MCP[^36]。
  - 系统集成深度：需跨多服务/数据源、统一治理与能力复用 → MCP[^34]。
  - 交互形态：一次性、幂等、参数简单的工具调用 → Function Call[^102]。
  - 团队与成本：快速验证/原型期、人力有限 → 先 Function Call，验证通过后渐进式引入 MCP[^107]。

- 典型选择建议
  - 优先选择 MCP 的场景：
    - 长期状态管理的复杂工作流、金融/医疗等高合规场景、多系统深度集成的企业级方案[^107][^36]。
  - 适合 Function Call 的场景：
    - 简单的一次性工具调用、快速原型开发、已有完善状态/鉴权基础设施的环境[^102]。

- 渐进式迁移路线（推荐）
  1. 保持现有 Function Call 实现，新功能在 MCP 中落地，形成双轨运行[^107]。
  2. 抽象领域能力与上下文边界，将关键链路包裹进 MCP，会话与权限先在高风险模块启用[^34]。
  3. 度量与回归：对比调用成功率、参数有效率、端到端 P95/P99 延迟与成本；稳定后再扩大覆盖面。

- 最佳实践要点
  - MCP 实施
    - 使用官方 SDK，确保协议兼容；显式建模“能力/资源/权限”三要素[^34]。
    - 上下文分层：把长期会话状态与短期任务参数分离，避免“提示词携带一切”。
    - 错误恢复：为关键步骤设计可回滚与重放机制（幂等键、断点续跑）。
    - 安全：证书与密钥轮换、最小权限、输入验证+输出过滤；对外部工具设定配额与速率限制。
  - Function Call 优化
    - 使用 JSON Schema 定义与校验参数，减少模型“幻觉参数”[^102]。
    - 设置并发与频率限制，隔离外部依赖抖动；建立调用链路日志与审计。
    - 设计 fallback：超时、参数生成失败或工具异常时回退为安全默认或弱功能路径。

- 风险与缓解
  - Schema 漂移：引入契约测试与向后兼容策略；版本协商在控制层完成。
  - 状态漂移：对会话状态采用幂等写与持久化存储；关键步骤显式检查点。
  - 限流与背压：为 MCP 网关和工具提供独立限流器与优先级队列，保护下游。

小结：MCP 强于“标准化与治理”，Function Call 强于“敏捷与轻量”。实践中常见模式是“以 MCP 为骨架、以 Function Call 为执行单元”，在确保可观测与安全的前提下，逐步提升自动化与自治能力[^34][^102]。

## 3. MCP的核心优势与价值

MCP通过标准化的协议层与能力声明，将“模型—工具—数据”三者之间的交互抽象为可治理、可观测、可复用的统一契约，显著降低异构系统集成成本并提升工程可控性[^101]。其价值可从五个层面理解：

- 标准化与契约化治理
  - 统一接口规范与数据格式，错误语义一致，减少“各说各话”的对接成本[^101]。
  - 协议即边界：在协议层沉淀能力、权限与错误码，使跨团队、跨系统协作具备清晰的契约。
- 互操作性与生态复用
  - 跨模型协作（如 Claude、OpenAI 与开源模型），工具与资源的统一暴露与共享，避免重复接入[^101]。
  - 第三方工具生态更易繁荣，开发者只需一次适配，即可在多模型间复用[^101]。
- 复杂场景与长任务的稳态处理
  - 支持异步/长时间运行任务与阶段性进度回传，适配多步骤、多工具编排的工作流[^101]。
  - 有助于构建“以协议为骨架、以工具调用为执行单元”的可扩展系统。
- 安全与合规治理
  - 细粒度权限控制、最小授权、审计留痕与输入输出校验，有利于企业合规与安全验收[^102]。
  - 与现有身份与访问管理体系（IAM）协同，形成端到端的访问追踪[^102]。
- 开发者效率与一致体验
  - 减少适配器与胶水代码，集成工作量平均可下降显著（实践报告显示可达约65%）[^101]。
  - 跨模型的一致交互范式，降低学习与迁移成本，改善用户与开发者体验[^101]。

面向未来的演进方向
- 多模态能力：对图像、音频等感知与生成的统一协议扩展，支持跨模态数据转换[^126]。
- 自主优化与弹性调度：根据负载与任务类型动态调整资源与工具集[^126]。
- 企业级落地：在金融、医疗等高合规行业的生产级应用持续深化[^126]。

### 3.1 MCP的典型应用场景

- 场景A：文件系统集成[^102]
  - 目标：在严格权限边界下让LLM安全访问与处理文件。
  - 典型能力：安全扫描（毒性/恶意检测）、细粒度权限控制（只读/白名单路径）、敏感数据遮蔽。
  - 实施要点：最小权限、审计追踪、对传入/传出内容做格式与安全校验；对大文件采用分块与断点续传。
  - 用例：研发团队让模型读取项目文档生成变更说明；对外上传文件先经安全网关预扫描再进入模型流程。
- 场景B：开发工作流与代码库管理[^102]
  - 目标：将模型接入现有CI/CD与代码评审流程，提升研发效率。
  - 典型能力：读取/搜索代码、静态检查与风格修复、从注释生成API文档、与Issue/PR系统联动。
  - 实施要点：对仓库范围与文件类型做白名单；对自动修改启用人工复核（human-in-the-loop）；记录审计日志。
  - 用例：自动化代码审查与最佳实践建议、根据代码变更自动更新文档或生成发布说明。
- 场景C：企业级业务流程与数据治理[^102]
  - 目标：在多系统、多数据源的企业环境中统一治理与审计。
  - 典型能力：跨服务编排、自动化报告生成、客服请求处理、合规性检查、数据访问审计。
  - 实施要点：与IAM/数据分级策略对齐，建立统一能力清单与配额管理；按业务域分层注入上下文。
  - 用例：财务月报自动生成、客服知识库问答、表单/合同合规审查与留痕。
- 行业实践案例[^102]
  - 金融：欺诈检测预筛、交易风险评估与事件复核。
  - 医疗：临床决策支持、医学文献快速综述与证据链构建。

落地建议（通用）
- 明确能力/资源/权限三要素，采用白名单与配额防滥用。
- 将长期会话状态与短期任务参数分层，防止上下文膨胀与状态漂移。
- 建立SLO与可观测性指标（成功率、P95/P99延迟、成本/调用），驱动持续优化。

## 4. 从Function Call迁移到MCP的实施步骤

![MCP架构](./images/mcp_architecture.jpg)

本节给出一条从既有 Function Call 架构平滑升级到 MCP 的可执行路线图，覆盖“准备—实施—验证—上线”四个阶段，并附迁移里程碑与风险清单，帮助团队在最小停机与可回滚前提下完成迁移。

### 迁移准备
- 环境评估[^12]
  - 盘点现有 Function Call 实现（函数清单、参数 Schema、鉴权与限流策略、日志审计链路）。
  - 标注迁移优先级：按业务风险、复杂度与收益进行分级；选择低风险链路先行试点。
- 协议差异分析[^15]
  - 通信模式：从一次性请求-响应，转为基于会话的持续交互（含中间态与事件）。
  - 状态管理：从“应用自管状态”，转为“协议内置会话与上下文”，需要显式设计上下文分层。
  - 错误处理：从单层错误码，升级为多级异常与统一语义（可区分可重试/需人工介入等）。
- 工具链准备
  - 安装 MCP SDK 与配套开发工具；建立最小示例仓库用于试点与回归。
  - 预置契约测试框架，保障后续 Schema 漂移可被快速感知。

### 迁移实施
- 接口重构
  - 将单体 Function Call 拆分为 MCP 服务组件，以“能力”为单位暴露方法；为每个方法补全能力元数据与权限声明。
  - 采用领域驱动的能力分层，保持“领域能力—协议方法—实现代码”的一一对应关系，便于治理与审计。
- 会话管理[^18]
  - 引入会话上下文存储与装载策略（长期会话态与短期任务参数分离）。
  - 配置超时、重试与断点续跑；为关键步骤设置幂等键，支持失败重放。
- 安全升级
  - 接入 OAuth2.0 等统一身份认证；实现请求签名与时效校验。
  - 落实最小权限与范围白名单；细化资源配额与速率限制，隔离下游抖动。
- 渐进式双轨
  - 维持 Function Call 作为回退路径；对同一能力同时提供 MCP 与 FC 两种入口，在灰度期间按流量权重逐步切换。

### 测试验证
- 单元测试
  - 覆盖每个 MCP 方法的参数校验、错误分支与权限边界。
- 集成测试
  - 验证跨方法的编排、会话上下文传递、一致性与审计日志。
- 性能测试[^22]
  - 对比迁移前后 P95/P99 延迟、吞吐与资源占用；校准连接复用、序列化与缓存策略。
  - 设定验收门槛：如端到端成功率≥99.5%、P99 延迟不劣于基线 10% 以上。

### 部署上线
- 发布策略
  - 先小流量灰度（如 1%-5%），观测稳定后再扩大；为关键租户提供显式开关。
- 监控与告警
  - 建立统一可观测指标：成功率、P95/P99、重试率、工具调用失败率、会话并发与泄漏监控。
- 回滚方案
  - 失败时一键切回 Function Call；保留会话与审计数据用于复盘与修复。

### 迁移里程碑与风险清单
- 里程碑
  - M1：完成能力清单与差异分析；M2：试点链路上线灰度；M3：核心链路迁移完毕；M4：关闭 FC 回退开关。
- 常见风险与缓解
  - Schema 漂移：引入契约测试与版本协商；灰度期间保持双写校验。
  - 状态漂移：会话态持久化+幂等写；关键步骤设置检查点与对账脚本。
  - 限流与背压：为 MCP 网关与外部工具分别配置限流器和优先级队列，保护下游。

### 4.1 MCP服务器与客户端实现代码示例

下面以“加法计算”能力为例，演示如何实现一个最小可用的 MCP 服务端与客户端。注意：包名与接口以所用 SDK 为准，以下示例仅供参考[^35][^38]。

- 服务器端实现（Python）
```python
from mcp_server import MCPServer, Service

class CalculatorService(Service):
    @method(description="加法计算")
    def add(self, a: float, b: float) -> float:
        return a + b

server = MCPServer(
    host="0.0.0.0",
    port=8080,
    services=[CalculatorService()],
    auth_config={
        "oauth2": {
            "client_id": "your_client_id",
            "client_secret": "your_secret"
        }
    }
)
server.start()  # 启动MCP服务[^35]
```

- 客户端实现（JavaScript/Node.js）
```javascript
const { MCPClient } = require('mcp-client');

const client = new MCPClient({
  endpoint: 'http://localhost:8080',
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: 'your_client_id',
      clientSecret: 'your_secret'
    }
  }
});

async function calculate() {
  const session = await client.createSession();
  const result = await session.invoke('CalculatorService/add', {a: 5, b: 3});
  console.log(result); // 输出: 8
  await session.close();
}

calculate().catch(console.error);[^38]
```

- 关键实现要点
  1) 服务注册：通过装饰器/注解对方法进行能力声明与元数据描述（名称、说明、输入/输出类型）。
  2) 类型安全：使用强类型注解与Schema校验，降低“幻觉参数”与序列化错误概率。
  3) 会话管理：客户端创建会话、发送调用、接收结果并显式关闭，避免会话泄漏。
  4) 安全认证：支持多种认证方式（OAuth2、签名、IP白名单）；密钥需定期轮换并最小授权。

- 本地快速验证
  - 启动服务端后，运行客户端脚本观察结果与日志；同时验证错误分支（如参数缺失、鉴权失败）。
  - 配合抓包或协议检查工具，确认请求/响应的头、体与状态码满足协议约束。

- 生产化建议
  - 接入统一日志与分布式追踪；为服务方法配置配额与优先级；对外部工具调用设置熔断与重试。
  - 凭证与证书定期轮换，开启按租户/能力的精细化审计[^51]。

### 4.2 MCP交互流程与最佳实践

#### 标准交互流程
1) 会话建立：客户端发起会话请求，服务端返回会话ID与初始上下文。
2) 方法调用：客户端发送方法调用请求；服务端执行并返回结果（可包含中间进度与事件）。
3) 上下文更新：服务端维护会话状态；客户端在必要时查询或修改上下文[^45]。
4) 会话终止：任务完成后显式关闭，或在超时后自动关闭并回收资源。

#### 最佳实践
- 性能优化
  - 合并批量调用，降低网络往返；对大数据返回采用流式响应，边处理边消费。
- 错误处理
  - 按错误可重试性分类；对临时性错误启用指数退避重试，对永久性错误快速失败并上报。
- 安全建议
  - 最小权限原则配置访问控制；对外暴露能力采用白名单策略；定期轮换认证凭证并启用细粒度审计[^51]。
- 监控指标
  - 会话成功率、平均/分位响应时间（P95/P99）、并发会话数、重试率、外部工具调用失败率与熔断次数。

#### 调试技巧
- 使用 MCP Inspector 或同类工具可视化请求/响应与事件流。
- 启用详细日志（含会话ID、能力名、错误码与相关元数据），便于端到端排障。
- 模拟网络延迟与限流场景，验证稳态与异常路径的健壮性[^55]。

## 5. 结论与展望

内容待补充

[^1]: [MCP (Model Context Protocol)，一篇就够了。](https://zhuanlan.zhihu.com/p/29001189476)
[^1]: [MCP (Model Context Protocol)，一篇就够了。](https://zhuanlan.zhihu.com/p/29001189476)
[^1]: [MCP (Model Context Protocol)，一篇就够了。](https://zhuanlan.zhihu.com/p/29001189476)
[^1]: [MCP (Model Context Protocol)，一篇就够了。](https://zhuanlan.zhihu.com/p/29001189476)
[^1]: [MCP (Model Context Protocol)，一篇就够了。](https://zhuanlan.zhihu.com/p/29001189476)
[^1]: [MCP (Model Context Protocol)，一篇就够了。](https://zhuanlan.zhihu.com/p/29001189476)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^36]: [一文讲透大模型MCP 的原理及实践](https://zhuanlan.zhihu.com/p/1909653977588540283)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^36]: [一文讲透大模型MCP 的原理及实践](https://zhuanlan.zhihu.com/p/1909653977588540283)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^36]: [一文讲透大模型MCP 的原理及实践](https://zhuanlan.zhihu.com/p/1909653977588540283)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^36]: [一文讲透大模型MCP 的原理及实践](https://zhuanlan.zhihu.com/p/1909653977588540283)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^107]: [大模型中的MCP协议和Function Call有何区别？深度解析 ...](https://www.betteryeah.com/blog/mcp-protocol-vs-function-call-differences)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^34]: [模型上下文协议(MCP) - Claude Docs](https://docs.anthropic.com/zh-CN/docs/agents-and-tools/mcp)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^101]: [一次性搞懂MCP是啥，如何安装以及与Function call 的区别](https://www.woshipm.com/ai/6195931.html)
[^126]: [加速AI 开发：利用LLMs 和MCP 实现2025 年更强的泛化能力](https://cloud.tencent.com/developer/news/2447634)
[^126]: [加速AI 开发：利用LLMs 和MCP 实现2025 年更强的泛化能力](https://cloud.tencent.com/developer/news/2447634)
[^126]: [加速AI 开发：利用LLMs 和MCP 实现2025 年更强的泛化能力](https://cloud.tencent.com/developer/news/2447634)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^102]: [函数调用- OpenAI 中文文档](https://www.openaicto.com/capabilities/function-calling)
[^12]: [⚙️ Function Calling vs. MCP: What Smart AI Teams Need ...](https://medium.com/@genai.works/%EF%B8%8F-function-calling-vs-mcp-what-smart-ai-teams-need-to-know-7c319267b6db)
[^15]: [Model Context Protocol (MCP) Explained - by Nir Diamant](https://diamantai.substack.com/p/model-context-protocol-mcp-explained)
[^18]: [Build a Model Context Protocol (MCP) server in C# - .NET ...](https://devblogs.microsoft.com/dotnet/build-a-model-context-protocol-mcp-server-in-csharp/)
[^22]: [](https://www.xiaohongshu.com/search_result?keyword=&source=web_explore_feed)
[^35]: [【超详细】Claude MCP 大模型上下文协议全面介绍（架构](https://blog.csdn.net/Attitude93/article/details/145882420)
[^38]: [从源码分析MCP 的实现和使用](https://zhuanlan.zhihu.com/p/1889258896595611956)
[^35]: [【超详细】Claude MCP 大模型上下文协议全面介绍（架构](https://blog.csdn.net/Attitude93/article/details/145882420)
[^38]: [从源码分析MCP 的实现和使用](https://zhuanlan.zhihu.com/p/1889258896595611956)
[^51]: [AI Coding Assistant Lingma：MCP常見問題說明](https://www.alibabacloud.com/help/tc/lingma/support/faq-mcp)
[^45]: [极简图解：MCP与Function Calling](https://www.xiaohongshu.com/search_result?keyword=极简图解：MCP与Function Calling&source=web_explore_feed)
[^51]: [AI Coding Assistant Lingma：MCP常見問題說明](https://www.alibabacloud.com/help/tc/lingma/support/faq-mcp)
[^55]: [OpenAI 官方文档：为ChatGPT 和API 集成构建MCP 服务器](https://zhuanlan.zhihu.com/p/1932124221103931749)