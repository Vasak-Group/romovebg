import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../pages/HomePage.vue")
    },
    {
      path: "/compress",
      name: "compress",
      component: () => import("../pages/CompressPage.vue")
    }
  ]
});

export default router;
