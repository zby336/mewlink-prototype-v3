# MewLink 第二轮 UX 与功能优化交付

日期：2026-10-29，Asia/Singapore。

网站：https://mewlink-design-copy.vercel.app/#today

Vercel 项目：prj_fS9ASrBNwGmu1zLARZQzYWWerC0u。最终部署：dpl_8CgNx7emsLumySWMxSvAtWkNurTy，READY。60 个线上发布文件与本地构建 SHA1 全部一致。

Figma 工作副本：https://www.figma.com/design/mjKHxlL2JUoyMlluQcqZls 。本轮未修改 Figma 图层：新会话首次小范围读取成功，后续结构读取被 Starter MCP 额度拒绝。没有尝试覆盖、盲目修复旧画板或刷新原编辑页。对应修改保存在 second-round-design-notes.md，不能将现有 Figma 称为已与网页同步。

## 12 项网页实现

| 项目 | 结果 |
|---|---|
| 1 重要通知 | 替换 Your list；最新优先，紧凑展开，含猫咪、照护者、时间和来源。只用现有明确请求；目前无可确认的照护者离开或 TNR 完成事件，因此没有编造这两类通知。示例来源明确标注 Demo Data。 |
| 2 新手学习与知识 | Welcome、Zone 及原问卷保留。新加入者逐张确认四张有来源的基础卡片后结束；完成状态按浏览器保存。未完成时应用深链接也不能绕过。Care 底部 Care Basics，可展开；上方紧邻 Today’s Care Alerts，按观察记录显示，不作情绪或医学诊断。 |
| 3 Care 导航 | 导航和相关页面展示名统一 Care；旧 #today 地址保持兼容，并支持 #care。 |
| 4 Zone 需求头像 | 显示所在 Zone 全部有明确待办记录的猫；无喂食确认不自动产生喂食需求。保留横向圆头像。 |
| 5 推荐与记录 | Recommended、刷新排列、记录驱动的累计次数和需求、已知行为介绍或未知说明、照片跳转和轻量反馈；Home/Profile 使用 Add update，共用已有记录流程；最终成功页有不拦截操作的短暂彩带，遵守减少动态效果偏好。 |
| 6 头像次数与皇冠 | 最近 30 个新加坡日历日的有效去重照护记录计数；统计范围仅限当前猫，无全局榜单。并列最高可同时标记；隐藏或匿名领先者不会被展示，也不会为公开次名虚构皇冠。皇冠只表示记录数量，不表示质量、可靠性或正式主要照护者身份。 |
| 7 MewAI 命名 | AI 相关文案改为 MewAI，沿用导航的星形图案；MewLink 产品名不变。 |
| 8 自动建议 | 删除 Refresh suggestions，保留来源及依据数据时间；打开档案、记录变化、页面聚焦等沿用自动更新机制。 |
| 9 问答输入 | Type your question · Powered by MewAI。360px 下提示完整显示，实际输入文字使用正常字号。保留确认／无确认／冲突及来源处理。 |
| 10 个人贡献 | TNR 经验与猫咪 TNR 状态分开显示并有说明；圆点表示相应声明／档案状态。所有有效照护类型均按记录列出，包括 Cleaning，不再使用硬编码的个人喂养次数。问卷答案和协助选择本地持久化。 |
| 11 实用建议 | 优先引用具体猫咪记录，区分 Recorded next visit、Behaviour note、General guidance 及未知信息。不编造食物偏好、食谱、情绪或诊断。 |
| 12 观察日志 | 新加坡日期分组、时间倒序、统一卡片、作者／状态／照片／观察／不确定性／下次事项。旧 Tiger 详细文字及两条较早记录安全迁移，不覆盖已有用户记录或原始观察字段。 |

## 实际验证

- 59 项自动测试通过、0 失败。包括原有数据保存、Another cat、Not sure、草稿恢复、重复保存、分享分离、检索与访问范围；新增需求依据、统计、皇冠、学习、个人行为及减少动态效果检查。
- 390×844：Care 布局、推荐刷新顺序和次数不变、通知展开与来源、Care Basics 展开、Profile 及分日期日志、头像详情次数和隐藏／恢复。
- 360×640：照片与原话 → 喂食选择 → MewAI 规则草稿 → Review → 显式确认 Tiger → 最终确认保存 → Success。最终保存按钮底部 616px，可点击。快速双击保存仅新增一条记录且保留成功页；成功页三项操作均完整可达。
- 保存后 Ask MewAI 找到今天恰好一条新喂食记录，展开来源显示记录时间与 Mei Ling；Community 仍仅原有示例帖子，未自动发布。
- 375×667：Welcome 和 Zone／经验问卷 → 四张基础卡。每张未确认前 Continue／Finish 都禁用；未完成时直接打开 Cats 仍显示学习页；完成后进入 Care，重新载入不再强制学习。
- 1280×720 桌面：卡片宽 376px，维持原有手机形态预览，页面无横向溢出。
- 正式公共版本确认 Milo 的 Cleaning 记录正确显示、MewAI 标识与精简建议、无手动刷新按钮；360px 输入提示无截断。所检页面未捕获到控制台 warning/error。
- 减少动态效果通过组件逻辑测试确认不生成彩带；没有更改用户操作系统偏好，也没有物理 iPhone／Android 真机测试。

## 数据和 AI 边界

所有照护资料仍来自既有 Demo fixture 和用户在当前浏览器中保存的 Prototype 操作。后者是实际保存的交互数据，不代表已独立核实真实喂养事件。无真实账号后台、多人数据库或跨设备同步；头像隐藏及学习完成状态只在当前浏览器生效。

MewAI 的名称是本轮界面品牌更新；底层仍为可工作的本地规则检索、句子整理和建议组合，没有连接真实 LLM、向量检索服务或外部 AI API。Sources 继续明确说明这一点。自然语言记录不会自动确认猫咪，不会自动公开分享。

基础知识为简短转述，2026-10-29 核对来源：

- Cat Welfare Society：https://www.catwelfare.org/responsible-caregiving/
- AVS：https://avs.nparks.gov.sg/community-animals/living-harmoniously-with-community-animals/community-cats/

旧 AVS PDF 链接已不可用，改用当前官方社区猫页面。

## 源代码与 GitHub

完整本地目录：work/mewlink-project。新增主要模块：public/refinement-model.js、public/home-refinement-ui.js、public/refinement-ui.js、public/refinement.css。原有 Home、App、CareUpdate、知识库和头像组件原地修改。

本轮没有 commit、Push、PR 或其他远程仓库修改。HEAD 仍为 f8c7cc0820f006f23897c8d0503cfef0be5ce644；修改保留在工作目录，待用户验收后另行授权同步 GitHub。仅独立 Vercel 项目被部署，原始 Netlify 与其他项目未修改。

待完成：Figma 可编辑图层同步；需要恢复可用编辑额度后继续。当前没有剩余的已知阻塞性网页问题。
