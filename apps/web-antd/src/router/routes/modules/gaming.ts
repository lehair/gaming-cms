import type { RouteRecordRaw } from 'vue-router';

const BasicLayout = () => import('#/layouts/basic.vue');

const routes: RouteRecordRaw[] = [
  // --- MỤC 1: LUCKYBOX ---
  {
    path: '/luckybox',
    name: 'LuckyboxRoot',
    component: BasicLayout,
    meta: {
      title: 'Quản lý Luckybox',
      order: 1000,
    },
    children: [
      {
        path: 'index',
        name: 'LuckyboxManagement',
        component: () => import('#/views/luckybox/index.vue'),
        meta: {
          title: 'Cấu hình Luckybox',
          icon: 'lucide:gift',
        },
      },
    ],
  },

  // --- MỤC 2: BẢNG XẾP HẠNG (Đã thêm Cấu hình Quà) ---
  {
    path: '/leaderboard',
    name: 'LeaderboardRoot',
    component: BasicLayout,
    meta: {
      title: 'Quản lý BXH',
      order: 1001,
    },
    children: [
      {
        path: 'index',
        name: 'LeaderboardManagement',
        component: () => import('#/views/leaderboard/index.vue'),
        meta: {
          title: 'Bảng Xếp Hạng',
          icon: 'lucide:trophy',
        },
      },
      // Thêm Menu Cấu hình phần thưởng Leaderboard vào đây
      {
        path: 'prize-config',
        name: 'LeaderboardPrizeConfig',
        component: () => import('#/views/leaderboard-prize/index.vue'),
        meta: {
          title: 'Cấu hình Quà Đua Top',
          icon: 'lucide:settings-2',
        },
      },
    ],
  },

  // --- MỤC 3: LỊCH SỬ ---
  {
    path: '/history-score',
    name: 'HistoryScore',
    component: BasicLayout,
    meta: { title: 'Lịch sử nạp điểm', order: 1002 },
    children: [
      {
        path: 'index',
        name: 'HistoryScoreIndex',
        component: () => import('#/views/history/score/index.vue'),
        meta: { title: 'Lịch sử nạp điểm', icon: 'lucide:history' },
      },
    ],
  },
  {
    path: '/history-reward',
    name: 'HistoryReward',
    component: BasicLayout,
    meta: { title: 'Lịch sử nhận quà', order: 1003 },
    children: [
      {
        path: 'index',
        name: 'HistoryRewardIndex',
        component: () => import('#/views/history/reward/index.vue'),
        meta: { title: 'Lịch sử nhận quà', icon: 'lucide:gift' },
      },
    ],
  }
];

export default routes;
