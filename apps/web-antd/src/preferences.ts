import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // Cấu hình tên ứng dụng
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    defaultHomePath: '/homepage/index', // Trang home sau login
  },
  // Thiết lập Dark Mode toàn cục để có màu đen giống hình mẫu Hải muốn
  theme: {
    mode: 'dark', 
  },
  // Sửa lỗi ts(2353): Xóa thuộc tính 'theme' khỏi sidebar
  sidebar: {
    collapsed: false,
    width: 210,
  },
});
