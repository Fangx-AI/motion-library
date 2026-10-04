export type FeaturedCase = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  reason: string;
  learn: string[];
};

// These are Motion Library's editorial reading notes. Author instructions
// remain verbatim in works.json; upstream guides carry their own attribution.
export const featuredCases: FeaturedCase[] = [
  {
    id: "2102786378282987591",
    title: "用点击反馈，检查波纹与光感。",
    kicker: "交互图形 / WebGL2",
    description:
      "Clearwater：浅水、折射与涟漪的实时演示，附作者源码和互动页面。",
    reason: "把录屏与互动页面对照，再从源码查看折射和涟漪的实现。",
    learn: [
      "对照参考片与互动小样",
      "观察波纹、折射和涟漪反馈",
      "从作者源码查看实现",
    ],
  },
  {
    id: "2102476258948927543",
    title: "一段施法循环，写成一份具体规格。",
    kicker: "像素动画 / Canvas 2D",
    description: "像素巫师：作者指令规定分辨率、调色板、角色状态与粒子更新。",
    reason:
      "原文把待机、蓄力、施法和恢复拆成状态，并规定单个 HTML、无外部素材。适合学习如何描述动画约束。",
    learn: [
      "128 × 96 的逻辑画布与整数缩放",
      "用状态机描述四段动作",
      "固定时间步与预分配粒子",
    ],
  },
  {
    id: "2103273003555402193",
    title: "同一个形状，串起整套界面。",
    kicker: "界面动效 / 节拍与形变",
    description: "按钮、加载器、播放器与图表连续变形；作者公开了完整指令模板。",
    reason:
      "模板先要 UI 状态、配色与歌曲，再规定每拍变化、时间函数和逐拍预览。它提供制作约束，仍需要你补充自己的输入。",
    learn: [
      "把界面状态排到节拍上",
      "用 seek(t) 描述可逐帧渲染的动画",
      "检查文字切换与循环首尾",
    ],
  },
];
