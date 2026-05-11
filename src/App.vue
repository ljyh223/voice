<template>
<div class="my-custom-element app">
  <div class="background" :style="{ color: mainState.fontColor === 'white' ? 'white' : 'black' }">
    <!-- Modals -->
    <NotifyModal />
    <LoginModal />
    <VerifyModal />

    <!-- Loading overlay -->
    <div v-if="mainState.isLoading" class="loading-overlay flex" style="justify-content: center; align-items: center;">
      <span v-if="!mainState.isUpadate" class="loading loading-spinner loading-lg"></span>
      <div v-if="!mainState.loadingCompleted && mainState.isUpadate" class="radial-progress" :style="{ '--value': `${mainState.percent}` }" role="progressbar">{{ mainState.percent }}%</div>
      <div v-if="!mainState.loadingCompleted" style="margin-left:20px;font-size: 50px;">{{ mainState.message }}</div>
    </div>

    <!-- Main content -->
    <div v-show="mainState.loadingCompleted" style="width: 100%; height: 730px; display: flex;">
      <!-- Sidebar -->
      <div style="width: 17%;scroll-behavior: smooth; scroll-padding-top: 5rem;height: 730px;overflow-y: hidden;background-color: rgba(255,255,255,0); border-right: 1px solid rgba(255,255,255,0.3);">
        <label for="drawer" class="drawer-overlay" aria-label="Close menu"></label>
        <Sidebar />
      </div>

      <!-- Content area -->
      <div class="flex drawer lg:drawer-open" style="height: 730px;flex-direction: column;width: 83%;">
        <input id="drawer" type="checkbox" class="drawer-toggle">

        <div class="drawer-content draggable">
          <div v-show="mainState.loadingCompleted" style="display: block; width: 100% !important;">
            <TopBar />
          </div>
        </div>

        <div style="flex: 0 0 100%">
          <div v-show="menuState['语音模型']">
            <VoiceModelTab />
          </div>
          <div v-show="menuState['本地上传']">
            <LocalUploadTab />
          </div>
          <div v-show="menuState['设置中心']">
            <SettingsTab />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-show="mainState.loadingCompleted" style="display: block;">
      <Footer />
    </div>
  </div>
</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppState } from './composables/useAppState.js';

import NotifyModal from './components/NotifyModal.vue';
import LoginModal from './components/LoginModal.vue';
import VerifyModal from './components/VerifyModal.vue';
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
import VoiceModelTab from './components/VoiceModelTab.vue';
import LocalUploadTab from './components/LocalUploadTab.vue';
import SettingsTab from './components/SettingsTab.vue';
import Footer from './components/Footer.vue';

const { mainState, menuState, setTheme, initData, connect_ws, heartbeat, animateAnnouncement } = useAppState();

setTheme("light");

mainState.isLoading = false;
mainState.loadingCompleted = true;

onMounted(async () => {
  connect_ws();
  heartbeat();
  initData().then(() => {
    animateAnnouncement();
    mainState.isLoading = false;
  });
});
</script>
