<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { Card } from 'ant-design-vue';
</script>

<template>
  <Page title="Homepage">
    <div class="p-4">
      <Card 
        title="Welcome" 
        :bordered="false" 
        class="shadow-sm rounded-lg"
        :headStyle="{ borderBottom: '1px solid #f0f0f0', fontSize: '16px', fontWeight: 600 }"
      >
        <p class="text-[14px] text-gray-600 m-0">
          Welcome to the Gaming CMS Dashboard.
        </p>
      </Card>
    </div>
  </Page>
</template>

<style scoped>
:deep(.ant-card) {
  border-radius: 8px;
}
</style>
