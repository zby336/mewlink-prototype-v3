# MewLink — 首页与文案微调

本轮保留现有功能，仅修改这次提出的 6 项。未 Commit、未 Push GitHub、未创建 PR。

- 首页顺序：Needs → Notification → Recommended。通知摘要同行靠右，头像区缩短间距。
- Needs 头像居中裁切；已 TNR 使用 #E2EADB，未 TNR 使用 #F7DDD0，与卡片状态背景一致。
- 档案从 6 只增至 12 只；新增 Mochi、Biscuit、Pepper、Nori、Luna、Tofu。Zone A 有 4 只具备明确需求的猫。新增内容为虚构原型档案及示例记录，内部保留来源标记。
- Today’s Care Alerts 改为 Alerts，使用短标题及一句照护提示；移除 View Tiger’s records 等重复入口。原始观察、时间和不确定性保留在 Source note。
- 推荐卡片使用简短、有趣的猫咪介绍，移除 recorded in … profile 后缀。泛化 Needs observation 改为 Ear check、Water check、Appetite check、Feeding cover 等具体标签。没有待办或确认状态时不展示标签。Fed 只来自当日确认记录。
- 移除界面中的 Demo Data · example observation / example care record 标识。内部记录来源与权限逻辑保留。规则检索的说明保留，不冒充真实 LLM。
- Ask Mew、Hi, I’m Mew. 及导航保留星星标识；输入框和其他助手功能中的 MewAI 名称保留。

## 验证

- 自动测试：62 通过、0 失败；构建成功、git diff --check 通过。
- 已验证 360×640、375×667、390×844 和桌面预览；横向头像列表可滚动，页面没有水平溢出。
- 通知展开与来源、新增猫咪档案、推荐刷新、Alerts 来源、Ask Mew 检索新增猫咪记录均已检查。
- 原有保存、身份确认、草稿、重复保存、保存与分享独立性、头像隐私与渐隐由回归测试覆盖。
- 仍是纯前端原型，照护操作保存在当前浏览器，没有跨设备同步或真实模型。

## Figma 设计更新说明

本轮未修改 Figma；上述布局、色值、文案和 12 只档案为对应的设计更新说明。保留此前已报告的 Figma 编辑额度限制，不宣称设计文件已同步。

## 发布与源码

公开网站：https://mewlink-design-copy.vercel.app/#today
生产部署：dpl_Ce8pqMVkihyVwN2ku7PdU4HKFeBU
独立项目：prj_fS9ASrBNwGmu1zLARZQzYWWerC0u
源码：work/mewlink-project；保留全部未提交修改。
