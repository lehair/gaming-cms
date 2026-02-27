<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getUserSubList } from '#/api/gaming/userSub';
import { Tag as ATag } from 'ant-design-vue';

// Cứu dữ liệu nếu gặp code: 0
const extractData = (res: any, err?: any) => {
  const raw = res || err?.response?.data || err?.data || err || {};
  const payload = raw?.data || raw || [];
  const items = Array.isArray(payload) ? payload : (payload?.items || []);
  const total = Array.isArray(payload) ? payload.length : (payload?.total || items.length || 0);
  return { items, total };
};

// 1. Cấu hình Form Tìm kiếm (Khớp ảnh: Search, Game Type, Status)
const formOptions = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'keyword', label: 'Search', componentProps: { placeholder: 'Username / MSISDN' }, colProps: { span: 8 } },
    { component: 'Select', fieldName: 'gameCode', label: 'Game Type', componentProps: { placeholder: 'All Games', options: [{ label: 'Mystery Box', value: 'MYSTERY_BOX' }, { label: 'Gold Miner', value: 'goldminer' }] }, colProps: { span: 8 } },
    { component: 'Select', fieldName: 'status', label: 'Status', componentProps: { placeholder: 'All Status', options: [{ label: 'Active', value: 1 }, { label: 'Expired', value: 0 }] }, colProps: { span: 8 } },
  ],
};

// 2. Cấu hình bảng (Căn giữa 100%, đúng thứ tự cột)
const gridOptions: VxeGridProps = {
  columns: [
    { field: 'id', title: 'ID', width: 60, align: 'center' },
    { field: 'msisdn', title: 'User (MSISDN)', minWidth: 150, align: 'center', slots: { default: 'user_slot' } },
    { field: 'game', title: 'Game', width: 140, align: 'center' },
    { field: 'package', title: 'Package', minWidth: 150, align: 'center' },
    { field: 'price', title: 'Price', width: 120, align: 'center', formatter: ({ cellValue }) => `${Number(cellValue).toLocaleString()} KHR` },
    { field: 'status', title: 'Status', width: 100, slots: { default: 'status_slot' }, align: 'center' },
    { field: 'startDate', title: 'Start Date', width: 120, align: 'center' },
    { field: 'endDate', title: 'End Date', width: 120, align: 'center' },
    { field: 'createdAt', title: 'Created At', width: 120, align: 'center' },
    { title: 'Action', width: 100, slots: { default: 'action_slot' }, fixed: 'right', align: 'center' },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        try {
          const res: any = await getUserSubList({
            page: page.currentPage,
            pageSize: page.pageSize,
            keyword: formValues.keyword,
            gameCode: formValues.gameCode,
            status: formValues.status
          });
          return extractData(res);
        } catch (error: any) {
          if (error && error.code === 0 && error.data) return extractData(error.data);
          return { items: [], total: 0 };
        }
      },
    },
  },
  // Bật nút chỉnh cột 4 ô vuông theo đúng ảnh 
  toolbarConfig: { custom: true, search: false, refresh: false }
};

const [Grid] = (useVbenVxeGrid as any)({ formOptions, gridOptions });
</script>

<template>
  <Page>
    <Grid>
      <template #toolbar-actions>
        <span class="text-[16px] text-gray-700 ml-1">User Subscriptions</span>
      </template>

      <template #user_slot="{ row }">
        <div class="flex flex-col items-center">
          <span class="font-medium text-gray-800">{{ row.msisdn }}</span>
          <span v-if="row.username !== '-'" class="text-xs text-gray-500">{{ row.username }}</span>
        </div>
      </template>

      <template #status_slot="{ row }">
        <a-tag v-if="row.status === 1" style="color: #52c41a; background: #f6ffed; border-color: #b7eb8f; border-radius: 4px;">
          Active
        </a-tag>
        <a-tag v-else style="color: #8c8c8c; background: #f5f5f5; border-color: #d9d9d9; border-radius: 4px;">
          Expired
        </a-tag>
      </template>

      <template #action_slot="{ row }">
        <div class="flex justify-center">
          <span v-if="row.status === 1" class="text-gray-500 hover:text-red-500 cursor-pointer transition-colors text-[13px]">
            Cancel
          </span>
          <span v-else class="text-gray-300 text-[13px]">-</span>
        </div>
      </template>
    </Grid>
  </Page>
</template>
