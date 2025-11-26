<script setup lang="ts">
import FooterComponent from '../components/FooterComponent.vue';
import HeaderComponent from '../components/HeaderComponent.vue';
import ThemeToggle from '../components/ThemeToggle.vue';

</script>

<template>
  <HeaderComponent />
  <slot />
  <FooterComponent />
  <ThemeToggle />
</template>