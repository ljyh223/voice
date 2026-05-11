<template>
<div>
  <div style="margin: 15px 10px 10px 15px;height: 18rem;border-radius: 10px; border: 1px solid rgba(255,255,255,0.3);">
    <div class="flex">
      <div style="padding-top: 10px;padding-left: 10px"><span>音频设备</span></div>
      <div style="margin-left: 800px;margin-top: 10px">
        <button @click="refreshList" class="btn btn-sm btn-primary" :disabled="runtime.isStart">刷新设备列表</button>
      </div>
    </div>
    <div class="flex" style="padding-left: 50px;padding-top: 35px">
      <div style="width: 400px">
        <label>输入：
          <select class="select select-success w-full max-w-xs" style="color:black" v-model="initState.sg_input_device" :disabled="runtime.isStart">
            <option disabled selected>请选择输入设备</option>
            <option v-for="(device, index) in initState.input_devices" :key="index" :value="device">{{ device }}</option>
          </select>
        </label>
      </div>
      <div style="width: 400px;margin-left: 48px">
        <label>输出：
          <select class="select select-success w-full max-w-xs" style="color:black" v-model="initState.sg_output_device" :disabled="runtime.isStart">
            <option disabled selected>请选择输出设备</option>
            <option v-for="(device, index) in initState.output_devices" :key="index" :value="device">{{ device }}</option>
          </select>
        </label>
      </div>
    </div>
    <div style="display: flex;">
      <div style="width: 400px;margin-left: 50px;margin-top: 35px;">
        <label>监听：
          <select class="select select-success w-full max-w-xs" style="color:black" v-model="initState.sg_monitor_device" :disabled="runtime.isStart">
            <option disabled selected>请选择监听设备</option>
            <option v-for="(device, index) in initState.monitor_devices" :key="index" :value="device">{{ device }}</option>
          </select>
        </label>
      </div>
    </div>
  </div>

  <div style="margin: 15px 10px 10px 15px;height: 120px;border-radius: 10px;border: 1px solid rgba(255,255,255,0.3);">
    <div style="padding-top: 10px;padding-left: 10px"><span>其它设置</span></div>
    <div style="margin-left: 55px;margin-top: 20px">
      <div class="tooltip" data-tip="打开电脑音频设置">
        <button @click="openSettings" class="btn btn-success" style="margin-right:40px">打开声音设置</button>
      </div>
      <div class="tooltip" data-tip="安装虚拟声卡驱动，安装后点击刷新设备列表就能看到">
        <button @click="installDriver" class="btn btn-error" style="margin-right:40px">安装虚拟声卡</button>
      </div>
      <div style="display: inline-flex;align-items: center;">
        <div class="tooltip" data-tip="越低收音范围越广，越高收音范围越低，噪音大可适当调高" style="display: flex;">
          <p>收音范围:</p>
          <div class="tooltip tooltip-bottom w-[200px]" :data-tip="initState.threhold" style="margin-left: 10px;margin-top: 3px;margin-right: 40px;">
            <label><input @input="sendOrder('threhold')" v-model="initState.threhold" step="1" type="range" min="-60" max="0" value="-60" class="range range-xs h-[14px] range-info" /></label>
          </div>
        </div>
        <div class="tooltip" data-tip="控制自己说话声音大小" style="display: flex;">
          <p class="label-text">音量大小:</p>
          <div class="tooltip tooltip-bottom w-[200px]" :data-tip="initState.rms_mix_rate" style="margin-left: 10px;margin-top: 3px;">
            <label><input @input="sendOrder('rms_mix_rate')" v-model="initState.rms_mix_rate" step="0.01" type="range" min="0.0" max="1.00" value="50" class="range range-xs h-[14px] range-primary" /></label>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div style="margin: 15px 10px 10px 15px;border-radius: 10px;border: 1px solid rgba(255,255,255,0.3);">
    <div style="padding-top: 10px;padding-left: 10px"><span>降噪设置</span></div>
    <div class="h-[50px] flex w-[443px]" style="border-radius: 10px;align-items: center;margin-left: 50px;margin-top: 5px">
      <div class="form-control">
        <label class="cursor-pointer label">
          <input @click="sendOrder('inputDenoise')" v-model="initState.I_noise_reduce" type="checkbox" class="checkbox checkbox-success" />
          <span class="label-text" style="margin-left: 10px">输入降噪</span>
        </label>
      </div>
      <div class="form-control" style="margin-left: 80px">
        <label class="cursor-pointer label">
          <input @click="sendOrder('outputDenoise')" v-model="initState.O_noise_reduce" type="checkbox" class="checkbox checkbox-success" />
          <span class="label-text" style="margin-left: 10px">输出降噪</span>
        </label>
      </div>
    </div>
  </div>

  <div style="margin: 15px 10px 10px 15px;height: 90px;border-radius: 10px;border: 1px solid rgba(255,255,255,0.3);">
    <div style="padding-top: 10px;padding-left: 10px"><span>关闭设置</span></div>
    <div class="h-[50px] flex w-[443px]" style="border-radius: 10px;justify-content: center; align-items: center;margin-left: 42px;margin-top: 5px">
      <div class="form-control">
        <label class="label cursor-pointer">
          <input @click="closeSetting(true)" type="radio" name="closeSetting" class="radio checked:bg-blue-500" checked />
          <span class="label-text" style="margin-left: 10px">关闭时最小化到托盘</span>
        </label>
      </div>
      <div class="form-control" style="margin-left: 80px">
        <label class="label cursor-pointer">
          <input @click="closeSetting(false)" type="radio" name="closeSetting" class="radio checked:bg-red-500" />
          <span class="label-text" style="margin-left: 10px;margin-right: 15px">关闭时直接退出程序</span>
        </label>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { initState, runtime, refreshList, openSettings, installDriver, sendOrder, closeSetting } = useAppState();
</script>
