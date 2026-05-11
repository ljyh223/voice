<template>
<div>
  <div class="flex w-[570px]" style="justify-content: center; align-items: center;overflow: hidden; margin: 15px 232px 10px;border-radius: 30px;background-color:rgba(255,255,255,0.3);">
    <div role="tablist" class="tabs tabs-boxed">
      <a @click="setCloudMenuActive('少女')" role="tab" :class="{'tab-active': cloudMenuState['少女']}" class="tab">少女音色</a>
      <a @click="setCloudMenuActive('御姐')" role="tab" :class="{'tab-active': cloudMenuState['御姐']}" class="tab">御姐音色</a>
      <a @click="setCloudMenuActive('萝莉')" role="tab" :class="{'tab-active': cloudMenuState['萝莉']}" class="tab">萝莉音色</a>
      <a @click="setCloudMenuActive('男声')" role="tab" :class="{'tab-active': cloudMenuState['男声']}" class="tab">男声音色</a>
      <a @click="setCloudMenuActive('热门')" role="tab" :class="{'tab-active': cloudMenuState['热门']}" class="tab">热门音色</a>
    </div>
  </div>
  <div class="h-[550px] overflow-y-scroll" style="margin-top: 20px;margin-left: 28px;">
    <div class="grid-cloud_container">
      <div @click="useCloudModel(model)"
        v-show="cloudMenuState[model.category] && model.state !== cloudState"
        v-for="(model, index) in initState.templates" :key="index"
        class="cursor-pointer grid-cloud card w-[130px]"
        :class="{ 'charged': model.is_charge === '是', 'free': model.is_charge === '否' }"
        @mouseenter="animateIn($event)" @mouseleave="animateOut($event)">
        <figure>
          <img :src="model.image_url" alt="Shoes" />
        </figure>
        <div style="margin-top:2px;margin-bottom:2px">
          <h2 class="card-title" style="font-size: 15px;">{{ model.showName }}</h2>
        </div>
        <div :class="{ 'bg-black': cloudState }" class="absolute inset-0 opacity-0"></div>
        <svg style="transform: scale(0); top: 50%; left: 50%; translate: -50% -50%;" t="1702709829394" :class="{ 'fa-download': cloudState }" class="icon absolute" viewBox="0 0 1026 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2388" width="40" height="40"><path d="M787.2 711.04a32 32 0 0 1-32-32 32 32 0 0 1 32-32 156.8 156.8 0 0 0 136.32-80.64A200.96 200.96 0 0 0 960 448a198.4 198.4 0 0 0-198.4-198.4 35.2 35.2 0 0 1-30.72-15.36 256 256 0 0 0-460.16 49.92 32.64 32.64 0 0 1-31.36 21.76h-7.68a170.88 170.88 0 0 0 0 341.76h28.8a32 32 0 0 1 32 32 32 32 0 0 1-32 32h-25.6a234.88 234.88 0 0 1-13.44-469.12 320 320 0 0 1 556.8-55.04A263.04 263.04 0 0 1 1024 448a256 256 0 0 1-49.28 152.32 218.88 218.88 0 0 1-187.52 110.72z" fill="#e6e6e6" p-id="2389"></path><path d="M512 948.48a32.64 32.64 0 0 1-32-32V576a32 32 0 0 1 32-32 32 32 0 0 1 32 32v340.48a32 32 0 0 1-32 32z" fill="#e6e6e6" p-id="2390"></path><path d="M512 960a32 32 0 0 1-22.4-9.6l-140.8-141.44a32 32 0 1 1 44.8-46.08l142.08 139.52A32 32 0 0 1 512 960z" fill="#e6e6e6" p-id="2391"></path><path d="M512 960a32.64 32.64 0 0 1-23.04-9.6 32.64 32.64 0 0 1 0-45.44l144.64-142.08a31.36 31.36 0 0 1 44.8 0 32 32 0 0 1 0 45.44l-142.72 139.52A31.36 31.36 0 0 1 512 960z" fill="#e6e6e6" p-id="2392"></path></svg>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { initState, cloudMenuState, cloudState, setCloudMenuActive, useCloudModel, animateIn, animateOut } = useAppState();
</script>
