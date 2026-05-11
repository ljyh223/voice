<template>
<div class="navbar" style="padding:0px; width: 100% !important;">
  <div class="navbar-start" style="position: relative;left: -20px;height: 63px;width: 500px;background-color:rgba(255,255,255,0); display: flex; flex-direction: row; align-items: center;">
    <img src="/images/logo.png" style="width: 50px;margin-top:15px; margin-left: 30px;">
    <a class="btn btn-ghost text-xl" style="margin-left: 10px; margin-top: 15px;">{{ initState.appName }}</a>
  </div>
  <div class="navbar-center" style="overflow: hidden;opacity: 1;border-radius: 12px;position: relative;left: -110px;background-color: rgba(255,255,255,0.3); margin-left: 100px; margin-top: 15px;">
    <svg t="1702484115748" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3797" width="25" height="25"><path d="M592.384 111.889067L288.2048 324.266667H170.666667a68.266667 68.266667 0 0 0-68.266667 68.266666v238.933334a68.266667 68.266667 0 0 0 68.266667 68.266666h117.538133L592.384 912.110933a68.266667 68.266667 0 0 0 107.349333-55.978666V167.867733a68.266667 68.266667 0 0 0-107.349333-55.978666zM327.287467 380.245333L631.466667 167.867733v688.264534L327.287467 643.754667a68.266667 68.266667 0 0 0-39.082667-12.288H170.666667V392.533333h117.538133a68.266667 68.266667 0 0 0 39.082667-12.288z" fill="#2c2c2c" p-id="3798" class="selected"></path><path d="M895.249067 290.133333c35.84 61.474133 55.842133 141.277867 55.842133 225.6896 0 77.533867-16.878933 151.210667-47.4624 210.432l-3.754667 7.031467-59.904-32.7168c27.2896-49.988267 42.837333-115.2 42.837334-184.746667 0-69.802667-15.701333-135.2192-43.0592-185.156266l-3.4816-6.144L895.249067 290.133333z" fill="#1296db" p-id="3799" class=""></path></svg>
    <div class="w-[400px] flex flex-col text-white" style="-webkit-app-region: no-drag;">
      <div class="announcement-container h-[20px] w-full flex items-center overflow-hidden relative">
        <div v-for="(announcement, index) in initState.announcement" :key="index" class="announcement whitespace-nowrap absolute left-full">
          <p @click="openLink(announcement.jump_link)" class="link" style="text-decoration-line: blink;">杜绝一切违法行为，任何违法违禁行为均有使用者本人承担法律责任! 如有盗版侵权将追究法律责任！</p>
        </div>
      </div>
    </div>
  </div>
  <div class="navbar-end" style="margin-top: 10px;">
    <div @click="closeWindow" class="flex cursor-pointer gap-2" style="margin-bottom: 10px;margin-left: 30px;margin-right: 20px;-webkit-app-region: no-drag">
      <svg t="1703556266421" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1461" width="25" height="25"><path d="M511.333 127.333c51.868 0 102.15 10.144 149.451 30.15 45.719 19.337 86.792 47.034 122.078 82.321 35.287 35.286 62.983 76.359 82.321 122.078 20.006 47.3 30.15 97.583 30.15 149.451s-10.144 102.15-30.15 149.451c-19.337 45.719-47.034 86.792-82.321 122.078-35.286 35.287-76.359 62.983-122.078 82.321-47.3 20.006-97.583 30.15-149.451 30.15s-102.15-10.144-149.451-30.15c-45.719-19.337-86.792-47.034-122.078-82.321-35.287-35.286-62.983-76.359-82.321-122.078-20.006-47.3-30.15-97.583-30.15-149.451s10.144-102.15 30.15-149.451c19.337-45.719 47.034-86.792 82.321-122.078 35.286-35.287 76.359-62.983 122.078-82.321 47.301-20.006 97.583-30.15 149.451-30.15m0-64c-247.424 0-448 200.576-448 448s200.576 448 448 448 448-200.576 448-448-200.576-448-448-448z" fill="#d81e06" p-id="1462"></path><path d="M557.254 512l147.373-147.373c12.497-12.497 12.497-32.758 0-45.255-12.496-12.497-32.758-12.497-45.254 0L512 466.746 364.627 319.373c-12.497-12.497-32.758-12.497-45.255 0s-12.497 32.758 0 45.255L466.746 512 319.373 659.373c-12.497 12.496-12.497 32.758 0 45.254C325.621 710.876 333.811 714 342 714s16.379-3.124 22.627-9.373L512 557.254l147.373 147.373C665.621 710.876 673.811 714 682 714s16.379-3.124 22.627-9.373c12.497-12.496 12.497-32.758 0-45.254L557.254 512z" fill="#d81e06" p-id="1463"></path></svg>
    </div>
  </div>
</div>
</template>

<script setup>
import { useAppState } from '../composables/useAppState.js';
const { initState, closeWindow, openLink } = useAppState();
</script>
