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
    },
    {
      path: "/removebg",
      name: "removebg",
      component: () => import("../pages/RemoveBgPage.vue")
    }
  ]
});

export default router;
