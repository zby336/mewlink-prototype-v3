# MewLink 第二轮界面与体验修改说明

日期：2026-10-29，新加坡时间。

本文是本轮网页实现对应的 Figma 设计更新说明。当前 Figma Starter 账号在一次极小的只读检查后，再次拒绝后续读取，原因是 MCP 工具额度已达到上限。本轮未执行任何 Figma 图层修改，因此没有验证 Figma 与新网页已同步。不要将本文或界面截图称作已完成的可编辑 Figma 文件。

- 独立网站：https://mewlink-design-copy.vercel.app/
- 指定 Figma 副本：https://www.figma.com/design/mjKHxlL2JUoyMlluQcqZls
- 本地项目：`work/mewlink-project`。
- 本轮仅保留本地代码与直接部署所需文件，不 Push GitHub，不创建 PR，不修改远程仓库。
- 不修改原始 Netlify、原始 Figma 或其他 Vercel 项目。

## 延续的视觉与交互

继续使用 Atkinson Hyperlegible 正文、Newsreader 标题，米白背景、深棕正文、金黄色主要操作、淡粉观察卡和淡黄建议卡。主要颜色沿用现有 `#FAF6EF`、`#33261D`、`#E3AE45`、`#F8E9DF`、`#FBF1D9`。保留圆形头像、重叠头像组、大圆角猫咪照片、紧凑标签、四项底部导航，以及 Community 的现有动态和群聊结构。

保留既有照护草稿、可编辑 Review Note、猫咪身份确认、最终审核、保存幂等、保存与公开分享分离等逻辑。头像隐藏和身份偏好仍是浏览器本地原型设置，不能表示已有跨用户权限保护。

本说明中的整屏截图只应用于视觉核对，后续 Figma 同步应使用可编辑文字、组件、图片填充、矢量图标和正确图层关系，不应将整屏图片当作可编辑界面。

## 1 Home 重要通知

将原 `Your list` 区域换为 `Important notifications`，放在首页标题下方。默认以紧凑摘要显示最新事件和额外条目数量，点击后向下展开，不另建通知设置页面。

展开条目展示事件标题、相关猫咪入口、照护者、带新加坡时区的时间、具体内容及可展开的来源。按事件时间倒序排列。已有示例记录派生的通知明确标为 `Demo Data · example care record`。

目前以记录中明确写出的下一次照护请求生成通知；没有真实 TNR 完成或主要照护者离开事件记录时，不虚构这类通知。以后新增对应事件时，必须有明确的事件来源和时间，不能从缺少喂食记录或头像淡化推断。

实现：`public/refinement-model.js` 的通知派生逻辑，`public/home-refinement-ui.js` 的 `mew-important-notifications`，入口位于 `src/Home.dc.html`。

## 2 新照护者基础学习与 Care Basics

保留 Welcome、邀请加入、区域选择、养猫与照护经验等页面。新用户完成加入资料后，进入一轮四张基础知识卡：食物与饮水、接近猫咪、互动方式、安全与求助。

每张卡以大标题、简短正文、可信资料链接和阅读确认框呈现。未勾选当前卡时，继续按钮不可用；需要逐张阅读并确认全部四张卡后才能完成学习。允许返回上一张和返回资料页。完成状态按版本保存在当前浏览器，后续不再重复强制学习。

仅在新加入流程中设置待学习标记；已经在使用现有原型且没有待学习标记的浏览器，不被突然强制重做。待学习期间直接打开其他页面，也由主路由返回学习步骤。知识正文可垂直滚动，按钮在独立底部区域，保留安全区内边距。

Care 页面底部新增可展开的 `Care Basics`。它的正上方紧邻 `Today’s Care Alerts`，保留用户指定名称。提醒引用实际观察内容、记录时间和来源，明确观察不是医学诊断；没有记录不能被理解为猫咪心情正常或异常。

实现：`public/refinement-model.js` 的知识卡、学习完成状态、观察提醒；`public/home-refinement-ui.js` 的 `mew-learn-basics`、`mew-care-alerts`、`mew-care-basics`；`src/Home.dc.html` 与 `src/template.html` 的学习步骤和路由保护。

## 3 Today 导航名称改为 Care

主导航及相关页面显示名使用 `Care`。保留既有 `#today` 地址作为兼容入口，同时支持 `#care` 别名；更名不会破坏原有页面跳转或已有收藏网址。正常的日期文字以及用户指定的 `Today’s Care Alerts` 不需要因导航更名而删除。

实现：`src/template.html`、`src/Home.dc.html`、`src/App.dc.html` 及相关页面返回按钮；通用资料页导航同步采用 Care。

## 4 当前 Zone 有明确需求的猫咪头像条

首页横向头像条显示当前 Zone 内所有拥有明确待处理照护请求的猫咪，继续使用圆形照片和横向滑动。姓名下方是简短需求，例如 `Feeding check`、`Water check`、`Needs observation` 或 `Care cover`。

需求来自近期记录中明确写出的下一次照护事项，并附有关联来源。缺少今日喂食确认本身不产生待喂任务。有效的后续完成记录可解除对应请求；草稿、Seen、未最终保存记录不解除请求。没有需求时显示简洁空状态，不以其他 Zone 的猫咪填满列表。

实现：`public/refinement-model.js` 的 `needs`、`zoneNeeds`，`src/Home.dc.html` 的头像条。

## 5 Recommended 猫咪卡片与 Add update

首页卡片区标题统一为 `Recommended`。右侧用小型刷新按钮代替 `1 of 3`，每次点击改变推荐顺序，不修改照护数据、统计或喂食状态；原横向翻页与位置圆点仍可使用。

照片左上角根据当前用户累计的有效记录显示喂食或照护次数。零次使用自然的无记录文案，不继续使用原先写死的六次。照片右下文字使用已有记录或档案中有依据的性格、习惯、行为介绍；没有相关记录时明确表示尚在了解，不编造有趣故事。主要状态标签显示当前有来源的需求，没有确认需求时显示相应中性状态。

猫咪照片变为可点击的 Profile 入口，加入短暂的按压缩放和小星光反馈，并尊重减少动态效果偏好。已有喂食记录不会隐藏整组推荐或其他照护需求。

Home 与 Cat Profile 的主要照护入口统一为 `Add update`，复用同一 CareUpdate 流程。Home 通用入口不提前标记喂食，也不发布动态。成功保存后显示轻量庆祝效果；只在真实成功状态触发，不拦截 Make a memory、Share、Done。减少动态效果时省略动画。

实现：`src/Home.dc.html`、`src/CareUpdate.dc.html`、`public/refinement-ui.js`、`public/refinement.css`、既有 `public/care-knowledge.js` 草稿与保存逻辑；Cat Profile 对应入口在 `public/caregiver-ui.js` / `src/App.dc.html`。

## 6 渐隐头像的皇冠与照护次数

保留新加坡日历日期、过去 30 天、四档透明度和稳定随机顺序。每位照护者的淡化仍按最后一次有效照护时间计算；超过窗口后移除。统计排除无效记录、未来时间、单纯看到猫咪和帮忙意愿。

在公开头像中，为过去 30 天有效照护记录数最多的照护者显示小皇冠；并列最高可同时显示。统计按记录数量，不改变原本随机排列，也不创建全局排行榜。照护者详情将相对时间与 `N care updates` 放在同一行两侧。

私密身份继续匿名计入人数，但不因皇冠、排序或详情泄露昵称、头像或身份。隐藏的最高参与者不会被强制显示，也不应把下一位公开者假称为真正的全体最高。皇冠说明明确写出，它不代表照护质量或可靠性。

实现：`public/caregiver-model.js` 的活动人数和次数派生；`public/caregiver-ui.js` 的小皇冠、详情统计和隐私展示。

## 7 MewAI 名称和统一 AI 标识

助手和相关功能的显示名统一为 `MewAI`，例如 `Ask MewAI`、`Create draft with MewAI`、建议卡中的 `MewAI`。产品名始终为 `MewLink`。

标识复用原 Ask Mew 导航的星光轮廓图案，以小型矢量图标放在名称右侧，统一描边、颜色与基线。底部导航保留原图案并更改文字。旧 `#askmew` 路由继续有效，另支持 `#askmewai` 别名。

显示名变化不表示已经接入模型。建议来源说明仍明确写出使用本地规则、未连接生成模型；不将已有规则检索包装为真实 LLM 或真实 RAG 服务。

实现：`public/refinement-ui.js` 的 `mew-ai-mark`、`public/knowledge-ui.js`、`src/template.html`、`src/App.dc.html`、`src/CareUpdate.dc.html`、相关入口显示文字。

## 8 自动更新下一位照护者建议

从黄色 `For the next caregiver` 卡片删除 `Refresh suggestions`。保留具体建议、`View sources`、依据记录的最后更新时间和 MewAI 标识。

继续复用现有数据变化事件、重新打开页面、焦点恢复及定时检查机制，在资料变化时重新计算；不要求用户手动刷新，不因此新增 AI API。

实现：`public/knowledge-ui.js` 的 `NextCare` 数据视图；建议数据仍来自 `public/care-knowledge.js`。

## 9 Ask MewAI 输入框

底部输入提示采用 `Type your question · Powered by MewAI`。保留知识库问题推荐、发送、带来源及时间的答案、信息不足、未找到确认记录和冲突记录处理。它仍是围绕当前可访问猫咪照护记录和精选知识资料的问答界面。

实现：`src/App.dc.html` 的 Ask 页面与输入框，`public/care-knowledge.js` 的回答与来源检索。

## 10 个人 Profile 状态与贡献

右上角用户头像打开个人 Profile。用右上小圆点表示本人填写的 TNR 支持经验状态，并提供可读的文字说明、可访问标签和颜色释义；未填写时不能默认成已经参与。本人参与过 TNR 与猫咪已经完成 TNR 是两个独立事实。

个人统计与猫咪条目改为浏览器内实际保存记录派生的 Feeding、Observation、Water、Vet support、TNR support 等行为描述。移除旧的固定个人喂食次数和固定的精确地点解锁倒计时。猫咪缩略图上的 TNR 文本改为小圆点，仍说明该圆点描述的是猫咪档案状态。

实现：`src/Home.dc.html` 的个人 Profile，`public/refinement-model.js` 的 `contributions`；它们使用既有照护记录，不把示例声明或兴趣选择转成已经完成的照护行为。

## 11 更具体且有依据的建议

黄色卡片维持短句列表，优先使用当前猫咪的近期记录和明确交接说明。建议覆盖实际有资料的食物偏好、饮水检查、待观察身体部位、可观察的紧张／躲避／接近行为，以及本次最需注意的事项。

明确区分记录事实、待确认事项和通用知识。记录没有食物偏好时写明未知，不生成营养比例、份量或不存在的偏好；对饮水建议说明是通用提醒还是猫咪的具体请求；对身体和行为引用照护者原话，不给医学诊断，不把未知原因变成情绪判断。每个引用的来源应能在展开列表找到，并保留记录时间。

实现：`public/care-knowledge.js` 中共用建议与来源生成，`public/knowledge-ui.js` 中的展示，`public/refinement-model.js` 中需求与观察提醒；Ask MewAI 继续复用同一记录来源。

## 12 Observation Log 统一呈现

不同日期使用同一种卡片结构，按新加坡日期分组，日期与组内时间倒序排列。每条统一展示时间、照护者、原始观察、具体不确定性、下一次照护内容、可用照片和记录状态；统一标题、正文、行距、内边距、边框与背景。

不重写已有记录内容，不把不同记录合并为一个推断结论。示例记录与本地保存记录通过同一个组件展示，避免“Yesterday 的一套旧布局”和“今天另一套布局”并存。详情仍属于圈子原型，不表示已实现真实账号权限。

实现：`public/knowledge-ui.js` 的 `ObservationLog`；`public/caregiver-ui.js` 及 `src/App.dc.html` 的档案入口使用共享组件。

## Figma 恢复后的屏幕对应关系

以下是此前已经确认过的文件节点，不表示本轮重新验证了它们的当前内容。恢复编辑额度后应先读取实际节点，再做局部更新。

| 屏幕或状态 | 已知节点 | 本轮需要对齐的内容 |
|---|---|---|
| 原 Today 首页 | `3:34` | Care、通知、Zone 需求、Recommended、Alerts、Basics |
| Community | `3:371` | Care 导航与 Ask MewAI 命名；保留原动态和群聊 |
| Ask 页面 | `3:543` | Ask MewAI 标识、输入提示、来源和不确定性 |
| Tiger Profile | `3:1133` | Add update、皇冠、自动建议、统一日志 |
| Feature Update 01 对照区 | `2018:66` | 参考既有照护者详情和小屏弹层；更新皇冠与次数 |
| Your words | `3:3220` | MewAI 草稿名称与统一标识 |
| Review Note | `3:3261` | 保留可编辑与原始输入比较；统一品牌 |
| Confirm Cat | `3:3361` | 保留 Yes／Another cat／Not sure 与用户选择 |
| Check Before Saving | `3:3409` | 保留正确猫咪关联和保存／分享分离 |
| Success | `3:3460` | 保存成功后轻量庆祝，保留全部后续操作 |
| Welcome／Join／新学习步骤 | 待实际文件检查 | 不猜测旧节点；学习是新增状态，不覆盖原区域选择 |
| User Profile | 待实际文件检查 | 个人 TNR 经验点、猫咪状态点、实际贡献文案 |

此前 Observation 卡片 `3:1167` 曾在旧一轮编辑中发生中断，状态未完整验证。恢复 Figma 时应先检查该卡片，避免把未确认状态继续复制到新设计。现有字体、变量和组件可以复用，不应盲目运行早于本轮调整的旧同步脚本。

## 数据与 AI 边界

本轮仍是纯前端 Prototype：初始示例猫咪、示例照护记录和示例帖子，加上当前浏览器里用户实际操作后保存的记录。后者是本地原型行为记录，不等于外部核验过的真实世界事件，也不会自动同步到其他设备。

人数、次数、皇冠、需求、通知、提醒和问答从共享记录派生；明确使用示例的通知和观察提醒带有 Demo Data 说明。照护基础知识来自已列出的 CWS／AVS 等资料，系统不凭空生成猫咪偏好或医学结论。

MewAI 的当前实现是本地关键词、结构化记录检索和规则处理；没有真实 LLM、嵌入模型、向量数据库或远程 RAG 服务。记录草稿只组织用户自己的文字。界面品牌更新与真实模型接入应当明确区分。

## 移动端核对要点

重点检查 360×640、375×667、390×844 和桌面移动预览：通知展开不覆盖操作；横向头像和卡片可滑动；刷新只排列卡片；学习正文可滚动且按钮可到达；Add update 完整保存；成功庆祝不拦截点击；资料与日志共享最新记录。所有固定底部区域处理 `safe-area-inset-bottom`，保留已有 Bottom Sheet 层级与滚动修复。

本文列出设计与实现要求，不替代主代理完成后的实际测试报告。Figma 同步状态仍为未完成／未验证；网页开发和独立 Vercel 部署不应被 Figma 额度限制阻塞。
