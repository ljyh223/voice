<template>
<div class="footer flex" style="align-items: center;opacity: 1;z-index:1000;border-top:1px solid rgba(255,255,255,0.3)">
  <div style="margin-left: 5px;display: inline-block;" class="circle-crop">
    <img :src="mainState.templateImg" />
  </div>
  <div>
    <h1 class="label-text" style="font-weight: 700;font-size: 16px;width: 80px;" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }">{{ mainState.template }}</h1>
    <h4 v-if="mainState.templateCategory!='空'" class="label-text" style="font-weight: 700;font-size: 13px;width: 80px;">{{ mainState.templateCategory }}</h4>
  </div>
  <div class="form-control" style="text-align: center;width: 115px;">
    <div style="margin-left: 5px;">
      <span class="label-text" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }">推理：{{ runtime.delay }} ms</span>
    </div>
    <div class="relative">
      <div style="display: inline-flex" class="tooltip" data-tip="开始转换或停止转换变声">
        <input type="checkbox" v-model="runtime.isStart" @change="switchVC" style="margin-left: 2px;width: 80px;--handleoffset: 3.5rem" class="toggle toggle-accent" checked />
        <span class="toggle-mark"></span>
      </div>
      <div class="absolute top-0 w-full h-full flex" :class="{'justify-start pl-2': runtime.isStart, 'justify-end pr-2': !runtime.isStart}" style="pointer-events: none;padding-top: 5px;">
        <span class="text-xs label-text" style="color:black">{{ mainState.switchText }}</span>
      </div>
    </div>
  </div>
  <div style="display:inline-flex;align-items: center;">
    <div class="form-control tooltip" data-tip="开启可以听到自己变声的声音">
      <label class="cursor-pointer label">
        <input v-model="initState.is_monitor" @click="open_monitor()" type="checkbox" class="checkbox checkbox-info" />
        <span class="label-text" style="margin-left: 10px" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }">监听</span>
      </label>
    </div>
  </div>
  <div style="display: inline-flex;align-items: center;" class="tooltip" data-tip="男变女12左右，女变男-12左右，同性别0左右即可">
    <p class="label-text" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }">音调：</p>
    <div class="tooltip tooltip-bottom w-[200px]" :data-tip="initState.pitch" style="margin-top: 5px;">
      <label><input @input="sendOrder('pitch')" v-model="initState.pitch" step="1" type="range" min="-24" max="24" value="50" class="range range-xs" style="--range-shdw: unset;appearance: auto;" /></label>
    </div>
  </div>
  <div style="display: inline-flex;align-items: center;margin-left: 10px;" class="tooltip" data-tip="延迟越低对电脑配置要求越高，如声音卡顿则需要调高延迟">
    <p class="label-text" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }">延时：</p>
    <div class="tooltip tooltip-bottom w-[200px]" :data-tip="initState.block_time" style="margin-top: 5px;">
      <label><input @input="sendOrder('block_time')" v-model="initState.block_time" step="0.01" type="range" min="0.05" max="2.40" value="50" class="range range-xs" style="--range-shdw: unset;appearance: auto;" /></label>
    </div>
  </div>
  <div style="display: inline-flex;align-items: center;">
    <div style="margin-left: 15px;">
      <button @click="switchChange('vc')" :class="mainState.isChange ? 'btn-info' : 'btn-outline'" class="btn btn-sm" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }" style="border-radius:0px">变声</button>
      <button @click="switchChange('im')" :class="mainState.isChange===false ? 'btn-info' : 'btn-outline'" class="btn btn-sm" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }" style="border-radius:0px">原声</button>
    </div>
    <div @click="setMenuActive('设置中心')" style="margin-left: 20px;cursor: pointer;">
      <svg t="1702460712503" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27554" width="40" height="40"><path d="M934.4 416l-70.4 0c-6.4-12.8-6.4-25.6-12.8-38.4l-6.4-6.4c-6.4-12.8-12.8-25.6-19.2-38.4l51.2-51.2c6.4-6.4 6.4-12.8 6.4-19.2 0-6.4 0-12.8-6.4-19.2l-102.4-102.4c-12.8-12.8-25.6-12.8-38.4 0L691.2 192c-12.8-6.4-25.6-12.8-38.4-19.2l-6.4-6.4C633.6 166.4 620.8 160 608 160L608 89.6C608 76.8 595.2 64 582.4 64L441.6 64C428.8 64 416 76.8 416 89.6l0 70.4C403.2 160 390.4 166.4 377.6 172.8L364.8 172.8C352 179.2 339.2 185.6 332.8 192L281.6 147.2C275.2 134.4 256 134.4 243.2 147.2L147.2 243.2C140.8 249.6 134.4 256 134.4 262.4c0 6.4 0 12.8 6.4 19.2L192 332.8C185.6 339.2 179.2 352 172.8 371.2L172.8 377.6C166.4 390.4 160 403.2 160 416L89.6 416C76.8 416 64 428.8 64 441.6l0 140.8c0 12.8 12.8 25.6 25.6 25.6l70.4 0c6.4 12.8 6.4 25.6 12.8 38.4l6.4 6.4c6.4 12.8 12.8 25.6 19.2 38.4l-51.2 51.2c-12.8 12.8-12.8 25.6 0 38.4l102.4 102.4c12.8 12.8 25.6 12.8 38.4 0L332.8 832c12.8 6.4 25.6 12.8 38.4 19.2l6.4 6.4 0 0c12.8 6.4 25.6 6.4 38.4 12.8l0 70.4c0 12.8 12.8 25.6 25.6 25.6l140.8 0c12.8 0 25.6-12.8 25.6-25.6l0-70.4c12.8-6.4 70.4-25.6 83.2-32l51.2 51.2c12.8 12.8 25.6 12.8 38.4 0l102.4-102.4c12.8-12.8 12.8-25.6 0-38.4L832 691.2c6.4-12.8 32-70.4 32-83.2l70.4 0c12.8 0 25.6-12.8 25.6-25.6L960 441.6C960 428.8 947.2 416 934.4 416zM921.6 576l-89.6 0 0 12.8c-6.4 12.8-32 83.2-38.4 96l-6.4 12.8 64 64-89.6 89.6-64-64-12.8 6.4C672 800 601.6 832 588.8 832l-12.8 0 0 89.6L448 921.6l0-89.6-12.8 0c-12.8-6.4-83.2-32-96-38.4l-12.8-6.4-64 64-89.6-89.6 64-64-6.4-12.8C224 672 192 601.6 192 588.8l0-12.8L102.4 576 102.4 448l89.6 0 0-12.8C192 422.4 224 352 230.4 339.2l6.4-12.8-64-64 89.6-89.6 64 64 12.8-6.4C352 224 422.4 192 435.2 192l12.8 0L448 102.4l128 0 0 89.6 12.8 0c12.8 6.4 83.2 32 96 38.4l12.8 6.4 64-64 89.6 89.6-64 64 6.4 12.8C800 352 832 422.4 832 435.2l0 12.8 89.6 0L921.6 576z" fill="#8a8a8a" p-id="27555"></path></svg>
    </div>
  </div>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { mainState, initState, runtime, switchVC, switchChange, open_monitor, sendOrder, setMenuActive } = useAppState();
</script>
