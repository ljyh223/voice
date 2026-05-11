import { reactive, ref, onMounted } from 'vue';
import gsap from 'gsap';
import Http from '../services/http.js';

const { ipcRenderer, shell } = window.electronAPI;

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

const initTemplateImg =
  "https://www.qqkw.com/d/file/p/2022/03-15/46ec26f131b0452780eb5d31290acce3.jpg";

// ── Shared reactive state ──────────────────────────────────────────

const mainState = reactive({
  isLoading: true,
  modelTitle: "",
  model: "",
  checkboxValue: false,
  vipType: "月",
  vipImgBase64: "",
  paymentCheckObj: {},
  template: "空",
  templateCategory: "空",
  templateImg: initTemplateImg,
  templateType: "",
  downloadLink: "w",
  isPayment: false,
  loadingCompleted: false,
  isDragging: false,
  startMouseX: 0,
  startMouseY: 0,
  message: "正在初始化，请稍候...",
  isUpadate: false,
  percent: "",
  cdkey: "",
  switchText: "开始变声",
  isChange: true,
  loginQrCode: "",
  loginIntervalId: 0,
  qqNum: 0,
  nickname: "",
  iconImageUrl: "",
  loginTimeout: false,
  loginStateIntervalId: 0,
  nowTab: "云端模版",
  fontColor: "white",
  closeState: true,
  loginType: "wx",
  loginStateMsg: false,
});

const openCheck = ref(false);
const inputValue = ref("");
const templatePath = ref("");
const isVerify = ref(false);

const menuState = reactive({
  语音模型: true,
  本地上传: false,
  设置中心: false,
});

const cloudMenuState = reactive({
  少女: true,
  御姐: false,
  萝莉: false,
  男声: false,
  热门: false,
});

const cloudState = ref(false);

const initState = reactive({
  sg_input_device: "",
  sg_output_device: "",
  input_devices: [],
  output_devices: [],
  pitch: 0,
  threhold: 0,
  rms_mix_rate: 0,
  f0method: "",
  block_time: 0.0,
  I_noise_reduce: false,
  O_noise_reduce: false,
  expiration_date: null,
  is_expired: false,
  carousel: [],
  announcement: [{ jump_link: "", content: "" }],
  templates: [],
  os_name: "",
  setting: {},
  cloud_model: [],
  local_model: [],
  monthly_price: 0,
  quarterly_price: 0,
  annual_price: 0,
  recentlyUsed: [],
  recommendList: [],
  freeList: [],
  lastList: [],
  logo: "",
  appName: "",
  tutorialLink: "",
  algorithmMode: "",
  sg_wasapi_exclusive: false,
  is_monitor: false,
  sg_monitor_device: "",
  monitor_devices: [],
  content: "",
});

const runtime = reactive({
  isStart: false,
  delay: 0,
});

let ws = null;

// ── Modal helper ────────────────────────────────────────────────────

const openModel = (modeTitle, model) => {
  mainState.modelTitle = modeTitle;
  mainState.model = model;
  document.getElementById("modal").click();
};

// ── Navigation ──────────────────────────────────────────────────────

const setMenuActive = (tab) => {
  mainState.nowTab = tab;
  for (const key in menuState) menuState[key] = key === tab;
};

const setCloudMenuActive = (tab) => {
  for (const key in cloudMenuState) cloudMenuState[key] = key === tab;
};

// ── WebSocket ───────────────────────────────────────────────────────

const connect_ws = () => {
  try {
    ws = new WebSocket(`ws://${Http.baseUrl}/ws`);
    let attempts = 1;

    ws.onopen = () => console.log("连接至ws...");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if ("inferTime" in data) {
        const t = data["inferTime"];
        if (!isNaN(t)) runtime.delay = parseInt(t);
      } else if ("percent" in data) {
        mainState.percent = data["percent"];
      } else if ("login" in data) {
        mainState.isLoading = false;
        mainState.loginQrCode = data["login"];
        if (mainState.loginIntervalId != 0) clearInterval(mainState.loginIntervalId);
        mainState.loginIntervalId = createIntervalForLogin();
        document.getElementById("login").showModal();
        mainState.loginTimeout = false;
      } else if ("loginRes" in data) {
        const res = data["loginRes"];
        if (res === null) {
          mainState.loginTimeout = true;
          clearInterval(mainState.loginIntervalId);
          mainState.loginIntervalId = 0;
        } else {
          mainState.qqNum = res["qqNum"];
          mainState.nickname = res["nickname"];
          mainState.iconImageUrl = res["iconImageUrl"];
          Object.assign(initState, res);
          clearInterval(mainState.loginIntervalId);
          mainState.loginStateIntervalId = createIntervalForLoginState();
          mainState.loginIntervalId = 0;
          mainState.loginStateMsg = true;
          document.getElementById("login").close();
          openModel("成功", "登录成功！");
        }
      } else if ("loginState" in data) {
        if (data["loginState"]["status"] === false) exit();
      } else if ("update" in data) {
        mainState.isLoading = false;
        openModel("成功", "更新成功，即将重启程序！");
        setTimeout(() => {
          mainState.message = "";
          ipcRenderer.send("update");
        }, 2000);
      } else if ("name" in data) {
        const name = data["name"];
        const model = initState.templates.filter((r) => r.name === name)[0];
        initState.cloud_model.push(`${model.name}.pth`);
        initState.templates.forEach((t) => { if (t.name === model.name) t.state = true; });
        mainState.isLoading = false;
        useCloudModel(model);
      } else if ("qrCodeBase64" in data) {
        mainState.vipImgBase64 = data["qrCodeBase64"];
        mainState.isPayment = true;
        mainState.paymentCheckObj[data["outTradeNo"]] = createIntervalForOrder(data["outTradeNo"]);
      } else if ("expirationDate" in data) {
        mainState.isPayment = false;
        initState.expiration_date = data["expirationDate"];
        initState.is_expired = true;
        clearInterval(mainState.paymentCheckObj[data["outTradeNo"]]);
        delete mainState.paymentCheckObj[data["outTradeNo"]];
        setTimeout(() => openModel("成功", "充值成功！"), 2000);
      } else if ("recentlyUsed" in data) {
        initState.recentlyUsed = initState.templates.filter((m) => data["recentlyUsed"].includes(m.name));
      } else if ("cdkey" in data) {
        const res = data["cdkey"];
        if (res === false) setTimeout(() => openModel("失败", "今日已经绑定过，请明日再试！"), 2000);
        else if (res === null) setTimeout(() => openModel("失败", "cdkey不存在！"), 2000);
        else {
          if (res.is_expired === true) { initState.expiration_date = res.expirationDate; initState.is_expired = true; }
          setTimeout(() => openModel("成功", "绑定成功！"), 2000);
        }
        mainState.isLoading = false;
      } else if ("verify" in data) {
        let msg = ""; let isSuccess = false;
        if (data.verify.code == 0) { openCheck.value = false; isVerify.value = true; isSuccess = true; msg = "验证成功"; }
        else if (data.verify.code == 1) msg = "卡密错误";
        else if (data.verify.code == 2) msg = "请联系管理员启用API接口";
        else if (data.verify.code == 3) msg = "系统错误";
        else if (data.verify.code == 4) msg = "API密钥无效";
        else if (data.verify.code == 5) msg = "卡密已被禁用";
        else if (data.verify.code == 6 || data.verify.code == 7) msg = "不允许重复验证";
        else msg = "未知错误";
        openCheck.value = false;
        setTimeout(() => openModel(isSuccess ? "成功" : "失败", msg), 1000);
      }
    };

    ws.onclose = () => {
      console.log("连接断开，尝试重新连接...");
      setTimeout(() => {
        if (attempts <= 3000) { connect_ws(); attempts++; }
        else console.log("连接失败。");
      }, Math.min(10000, 1000 * attempts));
    };
  } catch (error) {
    console.log("webSocket", error);
  }
};

// ── Send order via WebSocket ────────────────────────────────────────

const sendOrder = (order, param = null, notOff = false) => {
  let reqData = null;
  mainState.isLoading = true;
  switch (order) {
    case "startVC":
      if (mainState.template === "空") { openModel("警告", "请选择模板！"); runtime.isStart = false; }
      else if (initState.sg_input_device === "" || initState.sg_output_device === "") { openModel("警告", "请在设置中心选择正确的输入输出设备！"); runtime.isStart = false; }
      else if (runtime.isStart) {
        mainState.switchText = "停止变声";
        reqData = { tag: "startVC", values: { sg_input_device: initState.sg_input_device, sg_output_device: initState.sg_output_device, sg_monitor_device: initState.sg_monitor_device, f0method: initState.f0method, crossfade_time: 0.15, extra_time: 1.5, use_pv: true, sr_type: "sr_device", sg_wasapi_exclusive: initState.sg_wasapi_exclusive } };
      }
      break;
    case "stopVC":
      if (!runtime.isStart) { mainState.switchText = "开始变声"; reqData = { tag: "stopVC" }; }
      break;
    case "exit": reqData = { tag: "exit" }; break;
    case "inputDenoise": reqData = { tag: "I_noise_reduce", value: !initState.I_noise_reduce }; break;
    case "outputDenoise": reqData = { tag: "O_noise_reduce", value: !initState.O_noise_reduce }; break;
    case "pitch": reqData = { tag: "pitch", value: parseInt(initState.pitch) }; break;
    case "threhold": reqData = { tag: "threhold", value: parseInt(initState.threhold) }; break;
    case "rms_mix_rate": reqData = { tag: "rms_mix_rate", value: parseFloat(initState.rms_mix_rate) }; break;
    case "block_time": reqData = { tag: "block_time", value: parseFloat(initState.block_time) }; break;
    case "useModel": reqData = { tag: "useModel", values: { templateType: mainState.templateType, template: mainState.template } }; break;
    case "addModel": reqData = { tag: "addModel", value: templatePath.value }; break;
    case "delModel": reqData = { tag: "delModel", values: { templateType: mainState.templateType, template: mainState.template } }; openModel("成功", "模型删除成功！"); break;
    case "downloadModel": reqData = { tag: "downloadModel", values: { downloadLink: param.download_link, name: param.name } }; break;
    case "payment": reqData = { tag: "payment", value: mainState.vipType }; break;
    case "checkPayment": reqData = { tag: "checkPayment", values: { outTradeNo: param } }; break;
    case "cdkey": reqData = { tag: "cdkey", value: mainState.cdkey }; break;
    case "hostapi": reqData = { tag: "hostapi", value: param }; break;
    case "switchChange": reqData = { tag: param }; break;
    case "monitor": reqData = { tag: "monitor", values: { is_monitor: !initState.is_monitor, sg_monitor_device: initState.sg_monitor_device } }; break;
    case "login": reqData = { tag: "login", values: { loginType: mainState.loginType } }; break;
    case "checkLogin": reqData = { tag: "checkLogin" }; break;
    case "LoginState": reqData = { tag: "LoginState" }; break;
    case "verify": reqData = { tag: "verify", values: { card: inputValue.value } }; break;
  }
  if (reqData) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(reqData));
    else console.log("ws 服务未开启.");
  }
  if (!notOff) mainState.isLoading = false;
};

// ── Voice model actions ─────────────────────────────────────────────

const downloadCloudModel = (model) => { sendOrder("downloadModel", model); mainState.isLoading = true; };

const useCloudModel = (model) => {
  if (mainState.isLoading) return;
  if (!isVerify.value) return showCheckDialog();
  if (initState.cloud_model.includes(`${model.name}.pth`)) {
    mainState.templateType = "cloud"; mainState.template = model.name;
    mainState.templateCategory = model.category; mainState.templateImg = model.image_url;
    sendOrder("useModel"); openModel("成功", "模型更换成功！");
  } else downloadCloudModel(model);
};

const delCloudModel = (model) => {
  mainState.templateType = "cloud"; mainState.template = model.name;
  mainState.templateImg = initTemplateImg; sendOrder("delModel");
  initState.cloud_model = initState.cloud_model.filter((r) => r !== `${model.name}.pth`);
  initState.templates.forEach((t) => { if (t.name === model.name) t.state = false; });
  mainState.template = "空"; mainState.templateType = ""; runtime.isStart = false;
};

// ── Local model actions ─────────────────────────────────────────────

const useLocalModel = (model) => {
  mainState.templateType = "local"; mainState.template = model;
  mainState.templateImg = initTemplateImg; sendOrder("useModel"); openModel("成功", "模型更换成功！");
};

const addLocalModel = () => ipcRenderer.send("open-file-dialog");
const delLocalModel = (model) => {
  mainState.templateType = "local"; mainState.template = model;
  mainState.templateImg = initTemplateImg; sendOrder("delModel");
  initState.local_model = initState.local_model.filter((r) => r !== model);
  mainState.template = "空"; mainState.templateType = ""; runtime.isStart = false;
};

// ── Initialization ──────────────────────────────────────────────────

const initData = async () => {
  try {
    const data = await Http.get("/init");
    if (data) {
      data.appName = "新纪元语音";
      data.templates = [
        { "id": 1, "name": "少女01", "image_url": "http://121.43.26.17/image/少女音/1.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女1" },
        { "id": 2, "name": "少女02", "image_url": "http://121.43.26.17/image/少女音/2.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女2" },
        { "id": 3, "name": "少女03", "image_url": "http://121.43.26.17/image/少女音/3.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女3" },
        { "id": 4, "name": "少女04", "image_url": "http://121.43.26.17/image/少女音/4.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女4" },
        { "id": 5, "name": "少女05", "image_url": "http://121.43.26.17/image/少女音/5.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女5" },
        { "id": 6, "name": "少女06", "image_url": "http://121.43.26.17/image/少女音/6.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女6" },
        { "id": 7, "name": "少女07", "image_url": "http://121.43.26.17/image/少女音/7.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女7" },
        { "id": 8, "name": "少女08", "image_url": "http://121.43.26.17/image/少女音/8.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女8" },
        { "id": 9, "name": "少女09", "image_url": "http://121.43.26.17/image/少女音/9.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女9" },
        { "id": 10, "name": "少女10", "image_url": "http://121.43.26.17/image/少女音/10.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女10" },
        { "id": 11, "name": "少女11", "image_url": "http://121.43.26.17/image/少女音/11.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女11" },
        { "id": 12, "name": "少女12", "image_url": "http://121.43.26.17/image/少女音/12.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女12" },
        { "id": 13, "name": "少女13", "image_url": "http://121.43.26.17/image/少女音/13.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女13" },
        { "id": 14, "name": "少女14", "image_url": "http://121.43.26.17/image/少女音/14.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女14" },
        { "id": 15, "name": "少女15", "image_url": "http://121.43.26.17/image/少女音/15.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女15" },
        { "id": 16, "name": "少女16", "image_url": "http://121.43.26.17/image/少女音/16.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女16" },
        { "id": 17, "name": "少女17", "image_url": "http://121.43.26.17/image/少女音/17.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女17" },
        { "id": 18, "name": "少女18", "image_url": "http://121.43.26.17/image/少女音/18.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女18" },
        { "id": 19, "name": "少女19", "image_url": "http://121.43.26.17/image/少女音/19.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女19" },
        { "id": 20, "name": "少女20", "image_url": "http://121.43.26.17/image/少女音/20.jpg", "category": "少女", "is_charge": "是", "is_recommend": " 否", "showName": "少女20" },
        { "id": 21, "name": "少女21", "image_url": "http://121.43.26.17/image/少女音/21.jpg", "category": "少女", "is_charge": "是", "is_recommend": "是", "showName": "少女21" },
        { "id": 22, "name": "御姐01", "image_url": "http://121.43.26.17/image/御姐音/1.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐1" },
        { "id": 23, "name": "御姐02", "image_url": "http://121.43.26.17/image/御姐音/2.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐2" },
        { "id": 24, "name": "御姐03", "image_url": "http://121.43.26.17/image/御姐音/3.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐3" },
        { "id": 25, "name": "御姐04", "image_url": "http://121.43.26.17/image/御姐音/4.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐4" },
        { "id": 26, "name": "御姐05", "image_url": "http://121.43.26.17/image/御姐音/5.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐5" },
        { "id": 27, "name": "御姐06", "image_url": "http://121.43.26.17/image/御姐音/6.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐6" },
        { "id": 28, "name": "御姐07", "image_url": "http://121.43.26.17/image/御姐音/7.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐7" },
        { "id": 29, "name": "御姐08", "image_url": "http://121.43.26.17/image/御姐音/8.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐8" },
        { "id": 30, "name": "御姐09", "image_url": "http://121.43.26.17/image/御姐音/9.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐9" },
        { "id": 31, "name": "御姐10", "image_url": "http://121.43.26.17/image/御姐音/10.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐10" },
        { "id": 32, "name": "御姐11", "image_url": "http://121.43.26.17/image/御姐音/11.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐11" },
        { "id": 33, "name": "御姐12", "image_url": "http://121.43.26.17/image/御姐音/12.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐12" },
        { "id": 34, "name": "御姐13", "image_url": "http://121.43.26.17/image/御姐音/13.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐13" },
        { "id": 35, "name": "御姐14", "image_url": "http://121.43.26.17/image/御姐音/14.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐14" },
        { "id": 36, "name": "御姐15", "image_url": "http://121.43.26.17/image/御姐音/15.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐15" },
        { "id": 37, "name": "御姐16", "image_url": "http://121.43.26.17/image/御姐音/16.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐16" },
        { "id": 38, "name": "御姐17", "image_url": "http://121.43.26.17/image/御姐音/17.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐17" },
        { "id": 39, "name": "萝莉01", "image_url": "http://121.43.26.17/image/萝莉音/1.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉1" },
        { "id": 40, "name": "萝莉02", "image_url": "http://121.43.26.17/image/萝莉音/2.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉2" },
        { "id": 41, "name": "萝莉03", "image_url": "http://121.43.26.17/image/萝莉音/3.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉3" },
        { "id": 42, "name": "萝莉04", "image_url": "http://121.43.26.17/image/萝莉音/4.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉4" },
        { "id": 43, "name": "萝莉05", "image_url": "http://121.43.26.17/image/萝莉音/5.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉5" },
        { "id": 44, "name": "萝莉06", "image_url": "http://121.43.26.17/image/萝莉音/6.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉6" },
        { "id": 45, "name": "男生01", "image_url": "http://121.43.26.17/image/男声/1.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声1" },
        { "id": 46, "name": "男生02", "image_url": "http://121.43.26.17/image/男声/2.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声2" },
        { "id": 47, "name": "男生03", "image_url": "http://121.43.26.17/image/男声/3.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声3" },
        { "id": 48, "name": "男生04", "image_url": "http://121.43.26.17/image/男声/4.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声4" },
        { "id": 49, "name": "男生05", "image_url": "http://121.43.26.17/image/男声/5.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声5" },
        { "id": 50, "name": "男生06", "image_url": "http://121.43.26.17/image/男声/6.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声6" },
        { "id": 51, "name": "男生07", "image_url": "http://121.43.26.17/image/男声/7.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声7" },
        { "id": 52, "name": "小幸运", "image_url": "http://121.43.26.17/image/御姐音/18.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐18" },
        { "id": 53, "name": "忆雨", "image_url": "http://121.43.26.17/image/御姐音/19.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐19" },
        { "id": 54, "name": "文文", "image_url": "http://121.43.26.17/image/御姐音/20.jpg", "category": "御姐", "is_charge": "是", "is_recommend": " 否", "showName": "御姐20" },
        { "id": 55, "name": "月月", "image_url": "http://121.43.26.17/image/御姐音/21.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐21" },
        { "id": 56, "name": "柔柔", "image_url": "http://121.43.26.17/image/御姐音/22.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐22" },
        { "id": 57, "name": "点点", "image_url": "http://121.43.26.17/image/御姐音/23.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐23" },
        { "id": 58, "name": "烟华", "image_url": "http://121.43.26.17/image/御姐音/24.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐24" },
        { "id": 59, "name": "琥珀", "image_url": "http://121.43.26.17/image/御姐音/25.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐25" },
        { "id": 60, "name": "草莓", "image_url": "http://121.43.26.17/image/御姐音/26.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐26" },
        { "id": 61, "name": "禾禾", "image_url": "http://121.43.26.17/image/御姐音/27.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐27" },
        { "id": 62, "name": "夜姬", "image_url": "http://121.43.26.17/image/御姐音/28.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐28" },
        { "id": 63, "name": "媛媛", "image_url": "http://121.43.26.17/image/御姐音/29.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐29" },
        { "id": 64, "name": "乖乖", "image_url": "http://121.43.26.17/image/少女音/22.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女22" },
        { "id": 65, "name": "七七", "image_url": "http://121.43.26.17/image/少女音/23.jpg", "category": "少女", "is_charge": "是", "is_recommend": "是", "showName": "少女23" },
        { "id": 66, "name": "初初", "image_url": "http://121.43.26.17/image/少女音/24.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女24" },
        { "id": 67, "name": "宁宁", "image_url": "http://121.43.26.17/image/少女音/25.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女25" },
        { "id": 68, "name": "寒妹", "image_url": "http://121.43.26.17/image/少女音/26.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女26" },
        { "id": 69, "name": "小菜", "image_url": "http://121.43.26.17/image/少女音/27.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女27" },
        { "id": 70, "name": "阿金", "image_url": "http://121.43.26.17/image/少女音/28.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女28" },
        { "id": 71, "name": "阿喵", "image_url": "http://121.43.26.17/image/少女音/29.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女29" },
        { "id": 72, "name": " 灰灰", "image_url": "http://121.43.26.17/image/少女音/30.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女30" },
        { "id": 73, "name": "阿刁", "image_url": "http://121.43.26.17/image/少女音/31.jpg", "category": "少女", "is_charge": "是", "is_recommend": "是", "showName": "少女31" },
        { "id": 74, "name": "多多", "image_url": "http://121.43.26.17/image/少女音/32.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女32" },
        { "id": 75, "name": " 思思", "image_url": "http://121.43.26.17/image/少女音/33.jpg", "category": "少女", "is_charge": "是", "is_recommend": "是", "showName": "少女33" },
        { "id": 76, "name": "糖果", "image_url": "http://121.43.26.17/image/少女音/34.jpg", "category": "少女", "is_charge": "是", "is_recommend": "是", "showName": "少女34" },
        { "id": 77, "name": "可软", "image_url": "http://121.43.26.17/image/少女音/35.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女35" },
        { "id": 78, "name": "布甜", "image_url": "http://121.43.26.17/image/萝莉音/7.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉7" },
        { "id": 79, "name": "可儿", "image_url": "http://121.43.26.17/image/萝莉音/8.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "否", "showName": "萝莉8" },
        { "id": 80, "name": "洛洛", "image_url": "http://121.43.26.17/image/萝莉音/9.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉9" },
        { "id": 310, "name": "洛洛", "image_url": "http://121.43.26.17/image/萝莉音/10.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉10" },
        { "id": 300, "name": "可儿", "image_url": "http://121.43.26.17/image/萝莉音/11.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉11" },
        { "id": 301, "name": "布甜", "image_url": "http://121.43.26.17/image/萝莉音/12.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉12" },
        { "id": 302, "name": "可软", "image_url": "http://121.43.26.17/image/萝莉音/13.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉13" },
        { "id": 303, "name": "糖果", "image_url": "http://121.43.26.17/image/萝莉音/14.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉14" },
        { "id": 304, "name": "思思", "image_url": "http://121.43.26.17/image/萝莉音/15.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉15" },
        { "id": 305, "name": "萝莉02", "image_url": "http://121.43.26.17/image/萝莉音/16.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉16" },
        { "id": 306, "name": "萝莉01", "image_url": "http://121.43.26.17/image/萝莉音/17.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉17" },
        { "id": 307, "name": "多多", "image_url": "http://121.43.26.17/image/萝莉音/18.jpg", "category": "萝莉", "is_charge": "是", "is_recommend": "是", "showName": "萝莉18" },
        { "id": 113, "name": "正太音", "image_url": "http://121.43.26.17/image/男声/8.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声8" },
        { "id": 83, "name": "正太音", "image_url": "http://121.43.26.17/image/男声/9.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声9" },
        { "id": 87, "name": "真真", "image_url": "http://121.43.26.17/image/男声/10.jpg", "category": "男声", "is_charge": "否", "is_recommend": "否", "showName": "男声10" },
        { "id": 88, "name": "川建国", "image_url": "http://121.43.26.17/image/男声/11.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声11" },
        { "id": 105, "name": "男主播", "image_url": "http://121.43.26.17/image/男声/12.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声12" },
        { "id": 107, "name": "男神音", "image_url": "http://121.43.26.17/image/男声/13.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声13" },
        { "id": 108, "name": "正太音", "image_url": "http://121.43.26.17/image/男声/14.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声14" },
        { "id": 109, "name": "男神音", "image_url": "http://121.43.26.17/image/男声/15.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声15" },
        { "id": 110, "name": "真真", "image_url": "http://121.43.26.17/image/男声/16.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声16" },
        { "id": 111, "name": "真真", "image_url": "http://121.43.26.17/image/男声/17.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声17" },
        { "id": 112, "name": "正太音", "image_url": "http://121.43.26.17/image/男声/18.jpg", "category": "男声", "is_charge": "是", "is_recommend": "否", "showName": "男声18" },
        { "id": 234, "name": "秋天", "image_url": "http://121.43.26.17/image/御姐音/30.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐30" },
        { "id": 235, "name": "春天", "image_url": "http://121.43.26.17/image/少女音/36.jpg", "category": "少女", "is_charge": "是", "is_recommend": "否", "showName": "少女36" },
        { "id": 237, "name": "乐乐", "image_url": "http://121.43.26.17/image/御姐音/31.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "否", "showName": "御姐31" },
        { "id": 239, "name": "悦悦", "image_url": "http://121.43.26.17/image/御姐音/32.jpg", "category": "御姐", "is_charge": "是", "is_recommend": "", "showName": "御姐32" },
        { "id": 84, "name": "顾清寒", "image_url": "http://121.43.26.17/image/热门音色/顾清寒.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "顾清寒" },
        { "id": 85, "name": "海绵宝宝", "image_url": "http://121.43.26.17/image/热门音色/海绵宝宝.jpg", "category": "热门", "is_charge": "否", "is_recommend": "否", "showName": "海绵宝宝" },
        { "id": 86, "name": "冬雪莲", "image_url": "http://121.43.26.17/image/热门音色/冬雪莲.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "冬雪莲" },
        { "id": 89, "name": "暗裔剑魔", "image_url": "http://121.43.26.17/image/热门音色/暗裔剑魔.jpg", "category": "热门", "is_charge": "否", "is_recommend": "否", "showName": "暗裔剑魔" },
        { "id": 91, "name": "佐伊", "image_url": "http://121.43.26.17/image/热门音色/佐伊.jpg", "category": "热门", "is_charge": "是", "is_recommend": " 否", "showName": "佐伊" },
        { "id": 94, "name": "伊芙琳", "image_url": "http://121.43.26.17/image/热门音色/伊芙琳.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "伊芙琳" },
        { "id": 95, "name": "叶修", "image_url": "http://121.43.26.17/image/热门音色/叶修.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "叶修" },
        { "id": 96, "name": "疾风剑豪", "image_url": "http://121.43.26.17/image/热门音色/疾风剑豪.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "疾风剑豪" },
        { "id": 97, "name": "小团团", "image_url": "http://121.43.26.17/image/热门音色/小团团.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "小团团" },
        { "id": 99, "name": "孙悟空", "image_url": "http://121.43.26.17/image/热门音色/孙悟空.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "孙悟空" },
        { "id": 102, "name": "大海星", "image_url": "http://121.43.26.17/image/热门音色/大海星.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "大海星" },
        { "id": 112, "name": "麻薯", "image_url": "http://121.43.26.17/image/热门音色/麻薯.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "麻薯" },
        { "id": 114, "name": "懒羊羊", "image_url": "http://121.43.26.17/image/热门音色/懒羊羊.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "懒羊羊" },
        { "id": 116, "name": "名侦探柯南", "image_url": "http://121.43.26.17/image/热门音色/名侦探柯南.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "名侦探柯南" },
        { "id": 119, "name": "季沧海", "image_url": "http://121.43.26.17/image/热门音色/季沧海.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "季沧海" },
        { "id": 139, "name": "原神七七", "image_url": "http://121.43.26.17/image/热门音色/原神七七.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "原神七七" },
        { "id": 151, "name": "原神雷电将军", "image_url": "http://121.43.26.17/image/热门音色/原神雷电将军.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "原神雷电将军" },
        { "id": 210, "name": "娜塔莎", "image_url": "http://121.43.26.17/image/热门音色/娜塔莎.jpg", "category": "热门", "is_charge": "是", "is_recommend": "否", "showName": "娜塔莎" },
      ];
      inputValue.value = data.card;
      data.templates.forEach((t) => (t.state = true));
      Object.assign(initState, data);
      mainState.loadingCompleted = true;
      ipcRenderer.send("initTrayTitle", data.appName);
    } else {
      openModel("失败", "获取数据失败！");
      mainState.isLoading = false;
    }
  } catch (error) {
    await initData();
    console.error(error.message);
  }
};

// ── Voice changer & other actions ───────────────────────────────────

const handleCheckboxChange = () => {
  mainState.fontColor = mainState.fontColor === "white" ? "black" : "white";
};

const refreshList = async () => {
  mainState.isLoading = true;
  try {
    const data = await Http.get("/refreshList");
    if (data) { initState.input_devices = data["input_devices"]; initState.output_devices = data["output_devices"]; openModel("成功", "已刷新设备列表！"); }
    else openModel("失败", "未刷新设备列表！");
  } catch { openModel("失败", "未刷新设备列表！"); }
  finally { mainState.isLoading = false; }
};

const openSettings = () => Http.get("/openSettings");
const installDriver = () => Http.get("/installDriver");

const closeSetting = (closeState) => {
  mainState.closeState = closeState;
  ipcRenderer.send("isClose", closeState);
};

const openLink = (url) => {
  if (url) {
    if (!url.includes("http")) url = `http://${url}`;
    shell.openExternal(url);
  }
};

const closeWindow = () => {
  if (!mainState.closeState) sendOrder("exit");
  ipcRenderer.send("close");
};

const switchChange = (change) => {
  sendOrder("switchChange", change);
  mainState.isChange = change === "vc";
};

const switchVC = () => {
  if (runtime.isStart) sendOrder("startVC");
  else sendOrder("stopVC");
};

const open_monitor = () => sendOrder("monitor");

const openLogin = (loginType = "") => {
  if (loginType) mainState.loginType = loginType;
  mainState.isLoading = true;
  sendOrder("login");
};

const exit = () => {
  mainState.qqNum = 0; mainState.nickname = ""; mainState.iconImageUrl = "";
  clearInterval(mainState.loginIntervalId); clearInterval(mainState.loginStateIntervalId);
  mainState.loginIntervalId = 0; mainState.loginStateIntervalId = 0;
  initState.is_expired = false;
  document.getElementById("login").close();
  openModel("退出", "该帐号已在其它地方登录!");
};

const switchVipTabs = (tab) => { mainState.vipType = tab; mainState.isPayment = false; };

const payment = () => {
  if (mainState.qqNum !== 0) sendOrder("payment");
  else openModel("警告", "请先登录账号！");
};

// ── Interval helpers ────────────────────────────────────────────────

const createIntervalForOrder = (orderId) => {
  let secondsPassed = 0;
  const intervalId = setInterval(() => {
    if (secondsPassed >= 60000) {
      delete mainState.paymentCheckObj[orderId];
      clearInterval(intervalId);
    } else {
      secondsPassed += 1000;
      sendOrder("checkPayment", orderId);
    }
  }, 1000);
  return intervalId;
};

const createIntervalForLogin = () => {
  let secondsPassed = 0;
  const intervalId = setInterval(() => {
    if (secondsPassed >= 60000) {
      mainState.loginTimeout = true;
      clearInterval(intervalId);
    } else {
      secondsPassed += 2000;
      sendOrder("checkLogin");
    }
  }, 2000);
  return intervalId;
};

const createIntervalForLoginState = () => setInterval(() => sendOrder("LoginState"), 300000);

// ── GSAP animations ─────────────────────────────────────────────────

const timeline = gsap.timeline({ repeat: -1, delay: 0.5 });

const animateAnnouncement = () => {
  const container = document.querySelector(".announcement-container");
  initState.announcement.forEach((_, index) => {
    const announcement = document.querySelectorAll(".announcement")[index];
    const totalDistance = announcement.offsetWidth + container.offsetWidth;
    timeline.to(announcement, { x: () => -totalDistance, duration: totalDistance / (container.offsetWidth / 10), ease: "linear" });
  });
};

const animateIn = (event) => {
  const overlay = event.currentTarget.querySelector(".bg-black");
  const icon = event.currentTarget.querySelector(".fa-download");
  if (overlay && icon) {
    gsap.to(overlay, { duration: 0.5, opacity: 0.5 });
    gsap.to(icon, { duration: 0.5, opacity: 1, scale: 1, ease: "ease.out" });
  }
};

const animateOut = (event) => {
  const overlay = event.currentTarget.querySelector(".bg-black");
  const icon = event.currentTarget.querySelector(".fa-download");
  gsap.to(overlay, { duration: 0.5, opacity: 0 });
  gsap.to(icon, { duration: 0.5, opacity: 0, scale: 0, ease: "ease.in" });
};

// ── Lifecycle ───────────────────────────────────────────────────────

const heartbeat = () => setInterval(() => { if (ws && ws.readyState === WebSocket.OPEN) ws.send("ping"); }, 30000);

ipcRenderer.on("selected-directory", (event, path) => {
  const fileName = path.match(/[^/\\]+$/)[0];
  if (!initState.local_model.includes(fileName)) {
    templatePath.value = path;
    sendOrder("addModel");
    mainState.isLoading = true;
    setTimeout(() => { initState.local_model.push(path.match(/[^/\\]+$/)[0]); openModel("成功", "模型添加成功！"); mainState.isLoading = false; }, 1000);
  } else openModel("失败", "模型已存在！");
});

ipcRenderer.on("exit", () => sendOrder("exit"));

// ── Export ──────────────────────────────────────────────────────────

export function useAppState() {
  const handleConfirm = () => sendOrder("verify");
  const showCheckDialog = () => { openCheck.value = true; };

  return {
    // state
    mainState, initState, runtime,
    menuState, cloudMenuState, cloudState,
    openCheck, inputValue, isVerify,
    // actions
    setMenuActive, setCloudMenuActive,
    useCloudModel, delCloudModel,
    useLocalModel, addLocalModel, delLocalModel,
    refreshList, openSettings, installDriver,
    sendOrder, switchVC, switchChange, open_monitor,
    closeSetting, closeWindow, openLink, openLogin,
    handleCheckboxChange, switchVipTabs, payment,
    showCheckDialog, handleConfirm,
    animateIn, animateOut,
    // init
    initData, connect_ws, heartbeat, animateAnnouncement,
    // helpers
    setTheme, openModel,
  };
}
