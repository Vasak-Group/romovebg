import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faXmark,
  faHouse,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faSun,
  faMoon,
  faCircleHalfStroke
} from "@fortawesome/free-solid-svg-icons";

import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

library.add(
  faXmark,
  faHouse,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faSun,
  faMoon,
  faCircleHalfStroke
);

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);

app.mount("#app");
