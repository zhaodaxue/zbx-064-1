import type { PartData, PartId, CameraPreset, StepIndex } from '../types';

export const PARTS_DATA: Record<PartId, PartData> = {
  gong: {
    id: 'gong',
    name: '拱',
    title: '构件详解 · 下层拱',
    description:
      '拱是斗拱中最下层的横向受力构件，呈弓形横卧于柱顶。两端向上翘起，形成优美的曲线，中间承托上部的斗。拱身通常以整木裁取，纹理顺直，是斗拱体系中承受弯矩最大的部分。两端的「翘头」形制具有鲜明的时代特征，是断代研究的重要依据。',
    relatedStep: 1,
  },
  dou: {
    id: 'dou',
    name: '斗',
    title: '构件详解 · 上层斗',
    description:
      '斗是斗拱的核心连接件，因形似古代量器「斗」而得名。呈上宽下窄的方斗形，底面开槽与下层拱咬合，顶面开口承托枋头。斗在结构中起到「承上启下」的关键作用，将上部荷载均匀传递给下层拱。斗的四个侧面常雕有装饰纹样，是木作技艺展示的重点部位。',
    relatedStep: 2,
  },
  fang: {
    id: 'fang',
    name: '枋',
    title: '构件详解 · 枋头',
    description:
      '枋是纵向贯穿斗心的方木，起到拉结固定的作用。枋头穿过斗的卯口，与相邻开间的斗拱相连，形成水平方向的整体框架。枋的断面多为长方形，与斗的卯口配合精度要求极高，「严丝合缝」是评价木作技艺的重要标准。枋头外露部分常雕刻卷云、花卉等装饰图案。',
    relatedStep: 3,
  },
};

export const STEP_CAMERA_PRESETS: Record<StepIndex, CameraPreset> = {
  0: {
    position: [5.5, 4, 7],
    target: [0, 0.2, 0],
  },
  1: {
    position: [1.5, 2.5, 6.5],
    target: [0, -0.5, 0],
  },
  2: {
    position: [5, 3.5, -4.5],
    target: [0, 0.5, 0],
  },
  3: {
    position: [-5.5, 3.5, 4.5],
    target: [1.2, 0.6, 0],
  },
};

export const ANIMATION_DURATION = 0.65;

export const DISASSEMBLY_ORDER: PartId[] = ['gong', 'dou', 'fang'];
