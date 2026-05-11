<template>
<input type="checkbox" id="modal" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box" style="background-color: rgb(135, 163, 193);">
    <h3 class="text-lg font-bold">{{ mainState.modelTitle }}</h3>
    <p class="py-4">{{ mainState.model }}</p>
  </div>
  <label class="modal-backdrop" for="modal">Close</label>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { mainState } = useAppState();
</script>
