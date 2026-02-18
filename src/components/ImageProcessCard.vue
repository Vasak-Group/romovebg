<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

type ProcessStatus = "loading" | "done" | "error";

type Props = {
  file: File;
  outputFileName: string;
  processFunction: (file: File) => Promise<Blob>;
};

const props = defineProps<Props>();
const emit = defineEmits<{
  delete: [];
  processed: [blob: Blob];
}>();

const status = ref<ProcessStatus>("loading");
const errorMessage = ref("");
const outputBlob = ref<Blob | null>(null);
const originalUrl = ref<string | null>(null);
const outputUrl = ref<string | null>(null);

const formatBytes = (value: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = Math.abs(value);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const formatted = size < 10 ? size.toFixed(2) : size.toFixed(1);
  return `${value < 0 ? "-" : ""}${formatted} ${units[unitIndex]}`;
};

const originalSize = computed(() => formatBytes(props.file.size));
const outputSize = computed(() => (outputBlob.value ? formatBytes(outputBlob.value.size) : "-"));
const sizeDelta = computed(() => {
  if (!outputBlob.value) {
    return "-";
  }
  const diff = outputBlob.value.size - props.file.size;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${formatBytes(diff)}`;
});

originalUrl.value = URL.createObjectURL(props.file);

const processFile = async () => {
  try {
    const blob = await props.processFunction(props.file);
    outputBlob.value = blob;
    outputUrl.value = URL.createObjectURL(blob);
    status.value = "done";
    emit("processed", blob);
  } catch (error) {
    status.value = "error";
    errorMessage.value = error instanceof Error ? error.message : "Error al procesar la imagen.";
  }
};

onBeforeUnmount(() => {
  if (originalUrl.value) {
    URL.revokeObjectURL(originalUrl.value);
  }
  if (outputUrl.value) {
    URL.revokeObjectURL(outputUrl.value);
  }
});

void processFile();
</script>

<template>
  <div class="rounded-xl p-4 bg-slate-100 dark:bg-slate-900 w-120">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold break-all">{{ file.name }}</p>
        <p class="text-xs text-gray-500">{{ file.type || "image/*" }}</p>
      </div>
      <button
        type="button"
        class="text-xs text-gray-500 hover:text-red-500"
        @click="emit('delete')"
        aria-label="Quitar"
      >
        <font-awesome-icon icon="fas fa-xmark" />
      </button>
    </div>

    <div class="mt-3 grid gap-4 md:grid-cols-2">
      <div>
        <p class="text-xs font-semibold">Original</p>
        <div class="mt-2 aspect-video overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
          <img
            v-if="originalUrl"
            :src="originalUrl"
            class="h-full w-full object-contain"
            alt="Original"
          />
        </div>
      </div>
      <div>
        <p class="text-xs font-semibold">Procesada</p>
        <div class="mt-2 aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          <img
            v-if="outputUrl && status === 'done'"
            :src="outputUrl"
            class="h-full w-full object-contain"
            alt="Procesada"
          />
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-col gap-1 text-xs text-gray-600">
      <span>Peso original: {{ originalSize }}</span>
      <span>Peso procesada: {{ outputSize }}</span>
      <span>Diferencia: {{ sizeDelta }}</span>
    </div>

    <div class="mt-3">
      <div v-if="status === 'loading'" class="text-sm text-primary">
        Procesando...
      </div>
      <div v-if="status === 'error'" class="text-sm text-red-600">
        {{ errorMessage }}
      </div>
      <div v-if="status === 'done'" class="flex flex-col gap-3">
        <a
          class="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          :href="outputUrl || undefined"
          :download="outputFileName"
        >
          Descargar
          <font-awesome-icon icon="fas fa-cloud-download-alt" class="ms-2" />
        </a>
      </div>
    </div>
  </div>
</template>
