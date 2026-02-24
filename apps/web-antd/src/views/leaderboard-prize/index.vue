<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { 
  getLeaderboardPrizeList, 
  addLeaderboardPrize, 
  updateLeaderboardPrize, 
  deleteLeaderboardPrize 
} from '#/api/gaming/leaderboard-prize';
import { message, Modal as AModal, Form as AForm, FormItem as AFormItem, InputNumber as AInputNumber, Switch as ASwitch, Input as AInput, Button as AButton } from 'ant-design-vue';

// 1. Trạng thái Modal và Form
const isModalVisible = ref(false);
const confirmLoading = ref(false);
const isEditMode = ref(false); // Phân biệt Thêm hay Sửa

const formData = reactive({
  id: 0,
  gameId: 'MYSTERY_BOX',
  rankFrom: 1,
  rankTo: 1,
  rewardType: 'Items',
  rewardId: '',
  quantity: 1,
  isActive: true
});

// 2. Cấu hình bảng dữ liệu
const gridOptions: VxeGridProps = {
  columns: [
    { type: 'seq', width: 50 },
    { title: 'Tên Game', field: 'gameId', minWidth: 150 },
    { title: 'Từ Hạng', field: 'rankFrom', width: 100, align: 'center', slots: { default: 'rank_slot' } },
    { title: 'Đến Hạng', field: 'rankTo', width: 100, align: 'center', slots: { default: 'rank_slot' } },
    { title: 'Loại Quà', field: 'rewardType', width: 100 }, 
    { title: 'Mã Quà', field: 'rewardId', width: 150 },
    { title: 'Số Lượng', field: 'quantity', width: 100, align: 'center' },
    { 
      title: 'Trạng Thái', 
      field: 'isActive', 
      width: 120, 
      align: 'center',
      formatter: ({ cellValue }) => cellValue ? '🟢 Đang chạy' : '🔴 Tắt' 
    },
    { title: 'Thao Tác', width: 150, slots: { default: 'action_slot' }, fixed: 'right' },
  ],
  proxyConfig: {
    ajax: {
      query: async () => {
        const res: any = await getLeaderboardPrizeList();
        const items = res?.data || res || [];
        return {
          items: items,
          total: items.length || 0
        };
      },
    },
  },
};

const [Grid, gridApi] = (useVbenVxeGrid as any)({ gridOptions });

// 3. Xử lý Thêm mới
function handleAdd() {
  isEditMode.value = false;
  formData.id = 0;
  formData.gameId = 'MYSTERY_BOX';
  formData.rankFrom = 1;
  formData.rankTo = 1;
  formData.rewardType = 'Items';
  formData.rewardId = '';
  formData.quantity = 1;
  formData.isActive = true;
  isModalVisible.value = true;
}

// 4. Xử lý Sửa
function handleEdit(row: any) {
  isEditMode.value = true;
  formData.id = row.id;
  formData.gameId = row.gameId;
  formData.rankFrom = row.rankFrom;
  formData.rankTo = row.rankTo;
  formData.rewardType = row.rewardType;
  formData.rewardId = row.rewardId;
  formData.quantity = row.quantity;
  formData.isActive = row.isActive;
  isModalVisible.value = true;
}

// 5. Xử lý Lưu (OK)
async function handleOk() {
  if (formData.rankFrom > formData.rankTo) {
    message.warning('Hạng bắt đầu không được lớn hơn hạng kết thúc!');
    return;
  }

  confirmLoading.value = true;
  try {
    if (isEditMode.value) {
      await updateLeaderboardPrize(formData.id, {
        rankFrom: formData.rankFrom,
        rankTo: formData.rankTo,
        quantity: formData.quantity,
        isActive: formData.isActive
      });
      message.success('Cập nhật thành công');
    } else {
      await addLeaderboardPrize(formData);
      message.success('Thêm giải thưởng mới thành công');
    }
    isModalVisible.value = false;
    gridApi.reload(); 
  } catch (error) {
    message.error('Thao tác thất bại');
  } finally {
    confirmLoading.value = false;
  }
}

// 6. Xử lý Xóa
async function handleDelete(row: any) {
  AModal.confirm({
    title: 'Xác nhận xóa',
    content: `Bạn có chắc muốn xóa phần quà (Rank ${row.rankFrom} - ${row.rankTo}) này không?`,
    onOk: async () => {
      try {
        await deleteLeaderboardPrize(row.id);
        message.success('Đã xóa giải thưởng');
        gridApi.reload();
      } catch (error) {
        message.error('Lỗi khi xóa bản ghi');
      }
    },
  });
}
</script>

<template>
  <Page title="Cấu hình Quà Leaderboard" description="Quản lý phần thưởng đua top theo thứ hạng (Rank)">
    <template #extra>
       <button
        @click="handleAdd"
        class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
         + Thêm Giải Mới
       </button>
    </template>

    <div class="p-4">
      <Grid>
        <template #rank_slot="{ row, column }">
          <span class="font-bold text-orange-500">Top {{ row[column.property] }}</span>
        </template>

        <template #action_slot="{ row }">
          <button @click="handleEdit(row)" class="text-blue-500 hover:underline mr-4">Sửa</button>
          <button @click="handleDelete(row)" class="text-red-500 hover:underline">Xóa</button>
        </template>
      </Grid>
    </div>

    <a-modal
      v-model:visible="isModalVisible"
      :title="isEditMode ? 'Chỉnh sửa giải thưởng' : 'Thêm giải thưởng mới'"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <a-form layout="vertical">
        <template v-if="!isEditMode">
          <a-form-item label="Game ID">
            <a-input v-model:value="formData.gameId" placeholder="Ví dụ: MYSTERY_BOX" />
          </a-form-item>
          <a-form-item label="Mã Quà (Reward ID)">
            <a-input v-model:value="formData.rewardId" placeholder="Nhập ID vật phẩm / mã quà" />
          </a-form-item>
        </template>

        <div class="flex gap-4">
          <a-form-item label="Từ hạng (Rank From)" class="flex-1">
            <a-input-number v-model:value="formData.rankFrom" :min="1" class="w-full" />
          </a-form-item>
          <a-form-item label="Đến hạng (Rank To)" class="flex-1">
            <a-input-number v-model:value="formData.rankTo" :min="1" class="w-full" />
          </a-form-item>
        </div>
        
        <a-form-item label="Số lượng quà">
          <a-input-number v-model:value="formData.quantity" :min="1" class="w-full" />
        </a-form-item>

        <a-form-item label="Trạng thái hoạt động">
          <a-switch v-model:checked="formData.isActive" checked-children="Bật" un-checked-children="Tắt" />
        </a-form-item>
      </a-form>
    </a-modal>
  </Page>
</template>
