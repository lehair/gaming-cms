<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getLuckyBoxList, updateLuckyBox, deleteLuckyBox, addLuckyBox } from '#/api/gaming/luckybox';
import { message, Modal as AModal, Form as AForm, FormItem as AFormItem, InputNumber as AInputNumber, Switch as ASwitch, Input as AInput } from 'ant-design-vue';

// 1. Trạng thái Modal và Form
const isModalVisible = ref(false);
const confirmLoading = ref(false);
const isEditMode = ref(false); // Phân biệt Thêm hay Sửa

const formData = reactive({
  id: 0,
  gameId: 'MYSTERY_BOX',
  rewardType: 'Items',
  rewardId: '',
  quantity: 1,
  weight: 0,
  isActive: true
});

const gridOptions: VxeGridProps = {
  columns: [
    { type: 'seq', width: 50 },
    { title: 'Tên Game', field: 'game.name', minWidth: 150 },
    { title: 'Loại Quà', field: 'rewardType', width: 100 }, 
    { title: 'Vật Phẩm ID', field: 'rewardId', width: 120 },
    { title: 'Số Lượng', field: 'quantity', width: 100 },
    { title: 'Trọng Số', field: 'weight', width: 120, slots: { default: 'weight_slot' } },
    { 
      title: 'Trạng Thái', 
      field: 'isActive', 
      width: 120, 
      formatter: ({ cellValue }) => cellValue ? '🟢 Đang chạy' : '🔴 Tắt' 
    },
    { title: 'Thao Tác', width: 180, slots: { default: 'action_slot' } },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        const response = await getLuckyBoxList({ 
          page: page.currentPage, 
          pageSize: page.pageSize 
        });
        return {
          items: response || [],
          total: response?.length || 0
        };
      },
    },
  },
};

const [Grid, gridApi] = (useVbenVxeGrid as any)({ gridOptions });

// 2. Xử lý Thêm mới: Reset form và mở Modal
function handleAdd() {
  isEditMode.value = false;
  formData.id = 0;
  formData.gameId = 'MYSTERY_BOX';
  formData.rewardType = 'Items';
  formData.rewardId = '';
  formData.quantity = 1;
  formData.weight = 0;
  formData.isActive = true;
  isModalVisible.value = true;
}

// 3. Xử lý Sửa: Đổ dữ liệu vào Form
function handleEdit(row: any) {
  isEditMode.value = true;
  formData.id = row.id;
  formData.gameId = row.gameId;
  formData.rewardType = row.rewardType;
  formData.rewardId = row.rewardId;
  formData.weight = row.weight;
  formData.quantity = row.quantity;
  formData.isActive = row.isActive;
  isModalVisible.value = true;
}

// 4. Xử lý Lưu (OK): Gọi API Thêm hoặc Sửa
async function handleOk() {
  confirmLoading.value = true;
  try {
    if (isEditMode.value) {
      // Gọi API Sửa
      await updateLuckyBox(formData.id, {
        weight: formData.weight,
        quantity: formData.quantity,
        isActive: formData.isActive
      });
      message.success('Cập nhật thành công');
    } else {
      // Gọi API Thêm mới (Cần đảm bảo hàm addLuckyBox đã import)
      await addLuckyBox(formData);
      message.success('Thêm quà mới thành công');
    }
    isModalVisible.value = false;
    gridApi.reload(); 
  } catch (error) {
    message.error('Thao tác thất bại');
  } finally {
    confirmLoading.value = false;
  }
}

// 5. Xử lý Xóa
async function handleDelete(row: any) {
  AModal.confirm({
    title: 'Xác nhận xóa',
    content: `Bạn có chắc muốn xóa phần quà ID ${row.id} không?`,
    onOk: async () => {
      try {
        await deleteLuckyBox(row.id);
        message.success('Đã xóa quà');
        gridApi.reload();
      } catch (error) {
        message.error('Lỗi khi xóa bản ghi');
      }
    },
  });
}
</script>

<template>
  <Page title="Quản lý Luckybox" description="Cấu hình tỉ lệ và danh sách quà tặng trực tiếp từ MySQL">
    <template #extra>
       <button
        @click="handleAdd"
        class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
         + Thêm Quà Mới
       </button>
    </template>

    <div class="p-4">
      <Grid>
        <template #weight_slot="{ row }">
          <span class="text-yellow-500 font-bold">{{ row.weight }}</span>
        </template>

        <template #action_slot="{ row }">
          <button @click="handleEdit(row)" class="text-blue-500 hover:underline mr-4">
            Sửa
          </button>
          <button @click="handleDelete(row)" class="text-red-500 hover:underline">
            Xóa
          </button>
        </template>
      </Grid>
    </div>

    <a-modal
      v-model:visible="isModalVisible"
      :title="isEditMode ? 'Chỉnh sửa cấu hình quà' : 'Thêm cấu hình quà mới'"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <a-form layout="vertical">
        <template v-if="!isEditMode">
          <a-form-item label="Game ID">
            <a-input v-model:value="formData.gameId" placeholder="Ví dụ: MYSTERY_BOX" />
          </a-form-item>
          <a-form-item label="Vật Phẩm ID (rewardId)">
            <a-input v-model:value="formData.rewardId" placeholder="Nhập ID vật phẩm" />
          </a-form-item>
        </template>

        <a-form-item label="Trọng số (Weight)">
          <a-input-number v-model:value="formData.weight" :min="0" class="w-full" />
        </a-form-item>
        
        <a-form-item label="Số lượng">
          <a-input-number v-model:value="formData.quantity" :min="1" class="w-full" />
        </a-form-item>

        <a-form-item label="Trạng thái hoạt động">
          <a-switch v-model:checked="formData.isActive" checked-children="Bật" un-checked-children="Tắt" />
        </a-form-item>
      </a-form>
    </a-modal>
  </Page>
</template>
