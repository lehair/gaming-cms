<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getScoreHistoryList } from '#/api/gaming/history';

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
    { title: 'Game', field: 'gameId', width: 130 },
    { title: 'Mùa giải', field: 'seasonId', width: 100, align: 'center' },
    { 
      title: 'Điểm (+)', 
      field: 'scorePlus', 
      width: 120, 
      align: 'right',
      formatter: ({ cellValue }) => `+${Number(cellValue).toLocaleString()}`
    },
    { 
      title: 'Tổng điểm', 
      field: 'totalScore', 
      width: 120, 
      align: 'right',
      formatter: ({ cellValue }) => Number(cellValue).toLocaleString()
    },
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
        const queryData = {
          page: params.page?.currentPage || 1,
          pageSize: params.page?.pageSize || 20,
          userId: formValues?.userId || '',
          gameId: formValues?.gameId || ''
        };

        try {
          const res: any = await getScoreHistoryList(queryData);
          // Lấy đúng tầng chứa items và total từ API
          const payload = res?.data || res || {};
          return { 
            items: payload.items || [], 
            total: payload.total || 0 
          };
        } catch (error) {
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
  <Page title="Lịch Sử Nạp Điểm">
    <div class="p-4">
      <Grid />
    </div>
  </Page>
</template>
