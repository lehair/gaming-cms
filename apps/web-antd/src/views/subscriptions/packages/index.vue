<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getPackageList, addPackage, updatePackage, deletePackage } from '#/api/gaming/package';
import { message, Modal as AModal, Tag as ATag, Input as AInput, Form as AForm, FormItem as AFormItem, Select as ASelect, InputNumber as AInputNumber, Textarea as ATextarea, Button as AButton } from 'ant-design-vue';

// Hàm bóc tách data cứu tinh
const extractData = (res: any, err?: any) => {
  const raw = res || err?.response?.data || err?.data || err || {};
  const payload = raw?.data || raw || [];
  const items = Array.isArray(payload) ? payload : (payload?.items || []);
  const total = Array.isArray(payload) ? payload.length : (payload?.total || items.length || 0);
  return { items, total };
};

// 1. Form tìm kiếm
const formOptions = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'keyword', label: 'Search', componentProps: { placeholder: 'Code / Name' }, colProps: { span: 8 } },
    { component: 'Select', fieldName: 'gameCode', label: 'Game Type', componentProps: { placeholder: 'All Games', options: [{ label: 'Gold Miner', value: 'goldminer' }, { label: 'Mystery Box', value: 'MYSTERY_BOX' }] }, colProps: { span: 8 } },
  ],
};

// 2. Cấu hình bảng
const gridOptions: VxeGridProps = {
  columns: [
    { field: 'id', title: 'ID', width: 60, align: 'center' },
    { field: 'code', title: 'Code', width: 120, align: 'center' },
    { field: 'name', title: 'Name', minWidth: 150 },
    { field: 'type', title: 'Type', width: 100, align: 'center' },
    { field: 'description', title: 'Description', minWidth: 250 },
    { field: 'gameType', title: 'Game Type', width: 120, align: 'center' },
    { field: 'price', title: 'Price', width: 150, align: 'right', formatter: ({ cellValue }) => `${Number(cellValue).toLocaleString()} KHR` },
    { field: 'status', title: 'Status', width: 100, slots: { default: 'status_slot' }, align: 'center' },
    { title: 'Action', width: 120, slots: { default: 'action_slot' }, fixed: 'right', align: 'center' },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        try {
          const res = await getPackageList({ page: page.currentPage, pageSize: page.pageSize, keyword: formValues?.keyword, gameCode: formValues?.gameCode });
          return extractData(res);
        } catch (error: any) {
          if (error && error.code === 0 && error.data) return extractData(error.data);
          return { items: [], total: 0 };
        }
      },
    },
  },
  // ... (giữ nguyên proxyConfig ở trên)
  toolbarConfig: { 
    search: true, // Bật nút Kính lúp (ẩn/hiện form tìm kiếm)
    custom: true, // Bật nút 4 ô vuông (tùy chỉnh ẩn/hiện cột)
    refresh: false, // Tắt nút refresh (vì trong ảnh của ông không có)
    zoom: false,  // Tắt nút phóng to toàn màn hình
  }
};

const [Grid, gridApi] = (useVbenVxeGrid as any)({ formOptions, gridOptions });

// --- XỬ LÝ THÊM/SỬA/XÓA ---
const isModalVisible = ref(false);
const confirmLoading = ref(false);
const isEditMode = ref(false);

const formData = reactive({ id: 0, code: '', name: '', duration_days: 1, gameId: 1, price: 0, description: '' });

function handleAdd() {
  isEditMode.value = false;
  Object.assign(formData, { id: 0, code: '', name: '', duration_days: 1, gameId: 1, price: 0, description: '' });
  isModalVisible.value = true;
}

function handleEdit(row: any) {
  isEditMode.value = true;
  Object.assign(formData, { id: row.id, code: row.code, name: row.name, duration_days: row.duration_days, gameId: row.gameId, price: row.price, description: row.description });
  isModalVisible.value = true;
}

async function handleSave() {
  confirmLoading.value = true;
  try {
    if (isEditMode.value) {
      await updatePackage(formData.id, formData);
      message.success('Update successful');
    } else {
      await addPackage(formData);
      message.success('Created successful');
    }
    isModalVisible.value = false;
    gridApi.reload();
  } catch (e) { message.error('Operation failed'); } finally { confirmLoading.value = false; }
}

function handleDelete(row: any) {
  AModal.confirm({
    title: 'Confirm Delete',
    content: `Are you sure you want to delete package ${row.code}?`,
    onOk: async () => {
      try {
        await deletePackage(row.id);
        message.success('Deleted successfully');
        gridApi.reload();
      } catch (e) { message.error('Failed to delete'); }
    }
  });
}
</script>

<template>
  <Page>
    <Grid>
      
      <template #toolbar-actions>
        <div class="flex items-center gap-3">
          <span class="text-[16px] text-gray-700">Subscription Packages</span>
          <a-button type="primary" @click="handleAdd">Create Package</a-button>
        </div>
      </template>

      <template #status_slot="{ row }">
        <a-tag color="success" style="background: transparent; border-color: #52c41a; color: #52c41a;">
          {{ row.status }}
        </a-tag>
      </template>

      <template #action_slot="{ row }">
        <div class="flex justify-center gap-3">
          <span @click="handleEdit(row)" class="text-gray-500 hover:text-blue-600 cursor-pointer transition-colors text-sm">Edit</span>
          <span @click="handleDelete(row)" class="text-red-500 hover:text-red-700 cursor-pointer transition-colors text-sm">Delete</span>
        </div>
      </template>

    </Grid>

    <a-modal v-model:visible="isModalVisible" :title="isEditMode ? 'Edit Package' : 'Create Package'" @ok="handleSave" :confirm-loading="confirmLoading" width="600px">
      <a-form layout="vertical" class="mt-4">
        <div class="grid grid-cols-2 gap-4">
          <a-form-item label="Package Code">
            <a-input v-model:value="formData.code" placeholder="e.g. THANG" />
          </a-form-item>
          <a-form-item label="Name">
            <a-input v-model:value="formData.name" placeholder="e.g. VIP 3" />
          </a-form-item>
          <a-form-item label="Game ID">
            <a-input-number v-model:value="formData.gameId" class="w-full" />
          </a-form-item>
          <a-form-item label="Duration (Days)">
            <a-input-number v-model:value="formData.duration_days" :min="1" class="w-full" placeholder="e.g. 30" />
          </a-form-item>
          <a-form-item label="Price (KHR)">
            <a-input-number v-model:value="formData.price" :min="0" class="w-full" />
          </a-form-item>
        </div>
        <a-form-item label="Description">
          <a-textarea v-model:value="formData.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </Page>
</template>
