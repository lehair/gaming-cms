import type { Recordable, UserInfo } from '@vben/types';
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // <-- Đã khôi phục
import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';
import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter(); // <-- Đã khôi phục
  const loginLoading = ref(false);

  async function authLogin(params: Recordable<any>, onSuccess?: () => Promise<void> | void) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      
      const res: any = await loginApi(params);
      const token = res?.token || res?.Token || res?.accessToken;

      if (token) {
        accessStore.setAccessToken(token);

        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;
        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);
        
        // TUYỆT ĐỐI KHÔNG GỌI setIsAccessChecked(true) Ở ĐÂY NỮA!
        // Để cho router/guard.ts tự động kích hoạt tiến trình vẽ Menu động.

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          // Lấy đường dẫn từ Backend, nếu Backend không trả về homePath thì lấy trang mặc định /homepage/index
          let redirectPath = userInfo.homePath || preferences.app.defaultHomePath || '/homepage/index';
          
          // Trả lại luồng chuyển trang mượt mà của Vue Router
          if (onSuccess) {
            await onSuccess();
          } else {
            await router.push(redirectPath);
          }
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}: ${userInfo.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
    } finally {
      loginLoading.value = false;
    }
    return { userInfo };
  }

  // --- LUỒNG LOGOUT "BỨC TỬ" CHUẨN 100% ---
  async function logout(redirect: boolean = true) {
    // 1. Gọi API Logout
    try {
      await logoutApi(); 
    } catch (err) {
      console.error('Lỗi API Logout:', err);
    }
    
    // 2. Dọn dẹp Store (Bọc try-catch để đề phòng lỗi ngầm làm đứt luồng)
    try {
      accessStore.setAccessToken(null);
      accessStore.setAccessCodes([]);
      userStore.setUserInfo(null);
      accessStore.setIsAccessChecked(false);
      accessStore.setLoginExpired(false);
      resetAllStores();
    } catch (err) {
      console.error('Lỗi dọn dẹp Store:', err);
    }

    // 3. Ép văng ra Login bằng trình duyệt (Không dùng router.replace nữa)
    if (redirect) {
      // Lấy chính xác URL của trang Login dù ông đang dùng Hash hay History mode
      const loginUrl = router.resolve({ path: LOGIN_PATH }).href;
      
      // Bẻ lái trình duyệt về trang Login ngay lập tức
      window.location.href = loginUrl;

      // Cho 200ms để trình duyệt kịp cập nhật URL, sau đó giáng búa F5 xóa sạch xác layout cũ
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  return { authLogin, fetchUserInfo, loginLoading, logout };
});
