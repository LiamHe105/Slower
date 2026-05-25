# 专注助手 Native

这里是从 React/Web 原型迁移出的 macOS 原生 SwiftUI 版本。

## 当前完成

- 任务清单
- 专注模式
- 可靠计时框架
- 未满 25 分钟的专注记录
- 满 25 分钟打卡
- 结算卡片
- 打卡日历
- 数据统计
- 主题色切换
- 白噪音入口占位
- 本地 JSON 持久化

## 运行

在项目根目录执行：

```bash
./script/build_and_run.sh
```

构建产物会生成在：

```text
dist/FocusAssistant.app
```

当前 SwiftUI 代码主要面向 macOS。后续做 iPhone 版本时，可以复用大部分 Models、Stores 和 Views，再增加 iOS App target。

