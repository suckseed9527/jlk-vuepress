# DeepSeek API 官方文档2026-05-12 12345645 47897

> 本指南基于 [DeepSeek API 官方文档](https://api-docs.deepseek.com/zh-cn/) 整理，涵盖 API 接入、模型选择、API 调用、高级功能及常见问题等内容。

## 1 概述

DeepSeek API 使用与 OpenAI/Anthropic 兼容的 API 格式，通过修改配置，您可以使用 OpenAI/Anthropic SDK 来访问 DeepSeek API，或使用与 OpenAI/Anthropic API 兼容的软件。

| 参数 | 值 |
|---|---|
| base_url (OpenAI) | `https://api.deepseek.com` |
| base_url (Anthropic) | `https://api.deepseek.com/anthropic` |
| api_key | 从 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys) 获取 |
| model* | deepseek-v4-flash / deepseek-v4-pro |

**说明：** `deepseek-chat` 与 `deepseek-reasoner` 两个模型名将于 2026/07/24 弃用，出于兼容考虑，二者分别对应 `deepseek-v4-flash` 的非思考与思考模式。

## 2 模型与价格

### 2.1 当前模型

DeepSeek 当前主要提供两款模型：`deepseek-v4-flash` 和 `deepseek-v4-pro`。`deepseek-v4-pro` 适用于对推理质量要求较高的场景；`deepseek-v4-flash` 则更侧重于响应速度与成本效益。

| 属性 | deepseek-v4-flash | deepseek-v4-pro |
|---|---|---|
| BASE URL (OpenAI 格式) | https://api.deepseek.com | https://api.deepseek.com |
| 上下文长度 | 1M | 1M |
| 最大输出长度 | 384K | 384K |
| JSON Output | ✅ 支持 | ✅ 支持 |
| Tool Calls | ✅ 支持 | ✅ 支持 |
| 对话前缀续写（Beta） | ✅ 支持 | ✅ 支持 |
| FIM 补全（Beta） | 仅非思考模式支持 | 仅非思考模式支持 |

### 2.2 价格体系

下表所列模型价格以“百万 tokens”为单位。Token 是模型用来表示自然语言文本的最小单位，可以是一个词、一个数字或一个标点符号等。

> 📢 **优惠信息**：当前 `deepseek-v4-pro` 模型 2.5 折，优惠期延长至北京时间 **2026/05/31 23:59**。

| 模型 | 百万 tokens 输入（缓存命中） | 百万 tokens 输入（缓存未命中） | 百万 tokens 输出 |
|---|---|---|---|
| deepseek-v4-flash | 0.02 元 | 1 元 | 2 元 |
| deepseek-v4-pro | 0.025 元（2.5折） | 3 元（2.5折） | 6 元（2.5折） |

**扣费规则：** 扣减费用 = token 消耗量 × 模型单价，对应的费用将直接从充值余额或赠送余额中进行扣减。当充值余额与赠送余额同时存在时，优先扣减赠送余额。

> 💡 **缓存说明**：全系列模型，输入缓存命中的价格已降至首发价格的 1/10，该价格调整自北京时间 2026/4/26 20:15 起生效。

### 2.3 上下文硬盘缓存

DeepSeek API 上下文硬盘缓存技术对所有用户**默认开启**，用户无需修改代码即可享用。用户的每一个请求都会触发硬盘缓存的构建。若后续请求与之前的请求在前缀上存在重复，则重复部分只需要从缓存中拉取，计入“缓存命中”。

**缓存命中规则：**
- 每个缓存前缀是独立、完整的单元，后续请求需要**完全匹配**某个缓存前缀单元才能命中缓存。
- 当系统检测到多个请求存在公共前缀时，会将该公共前缀持久化为独立的缓存前缀单元。
- 长输入或长输出场景下，系统还会按固定 token 间隔切分缓存单元。

## 3 快速开始

### 3.1 获取 API Key

访问 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys)，注册/登录并创建 API Key。认证方式为 Bearer Token。

### 3.2 首次 API 调用

以下是通过 OpenAI API 格式访问 DeepSeek 模型的示例（非流式输出），您可以将 `stream` 设置为 `true` 来使用流式输出。

#### cURL

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "thinking": {"type": "enabled"},
    "reasoning_effort": "high",
    "stream": false
  }'
```

#### Python

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com"
)

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"}
    ],
    stream=False,
    reasoning_effort="high",
    extra_body={"thinking": {"type": "enabled"}}
)

print(response.choices[0].message.content)
```

#### Node.js

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." }
        ],
        model: "deepseek-v4-pro",
        thinking: {"type": "enabled"},
        reasoning_effort: "high",
        stream: false,
    });
    console.log(completion.choices[0].message.content);
}

main();
```

## 4 API 参考

### 4.1 对话补全 (Chat Completion)

**端点：** `POST https://api.deepseek.com/chat/completions`

根据输入的上下文，让模型补全对话内容。

#### 核心请求参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `messages` | object[] (required) | 对话的消息列表，包含 system / user / assistant / tool 消息 |
| `model` | string (required) | 模型 ID：`deepseek-v4-flash` 或 `deepseek-v4-pro` |
| `thinking` | object (nullable) | 控制思考模式。`type: "enabled"` 开启思考模式，`"disabled"` 关闭 |
| `reasoning_effort` | string (nullable) | 推理强度：`high` / `max`。普通请求默认为 `high` |
| `max_tokens` | integer (nullable) | 生成的最大 token 数，受模型上下文长度限制 |
| `stream` | boolean (nullable) | 设为 `true` 时以 SSE 流式发送消息增量 |
| `temperature` | number (nullable) | 采样温度，范围 [0, 2]，默认 1。越高输出越随机，越低越确定 |
| `top_p` | number (nullable) | 核采样参数，范围 [0, 1]，默认 1 |
| `response_format` | object (nullable) | 设置 `{"type": "json_object"}` 启用 JSON 模式 |
| `stop` | object (nullable) | 停止序列，遇到后停止生成 |
| `tools` | object[] (nullable) | 定义可供调用的工具（Function Calling） |
| `user_id` | string (nullable) | 可选，用于区分用户身份，帮助内容安全审核。允许字符集：`[a-zA-Z0-9\-_]`，最大长度 512 |

#### 思考模式说明

DeepSeek 模型支持思考模式（reasoning model），即在输出最终答案前，先生成思维链（Chain of Thought）来增强响应准确性。

- 设置 `thinking.type: "enabled"` 启用思考模式
- 模型输出中会包含 `reasoning_content` 字段，存储思维链内容
- 多轮对话时，需在下一轮请求中**移除**上一轮响应中的 `reasoning_content` 字段，否则 API 会返回 400 错误

### 4.2 JSON 输出 (JSON Mode)

在许多场景中，用户需要模型严格按照 JSON 格式输出以实现结构化输出。DeepSeek API 提供了 JSON Output 功能。

**启用方式：**
1. 设置 `response_format` 参数为 `{'type': 'json_object'}`
2. 在 system 或 user 的 prompt 中包含“json”关键词，并提供期望的 JSON 格式示例

```python
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    response_format={'type': 'json_object'}
)
```

### 4.3 函数调用 (Tool Calls)

Tool Calls 允许模型调用外部工具来增强其能力，兼容 OpenAI API 格式，支持传入多个 Function（最多 128 个），支持并行 Function 调用。

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather of a location,
             the user should supply a location first.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state,
                         e.g. San Francisco, CA",
                    }
                },
                "required": ["location"],
            },
        },
    }
]
```

#### strict 模式 (Beta)

在 strict 模式下，模型会严格遵循 Function JSON schema 的格式要求输出 tool call。启用方式：设置 `base_url="https://api.deepseek.com/beta"`，并将 `strict` 属性设为 `true`。

### 4.4 FIM 补全 (Beta)

FIM（Fill-In-the-Middle）补全允许用户提供前缀和后缀（可选），模型来补全中间的内容，常用于内容续写、代码补全等场景。

**端点：** `POST https://api.deepseek.com/beta/completions`

```bash
# 需要设置 base_url="https://api.deepseek.com/beta" 来使用此功能
```

> ⚠️ **注意**：模型的最大补全长度为 4K。

### 4.5 对话前缀续写 (Beta)

对话前缀续写功能允许用户指定最后一条 `assistant` 消息的前缀，让模型按照该前缀进行补全。该功能也可用于输出长度达到 `max_tokens` 被截断后，将被截断的消息进行拼接，重新发送请求对被截断内容进行续写。

**端点：** `POST https://api.deepseek.com/beta/chat/completions`

```python
messages = [
    {"role": "user", "content": "Please write quick sort code"},
    {"role": "assistant", "content": "```python\n", "prefix": True}
]
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    stop=["```"]
)
```

## 5 高级功能

### 5.1 流式输出

将 `stream` 参数设置为 `true` 时，API 会以 SSE（Server-Sent Events）的形式流式发送消息增量，消息流以 `data: [DONE]` 结尾。

流式输出相关选项仅在 `stream` 为 `true` 时可设置：
- `include_usage`：若为 `true`，在流式消息最后的 `[DONE]` 之前会传输一个额外的块，包含整个请求的 token 使用统计信息。

### 5.2 多轮对话

DeepSeek Chat Completion API 是“无状态”的 API，意味着服务器不会记录用户的请求上下文。因此，用户需要在每轮请求中自行构建完整的消息历史。

**多轮对话流程：**
1. 第一轮：发送用户消息，获取模型响应
2. 将第一轮的模型输出追加到 `messages` 列表末尾
3. 添加新的用户消息
4. 发送完整历史消息列表获取下一轮响应

### 5.3 查询余额

**端点：** `GET https://api.deepseek.com/user/balance`

```bash
curl -L -X GET 'https://api.deepseek.com/user/balance' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <TOKEN>'
```

返回格式示例：
```json
{
  "is_available": true,
  "balance_infos": [
    {
      "currency": "CNY",
      "total_balance": "110.00",
      "granted_balance": "10.00",
      "topped_up_balance": "100.00"
    }
  ]
}
```

### 5.4 查询可用模型列表

**端点：** `GET https://api.deepseek.com/models`

返回当前可用的模型列表及各模型的基本信息。

## 6 Agent 工具集成

DeepSeek API 已接入多种主流 AI Agent 与编程助手工具。如果您使用 Claude Code、GitHub Copilot、OpenCode 等工具，可以直接将 DeepSeek 作为后端模型，无需编写代码即可开始使用。

### 6.1 接入 Claude Code

Claude Code 是一个运行在终端内的 AI 编程助手。

**配置步骤：**
1. 安装 Node.js 18+ 并执行 `npm install -g @anthropic-ai/claude-code`
2. 配置环境变量（Linux/Mac）：

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=<你的 DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
```

3. 进入项目目录，执行 `claude` 命令即可开始使用

### 6.2 接入 GitHub Copilot

DeepSeek 可在 GitHub Copilot 的聊天面板中使用。点击聊天面板右上角的模型选择器，选择 DeepSeek V4 Pro 或 DeepSeek V4 Flash，即可开始对话——Agent 模式、工具调用及所有 Copilot 功能均可直接使用。

### 6.3 Anthropic API 格式支持

为了满足对 Anthropic API 生态的使用需求，DeepSeek API 新增了对 Anthropic API 格式的支持，其 `base_url` 为 `https://api.deepseek.com/anthropic`。

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_API_KEY=${YOUR_API_KEY}
```

```python
import anthropic

client = anthropic.Anthropic()
message = client.messages.create(
    model="deepseek-v4-pro",
    max_tokens=1000,
    system="You are a helpful assistant.",
    messages=[{"role": "user", "content": [{"type": "text", "text": "Hi"}]}]
)
```

## 7 常见问题 (FAQ)

### 7.1 关于速率限制

**Q: API 调用有限制吗？能否提高限制？**

A: 每个账户的速率限制是根据实时流量压力和账户短期历史使用情况动态调整的。目前暂不支持提高单个账户的动态速率限制，也没有分级定价计划。达到限制时会立即收到 HTTP 429 响应。

### 7.2 关于费用与充值

**Q: 如何充值？**
可以在 [充值页面](https://platform.deepseek.com/top_up) 通过 PayPal、银行卡、支付宝或微信支付在线充值。

**Q: 余额有有效期吗？**
充值余额不会过期。赠送余额的有效期可在 [Billing 页面](https://platform.deepseek.com/transactions) 查看。

**Q: 可以退款吗？**
未使用的余额可以退款。前往 [Billing 页面](https://platform.deepseek.com/transactions)，点击「Refunds」自行处理退款。

### 7.3 账号相关

**Q: 无法登录账号怎么办？**
如果登录时显示“your account has been temporarily suspended”，说明账号因可能违反平台使用指南被暂时停用。可通过 [账号申诉表单](https://trtgsjkv6r.feishu.cn/share/base/form/shrcn13OBmQ3oXJKYLdHjUfeDHh) 提交申诉，审核通常在 3 个工作日内完成。

**Q: 如何注销账号？**
可通过「个人资料」→「删除」申请账号注销。注意：此操作将同时删除 Chat 账号，所有聊天记录将被永久删除，开放平台的剩余余额将作废。

## 8 错误码

调用 DeepSeek API 时可能遇到以下错误：

| 错误码 | 描述 | 原因 | 解决方法 |
|---|---|---|---|
| 400 | 格式错误 | 请求体格式错误 | 根据错误信息提示修改请求体 |
| 401 | 认证失败 | API key 错误，认证失败 | 检查 API key，如无请先创建 |
| 402 | 余额不足 | 账号余额不足 | 确认账户余额并充值 |
| 422 | 参数错误 | 请求体参数错误 | 根据错误信息提示修改相关参数 |
| 429 | 请求速率达到上限 | 请求速率达到上限 | 合理规划请求速率，或暂时切换到其他 LLM 服务商 |
| 500 | 服务器故障 | 服务器内部故障 | 等待后重试，若问题持续请联系开发者 |
| 503 | 服务器繁忙 | 服务器负载过高 | 稍后重试请求 |

## 9 关于 Anthropic API 兼容性的补充说明

当使用 Anthropic API 格式调用 DeepSeek 时，请注意以下兼容性细节：

| 字段 | 支持状态 | 说明 |
|---|---|---|
| `model` | ✅ 完全支持 | 使用 DeepSeek 模型名替代 |
| `max_tokens` | ✅ 完全支持 | — |
| `temperature` | ✅ 完全支持 | 范围 [0.0 ~ 2.0] |
| `top_p` | ✅ 完全支持 | — |
| `stop_sequences` | ✅ 完全支持 | — |
| `stream` | ✅ 完全支持 | — |
| `system` | ✅ 完全支持 | — |
| `thinking` | ✅ 支持 | `budget_tokens` 将被忽略 |
| `x-api-key` | ✅ 完全支持 | — |
| 图片消息 | ❌ 不支持 | — |
| 文档消息 | ❌ 不支持 | — |

> 💡 **特别提示**：当传入不支持的模型名时，API 后端会自动将其映射到 `deepseek-v4-flash` 模型。

---

以上内容基于 [DeepSeek API 官方文档](https://api-docs.deepseek.com/zh-cn/) 整理，产品价格、模型等信息可能发生变更，建议定期查阅官方页面以获取最新信息。