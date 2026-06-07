
# JoyAgent-JDGenie 前端技术文档

## 1. 概述

`ui` 是 JoyAgent-JDGenie 项目的前端应用，基于 React 18 + TypeScript + Vite 构建，提供用户友好的自然语言交互界面，支持数据查询、图表展示、对话历史管理等功能。

## 2. 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 语言 | TypeScript | 5.x |
| 框架 | React | 18.x |
| 构建工具 | Vite | 6.x |
| 样式 | TailwindCSS | 4.x |
| 组件库 | Ant Design | 5.x |
| 图表 | ECharts | 5.x |
| HTTP客户端 | Axios | 1.x |
| 状态管理 | React Context | - |
| 路由 | React Router | 6.x |

## 3. 项目结构

```
ui/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 资源文件
│   │   ├── icon/        # 图标资源
│   │   ├── relayFonts/  # 字体文件
│   │   └── styles/      # 全局样式
│   ├── components/      # 组件
│   │   ├── ActionPanel/ # 操作面板
│   │   ├── ActionView/  # 操作视图
│   │   ├── ChatView/    # 聊天视图
│   │   ├── DataChat/    # 数据聊天组件
│   │   ├── PlanView/    # 计划视图
│   │   └── ...          # 其他组件
│   ├── hooks/           # 自定义Hooks
│   ├── layout/          # 布局组件
│   ├── pages/           # 页面
│   │   └── Home/        # 首页
│   ├── router/          # 路由配置
│   ├── services/        # API服务
│   ├── types/           # 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 应用入口
│   ├── main.tsx         # 主入口
│   └── global.css       # 全局样式
├── .env                 # 环境变量
├── tailwind.config.js   # Tailwind配置
├── tsconfig.json        # TypeScript配置
└── vite.config.ts       # Vite配置
```

## 4. 核心组件

### 4.1 组件分类

| 组件目录 | 职责 | 主要文件 |
|----------|------|----------|
| `ActionPanel` | 操作面板，展示执行结果 | `ActionPanel.tsx`, `TableRenderer.tsx`, `ChartRenderer.tsx` |
| `ActionView` | 操作视图，管理文件列表和预览 | `ActionView.tsx`, `FileList.tsx`, `FilePreview.tsx` |
| `ChatView` | 聊天视图，消息列表和输入 | `ChatView.tsx` |
| `DataChat` | 数据聊天组件，图表和表格展示 | `DataChat.tsx`, `Chart.tsx`, `SimpleTable.tsx` |
| `PlanView` | 计划视图，展示任务规划 | `PlanView.tsx`, `PlanItem.tsx` |

### 4.2 核心组件详解

#### 4.2.1 ChatView 组件

负责消息列表展示和用户输入：

```tsx
// ChatView/index.tsx
const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // 调用API
      await querySSE(inputValue, (event) => {
        // 处理SSE事件
        if (event.eventType === 'THINK') {
          // 更新思考消息
        } else if (event.eventType === 'CHART_DATA') {
          // 添加图表消息
        }
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-view">
      <div className="message-list">
        {messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
      </div>
      <div className="input-area">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入您的问题..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          发送
        </button>
      </div>
    </div>
  );
};
```

#### 4.2.2 DataChat 组件

负责数据图表展示：

```tsx
// DataChat/index.tsx
const DataChat: React.FC<{ data: ChartData }> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current || !data) return;
    
    // 初始化ECharts实例
    const chart = echarts.init(chartRef.current);
    
    // 根据数据类型生成图表配置
    const option = generateChartOption(data);
    
    chart.setOption(option);
    
    return () => chart.dispose();
  }, [data]);
  
  return (
    <div className="data-chat">
      <div ref={chartRef} className="chart-container" />
      <SimpleTable data={data.tableData} />
    </div>
  );
};
```

#### 4.2.3 ActionPanel 组件

负责展示执行结果和操作历史：

```tsx
// ActionPanel/ActionPanel.tsx
const ActionPanel: React.FC<{ items: PanelItemType[] }> = ({ items }) => {
  const [activeItem, setActiveItem] = useState<PanelItemType | null>(null);
  
  return (
    <div className="action-panel">
      <div className="panel-sidebar">
        {items.map(item => (
          <div
            key={item.id}
            className={`sidebar-item ${activeItem?.id === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item)}
          >
            <i className={`icon-${item.type}`} />
            <span>{item.title}</span>
          </div>
        ))}
      </div>
      <div className="panel-content">
        {activeItem && (
          <PanelContent item={activeItem} />
        )}
      </div>
    </div>
  );
};
```

## 5. API 服务层

### 5.1 服务配置

```typescript
// services/agent.ts
import axios from 'axios';

const SERVICE_BASE_URL = import.meta.env.SERVICE_BASE_URL || 'http://localhost:8080';

const agentService = axios.create({
  baseURL: SERVICE_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
agentService.interceptors.request.use(
  (config) => {
    // 添加请求头
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
agentService.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### 5.2 SSE 流式请求

```typescript
// utils/querySSE.ts
export const querySSE = async (
  query: string,
  onEvent: (event: EventMessage) => void
): Promise<void> => {
  const url = `${SERVICE_BASE_URL}/api/chat/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      sessionId: getSessionId(),
      agentType: 'PLANNING',
      modelCodeList: ['t_qtpbgamccmrctthlurauclckq'],
    }),
  });
  
  if (!response.ok) {
    throw new Error('Request failed');
  }
  
  const reader = response.body?.getReader();
  if (!reader) return;
  
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // 解析SSE消息
    const messages = buffer.split('\n\n');
    buffer = messages.pop() || '';
    
    for (const msg of messages) {
      const match = msg.match(/^data:\s*(.+)$/);
      if (match) {
        try {
          const eventMessage = JSON.parse(match[1]);
          onEvent(eventMessage);
        } catch (e) {
          console.error('Failed to parse SSE message:', e);
        }
      }
    }
  }
};
```

### 5.3 事件类型

| 事件类型 | 说明 | 数据结构 |
|----------|------|----------|
| `THINK` | 思考过程 | `{ thought: string }` |
| `TOOL_CALL` | 工具调用 | `{ toolName: string; params: object }` |
| `CHART_DATA` | 图表数据 | `{ chartType: string; data: object }` |
| `TABLE_DATA` | 表格数据 | `{ columns: string[]; rows: any[] }` |
| `ERROR` | 错误信息 | `{ message: string }` |
| `READY` | 完成信号 | `{}` |

## 6. 类型定义

### 6.1 核心类型

```typescript
// types/chat.ts
export interface Message {
  id: string;
  type: 'user' | 'system' | 'think' | 'chart' | 'table';
  content: string;
  data?: ChartData | TableData;
  timestamp: Date;
}

export interface ChartData {
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  xAxis: string[];
  series: SeriesData[];
}

export interface SeriesData {
  name: string;
  type: string;
  data: number[];
}

export interface TableData {
  columns: ColumnDef[];
  rows: Record<string, any>[];
}

export interface ColumnDef {
  key: string;
  title: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}
```

### 6.2 API 请求类型

```typescript
// types/message.ts
export interface AgentRequest {
  query: string;
  sessionId: string;
  agentType: 'PLANNING' | 'REACT' | 'EXECUTOR';
  modelCodeList: string[];
  parameters?: Record<string, any>;
}

export interface EventMessage {
  eventType: string;
  data: any;
}
```

## 7. 自定义 Hooks

### 7.1 useTypeWriter Hook

实现打字机效果：

```typescript
// hooks/useTypeWriter.ts
export const useTypeWriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    setDisplayText('');
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return displayText;
};
```

### 7.2 useConstants Hook

管理常量配置：

```typescript
// hooks/useConstants.ts
export const useConstants = () => {
  return {
    SERVICE_BASE_URL: import.meta.env.SERVICE_BASE_URL || 'http://localhost:8080',
    MAX_MESSAGE_LENGTH: 10000,
    SUPPORTED_CHART_TYPES: ['line', 'bar', 'pie', 'scatter'],
  };
};
```

## 8. 路由配置

```typescript
// router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/Home';
import NotFound from '../components/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
```

## 9. 配置说明

### 9.1 .env 环境变量

```env
# 后端服务地址
SERVICE_BASE_URL=http://localhost:8080

# 前端端口
PORT=3000

# 开发模式
NODE_ENV=development
```

### 9.2 tsconfig.json 路径别名

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 9.3 tailwind.config.js 配置

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        secondary: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

## 10. 构建与运行

### 10.1 开发环境

```bash
# 进入目录
cd ui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 10.2 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 10.3 Docker 部署

```bash
# 构建镜像
docker build -t genie-ui .

# 运行容器
docker run -d -p 3000:3000 genie-ui
```

## 附录：文件路径速查

| 文件 | 路径 |
|------|------|
| `ChatView` | `components/ChatView/index.tsx` |
| `DataChat` | `components/DataChat/index.tsx` |
| `ActionPanel` | `components/ActionPanel/ActionPanel.tsx` |
| `PlanView` | `components/PlanView/PlanView.tsx` |
| `querySSE` | `utils/querySSE.ts` |
| `agentService` | `services/agent.ts` |
| `类型定义` | `types/chat.ts` |
