# MewLink — UX Refinement 06

日期：2026-10-30（新加坡）
生产部署：dpl_G7w2fPbaZ1fZk7S5AZHg2cZguow3
网址：https://mewlink-design-copy.vercel.app/#today

## 新手学习分流

只有家中没有猫（No），并且社区猫喂养经验为 New to this 或 Under 1 year，且尚未完成 Care Basics，才在提交加入问卷后进入强制学习。其他 6 种答案组合直接跳过。两个经验问题均需回答后才能加入；TNR 和帮助方式仍保持原有选择逻辑。

保留已完成学习的浏览器标记，不重复强制学习。旧版本遗留的学习待办标记不会强制有经验或家中养猫的用户学习。首页 Care Basics 仍随时可以展开阅读。路由、问卷提交和学习页面共用同一判断，避免判断不一致。

## 礼花优化

保留全屏 84 片主题色礼花。将 84 个独立元素的动画改成预先绘制的两层画布，仅做两层 transform / opacity 动画；绘制只发生一次，不使用持续 JavaScript requestAnimationFrame 循环。画布像素密度最多为 1.5，以减少高像素密度设备的绘制负担。约 3.7 秒后清理；退出成功页即清理；同一记录不重复播放；支持减少动态效果。

## 验证

- 自动测试 69 通过、0 失败，构建和 git diff --check 通过。
- 自动覆盖 8 种答案组合、未完成问卷、旧学习标记、完成后不重复学习、路由保护及既有记录一致性。
- 浏览器实际验证 No + New to this、No + Under 1 year 进入学习；Yes + New to this、No + 3+ years 跳过学习。
- 在独立预览域名走通 Tiger、Oyen 的 Add update 流程；测试数据不写入公开站点的浏览器存储。
- 最终成功页实际检测为两层 canvas，动画分别为 3 秒和 3.4 秒；没有逐片 DOM 动画；pointer-events 为 none；播放期间 Done 可点击。
- 自动测试验证了 84 片只绘制一次、画布分辨率上限、退出清理、同记录不重播、减少动态效果与绘图不支持时的降级。
- 自动化预览会限速后台动画，未把该限速结果当作实体手机帧率。没有声称在所有设备上达到固定帧率。

## 源码与同步

源码保留在 work/mewlink-project，完整压缩备份为 outputs/mewlink-ux06-source.zip。未 Commit、未 Push、未创建 PR，GitHub 不变。Figma 本轮未修改。没有修改原始 Netlify、原始 Figma 或其他 Vercel 项目。数据与规则检索仍是既有纯前端原型。
