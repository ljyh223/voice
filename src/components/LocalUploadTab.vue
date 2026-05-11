<template>
<div>
  <div style="margin:15px 0px 15px 900px">
    <button @click="addLocalModel" class="btn btn-lg btn-accent w-[123px]">添加模版</button>
  </div>
  <div class="overflow-y-scroll h-[570px]">
    <div class="grid-local_container">
      <div v-for="(model, index) in initState.local_model" :key="index">
        <div class="card card-side" style="width: 390px;height: 120px;justify-content: center; align-items: center;margin-left: 20px;margin-bottom: 30px;background-color: rgba(255,255,255,0.3);">
          <figure>
            <div v-if="mainState.iconImageUrl">
              <img :src="mainState.iconImageUrl" style="width: 90px;height: 90px;border-radius: 50%; margin-left:20px" />
            </div>
            <div v-else>
              <img :src="mainState.templateImg" style="width: 90px;height: 90px;border-radius: 50%; margin-left:20px" />
            </div>
          </figure>
          <div class="card-body" style="cursor: pointer;overflow: hidden;text-overflow: ellipsis;padding-right: 20px" :title="model">
            <h4 class="card-title" style="font-size: 15px;">{{ model }}</h4>
          </div>
          <div class="flex card-actions justify-end h-[100px]" style="flex-direction: column;padding-bottom: 8px;padding-left: 20px;padding-right:20px">
            <button @click="useLocalModel(model)" class="btn btn-info btn-sm" style="margin-bottom: 10px">使用</button>
            <button @click="delLocalModel(model)" class="btn btn-error btn-sm">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { mainState, initState, addLocalModel, useLocalModel, delLocalModel } = useAppState();
</script>
