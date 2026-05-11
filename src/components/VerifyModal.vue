<template>
<input type="checkbox" id="my_modal" v-model="openCheck" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold">输入验证</h3>
    <input v-model="inputValue" type="text" class="input input-bordered input-sm w-full mb-4" />
    <div class="modal-action">
      <label for="my_modal" class="btn">取消</label>
      <label @click="handleConfirm" class="btn btn-accent">确认</label>
    </div>
  </div>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { openCheck, inputValue, handleConfirm } = useAppState();
</script>
