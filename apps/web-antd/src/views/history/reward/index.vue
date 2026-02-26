<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getRewardHistoryList } from '#/api/gaming/history';

// 1. Cấu hình Form Tìm Kiếm
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'userId',
      label: 'SĐT (User ID)',
      componentProps: { placeholder: 'Nhập SĐT cần tìm' },
    },
    {
      component: 'Select',
      fieldName: 'gameId',
      label: 'Game',
      componentProps: {
        placeholder: 'Chọn Game',
        options: [
          { label: 'Mystery Box', value: 'MYSTERY_BOX' },
          { label: 'Vòng Quay', value: 'LUCKY_WHEEL' },
        ],
      },
    },
  ],
};

// 2. Cấu hình Bảng Dữ Liệu
const gridOptions: VxeGridProps = {
  columns: [
    { title: 'ID', field: 'id', width: 80, align: 'center' },
    { title: 'SĐT (User ID)', field: 'userId', width: 150 },
    { title: 'Tên hiển thị', field: 'fullName', minWidth: 150 },
    { title: 'Nguồn', field: 'sourceType', width: 120 },
    { title: 'Game', field: 'gameId', width: 130 },
    { title: 'Loại Quà', field: 'rewardType', width: 120 },
    { title: 'Mã Quà', field: 'rewardId', width: 150 },
    { title: 'Số lượng', field: 'quantity', width: 100, align: 'center' },
    { 
      title: 'Thời gian', 
      field: 'createdAt', 
      minWidth: 180,
      formatter: ({ cellValue }) => new Date(cellValue).toLocaleString('vi-VN')
    },
  ],
  proxyConfig: {
    ajax: {
      query: async (params: any, formValues: any) => {
        const formData = formValues || params.searchParams || params.form || {};
        
        const queryData = {
          page: params.page?.currentPage || 1,
          pageSize: params.page?.pageSize || 20,
          userId: formData.userId || '', 
          gameId: formData.gameId || ''
        };

        try {
          const res: any = await getRewardHistoryList(queryData);
          
          const payload = res?.data || res || {};
          const items = Array.isArray(payload) ? payload : (payload.items || []);
          const total = payload.total || items.length || 0;
          
          return { items, total };
        } catch (error: any) {
 
          if (error && error.code === 0 && error.data) {
            console.log("🛠️ Đã cứu được dữ liệu Nhận Quà bị ném nhầm:", error.data);
            const payload = error.data;
            const items = Array.isArray(payload) ? payload : (payload.items || []);
            const total = payload.total || items.length || 0;
            return { items, total };
          }
          
          console.error("❌ Lỗi lấy lịch sử nhận quà:", error);
          return { items: [], total: 0 };
        }
      },
    },
  },
};

const [Grid] = (useVbenVxeGrid as any)({ 
  formOptions, 
  gridOptions 
});
</script>

<template>
  <Page title="Lịch Sử Nhận Quà">
    <div class="p-4">
      <Grid />
    </div>
  </Page>
</template>
