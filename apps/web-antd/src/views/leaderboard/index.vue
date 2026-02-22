<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { getLeaderboardList } from '#/api/gaming/leaderboard';
import { message, Tag } from 'ant-design-vue';

// 1. Bộ lọc tìm kiếm
const searchForm = reactive({
  gameId: 'MYSTERY_BOX', 
  seasonId: 1,           
});

// 2. Cấu hình bảng
const gridOptions: VxeGridProps = {
  columns: [
    { 
      title: 'Hạng', 
      field: 'rank', 
      width: 80, 
      align: 'center',
      slots: { default: 'rank_slot' } 
    },
    // Cột User: Hiển thị Tên thật và SĐT
    { 
      title: 'Người chơi', 
      field: 'fullName', 
      minWidth: 200,
      slots: { default: 'user_slot' }
    },
    { title: 'User ID (SĐT)', field: 'userId', width: 150 },
    
    // Cột Điểm: Format số cho dễ nhìn (ví dụ: 1,000)
    { 
      title: 'Điểm Số', 
      field: 'score', 
      width: 150, 
      sortable: true,
      formatter: ({ cellValue }) => cellValue ? Number(cellValue).toLocaleString() : '0'
    },
    { title: 'Game ID', field: 'gameId', width: 150 },
    { title: 'Mùa giải', field: 'seasonId', width: 100, align: 'center' },
  ],
  
  // 3. Kết nối API 
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        try {
          const res = await getLeaderboardList({
            page: page.currentPage,
            pageSize: page.pageSize,
            gameId: searchForm.gameId,
            seasonId: searchForm.seasonId
          });

          return {
            items: res.items || [],
            total: res.total || 0
          };
        } catch (error) {
          return { items: [], total: 0 };
        }
      },
    },
  },
  toolbarConfig: {
    refresh: true, 
  }
};

const [Grid, gridApi] = (useVbenVxeGrid as any)({ gridOptions });

// Hàm xử lý khi nhấn nút "Tìm kiếm"
function handleSearch() {
  gridApi.reload(); // Gọi lại API với tham số mới
  message.success(`Đang tải dữ liệu mùa ${searchForm.seasonId}`);
}
</script>

<template>
  <Page title="Bảng Xếp Hạng Real-time" description="Dữ liệu được đồng bộ trực tiếp từ Redis">
    
    <template #extra>
      <div class="flex gap-2 items-center">
        <a-input 
          v-model:value="searchForm.gameId" 
          placeholder="Game ID (VD: MYSTERY_BOX)" 
          style="width: 200px" 
        />
        <a-input-number 
          v-model:value="searchForm.seasonId" 
          placeholder="Mùa giải" 
          :min="1" 
          style="width: 100px" 
        />
        <a-button type="primary" @click="handleSearch">
          🔍 Tìm kiếm
        </a-button>
      </div>
    </template>

    <div class="p-4">
      <Grid>
        <template #rank_slot="{ row }">
          <div v-if="row.rank === 1">🥇 <b class="text-yellow-500">1</b></div>
          <div v-else-if="row.rank === 2">🥈 <b class="text-gray-400">2</b></div>
          <div v-else-if="row.rank === 3">🥉 <b class="text-orange-500">3</b></div>
          <div v-else class="font-bold text-gray-600">{{ row.rank }}</div>
        </template>

        <template #user_slot="{ row }">
          <div class="flex flex-col">
            <span class="font-bold text-blue-600">{{ row.fullName }}</span>
            <span v-if="row.fullName === 'Chưa cập nhật tên'" class="text-xs text-gray-400 italic">
              (Chưa định danh)
            </span>
          </div>
        </template>
      </Grid>
    </div>
  </Page>
</template>
