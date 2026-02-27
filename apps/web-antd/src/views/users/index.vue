<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getUserList, updateUser, banUser } from '#/api/gaming/user';
import { message, Modal as AModal, Tag as ATag, Input as AInput, Form as AForm, FormItem as AFormItem, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';

// Hàm bóc tách data vớt lỗi No Data
const extractData = (res: any, err?: any) => {
  const raw = res || err?.response?.data || err?.data || err || {};
  const payload = raw?.data || raw || [];
  const items = Array.isArray(payload) ? payload : (payload?.items || []);
  const total = Array.isArray(payload) ? payload.length : (payload?.total || items.length || 0);
  return { items, total };
};

// 1. Cấu hình Form Tìm kiếm (Username và Phone)
const formOptions = {
  collapsed: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'username',
      label: 'Username',
      componentProps: { placeholder: 'Please enter' },
      colProps: { span: 8 },
    },
    {
      component: 'Input',
      fieldName: 'msisdn',
      label: 'Phone (MSISDN)',
      componentProps: { placeholder: 'Please enter' },
      colProps: { span: 8 },
    },
  ],
};

// 2. Cấu hình Grid (Căn giữa toàn bộ các cột giống y hệt ảnh)
const gridOptions: VxeGridProps = {
  columns: [
    { field: 'id', title: 'ID', width: 60, align: 'center' },
    { field: 'username', title: 'Username', minWidth: 150, align: 'center' },
    { field: 'msisdn', title: 'MSISDN', width: 150, align: 'center' },
    { field: 'status', title: 'Status', width: 100, slots: { default: 'status_slot' }, align: 'center' },
    { field: 'services', title: 'Services', minWidth: 120, align: 'center' },
    { field: 'lastPayment', title: 'Last Payment', width: 140, align: 'center' },
    { field: 'lastActive', title: 'Last Active', width: 140, align: 'center' },
    { field: 'createdAt', title: 'Created At', width: 180, align: 'center' },
    { title: 'Action', width: 100, slots: { default: 'action_slot' }, fixed: 'right', align: 'center' },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        try {
          const res: any = await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            username: formValues.username,
            msisdn: formValues.msisdn
          });
          return extractData(res);
        } catch (error: any) {
          if (error && error.code === 0 && error.data) {
            return extractData(error.data);
          }
          return { items: [], total: 0 };
        }
      },
    },
  },
  // Bật đúng 2 icon Kính lúp xanh và 4 ô vuông (Tắt nút refresh vì ảnh gốc không có)
  toolbarConfig: { 
    search: true, 
    custom: true,
    refresh: false 
  }
};

const [Grid, gridApi] = (useVbenVxeGrid as any)({ formOptions, gridOptions });

// --- XỬ LÝ SỰ KIỆN ---
const isModalVisible = ref(false);
const confirmLoading = ref(false);
const editForm = reactive({ msisdn: '', username: '', status: '' });

function handleEdit(row: any) {
  editForm.msisdn = row.msisdn;
  editForm.username = row.username;
  editForm.status = row.status;
  isModalVisible.value = true;
}

async function handleSave() {
  confirmLoading.value = true;
  try {
    await updateUser(editForm.msisdn, { username: editForm.username, status: editForm.status });
    message.success('Update successful');
    isModalVisible.value = false;
    gridApi.reload();
  } catch (e) {
    message.error('Update failed');
  } finally {
    confirmLoading.value = false;
  }
}

function handleBan(row: any) {
  const newStatus = row.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'; 
  const actionText = row.status === 'ACTIVE' ? 'Ban' : 'Unban';
  
  AModal.confirm({
    title: `Confirm ${actionText}`,
    content: `Are you sure you want to ${actionText.toLowerCase()} user ${row.username || row.msisdn}?`,
    onOk: async () => {
      try {
        await banUser(row.msisdn, newStatus);
        message.success(`${actionText} successful`);
        gridApi.reload();
      } catch (e) {
        message.error('Action failed');
      }
    }
  });
}
</script>

<template>
  <Page>
    <Grid>
      <template #toolbar-actions>
        <span class="text-[16px] text-gray-700 ml-1">User List</span>
      </template>

      <template #status_slot="{ row }">
        <a-tag v-if="row.status === 'ACTIVE'" style="color: #52c41a; background: #f6ffed; border-color: #b7eb8f; border-radius: 4px;">
          Active
        </a-tag>
        <a-tag v-else style="color: #ff4d4f; background: #fff2f0; border-color: #ffccc7; border-radius: 4px;">
          Banned
        </a-tag>
      </template>

      <template #action_slot="{ row }">
        <div class="flex justify-center gap-2">
          <span 
            @click="handleEdit(row)" 
            class="text-gray-600 hover:text-blue-500 cursor-pointer transition-colors text-[14px]"
          >
            Edit
          </span>
          <span 
            @click="handleBan(row)" 
            class="text-[#ff4d4f] hover:text-red-700 cursor-pointer transition-colors text-[14px]"
          >
            {{ row.status === 'ACTIVE' ? 'Ban' : 'Unban' }}
          </span>
        </div>
      </template>
    </Grid>

    <a-modal v-model:visible="isModalVisible" title="Edit User" @ok="handleSave" :confirm-loading="confirmLoading">
      <a-form layout="vertical" class="mt-4">
        <a-form-item label="MSISDN">
          <a-input v-model:value="editForm.msisdn" disabled />
        </a-form-item>
        <a-form-item label="Username">
          <a-input v-model:value="editForm.username" />
        </a-form-item>
        <a-form-item label="Status">
          <a-select v-model:value="editForm.status">
            <a-select-option value="ACTIVE">Active</a-select-option>
            <a-select-option value="BANNED">Banned</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </Page>
</template>
