<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getUserList, updateUser, banUser } from '#/api/gaming/user';
import { message, Modal as AModal, Tag as ATag, Input as AInput, Form as AForm, FormItem as AFormItem, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';

// 1. Form tìm kiếm
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

// 2. Cấu hình bảng
const gridOptions: VxeGridProps = {
  columns: [
    { field: 'id', title: 'ID', width: 60, align: 'center' }, // Tạo ID ảo ở backend
    { field: 'username', title: 'Username', minWidth: 120 },
    { field: 'msisdn', title: 'MSISDN', width: 150 },
    { field: 'status', title: 'Status', width: 100, slots: { default: 'status_slot' }, align: 'center' },
    { field: 'services', title: 'Services', minWidth: 120, align: 'center' },
    { field: 'lastPayment', title: 'Last Payment', width: 120, align: 'center' },
    { field: 'lastActive', title: 'Last Active', width: 120, align: 'center' },
    { field: 'createdAt', title: 'Created At', width: 120, align: 'center' },
    { title: 'Action', width: 120, slots: { default: 'action_slot' }, fixed: 'right', align: 'center' },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        try {
          const res: any = await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            username: formValues?.username || '',
            msisdn: formValues?.msisdn || ''
          });

          const payload = res?.data || res || {};
          const items = Array.isArray(payload) ? payload : (payload.items || []);
          const total = payload.total || items.length || 0;
          
          return { items, total };
        } catch (error: any) {
          // Bắt lỗi Vben chặn nhầm code: 0 giống như mẫu của ông
          if (error && error.code === 0 && error.data) {
            console.log("🛠️ Đã cứu được dữ liệu User:", error.data);
            const payload = error.data;
            const items = Array.isArray(payload) ? payload : (payload.items || []);
            const total = payload.total || items.length || 0;
            return { items, total };
          }

          console.error("❌ Lỗi lấy dữ liệu User:", error);
          return { items: [], total: 0 };
        }
      },
    },
  },
  toolbarConfig: { refresh: true }
};

const [Grid, gridApi] = (useVbenVxeGrid as any)({ formOptions, gridOptions });

// --- XỬ LÝ SỬA VÀ KHÓA USER ---
const isModalVisible = ref(false);
const confirmLoading = ref(false);
const editForm = reactive({ msisdn: '', username: '', status: '' });

// Nút Sửa
function handleEdit(row: any) {
  editForm.msisdn = row.msisdn;
  editForm.username = row.username;
  editForm.status = row.status;
  isModalVisible.value = true;
}

// Lưu thông tin sửa
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

// Nút Khóa / Mở Khóa
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
  <Page title="User List">
    <div class="p-4">
      <Grid>
        <template #status_slot="{ row }">
          <a-tag v-if="row.status === 'ACTIVE'" color="success" class="px-2 border-transparent bg-green-50 text-green-600">Active</a-tag>
          <a-tag v-else-if="row.status === 'BANNED'" color="error" class="px-2 border-transparent bg-red-50 text-red-600">Banned</a-tag>
          <a-tag v-else color="default">{{ row.status }}</a-tag>
        </template>

        <template #action_slot="{ row }">
          <div class="flex justify-center gap-3">
            <button @click="handleEdit(row)" class="text-gray-600 hover:text-blue-600 font-medium transition-colors">Edit</button>
            <button 
              @click="handleBan(row)" 
              :class="row.status === 'ACTIVE' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'"
              class="font-medium transition-colors"
            >
              {{ row.status === 'ACTIVE' ? 'Ban' : 'Unban' }}
            </button>
          </div>
        </template>
      </Grid>
    </div>

    <a-modal v-model:visible="isModalVisible" title="Edit User" @ok="handleSave" :confirm-loading="confirmLoading">
      <a-form layout="vertical">
        <a-form-item label="MSISDN (Read-only)">
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
