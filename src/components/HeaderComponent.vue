<script lang="ts" setup>
import { RouterLink } from "vue-router";
</script>

<template>
    <header class="m-4 rounded-xl bg-slate-200 dark:bg-slate-900">
        <div class="flex h-16 items-center justify-between px-8">
            <RouterLink to="/" class="flex items-center gap-2">
                <span class="text-xl font-bold vsk-text-gradient">
                    Background Remover
                </span>
            </RouterLink>

            <nav class="hidden md:flex items-center gap-6">
                <RouterLink to="/" class="text-sm font-medium hover:text-primary transition-colors">
                    Remover fondo
                </RouterLink>
                <RouterLink to="/compress" class="text-sm font-medium hover:text-primary transition-colors">
                    Comprimir AVIF
                </RouterLink>
                <a href="https://vasak.net.ar/" target="_blank"
                    class="text-sm font-medium hover:text-primary transition-colors">
                    Vasak Group
                </a>
            </nav>
        </div>
    </header>
</template>