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
      // Hứng tham số thứ 2 (formValues) để lấy dữ liệu tìm kiếm
      query: async (params: any, formValues: any) => {
        
        console.log("🔥 Dữ liệu Form bắt được (Reward):", formValues);

        const queryData = {
          page: params.page?.currentPage || 1,
          pageSize: params.page?.pageSize || 20,
          userId: formValues?.userId || '', 
          gameId: formValues?.gameId || ''
        };

        try {
          const res = await getRewardHistoryList(queryData);
          return { 
            items: res?.items || res?.data?.items || [], 
            total: res?.total || res?.data?.total || 0 
          };
        } catch (error) {
          console.error("Lỗi gọi API Nhận Quà:", error);
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
