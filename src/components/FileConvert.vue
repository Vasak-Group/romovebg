<script lang="ts" setup>
import { Ref, ref } from "vue";

const props = defineProps(["file"]);
const emit = defineEmits(["deleteFile"]);
const loading: Ref<boolean> = ref(false);
const mainWindow = window;

const deleteFile = () => {
  emit("deleteFile");
};

const removeBackgroundFile = async () => {
  loading.value = true;
  try {
    const mod: any = await import("@imgly/background-removal");
    console.log("@imgly/background-removal -> module:", mod);
    const fn: any = (mod && (mod.removeBackground ?? mod.default ?? mod.remove ?? mod.process)) ?? mod;
    console.log("Resolved candidate function/value:", fn);

    if (typeof fn !== "function") {
      console.warn("Candidate is not a function; attempting common method names on the module...");
      // intenta detectar métodos dentro del objeto exportado
      const alt = ["removeBackground", "remove", "process", "default"].map((k) => (mod && mod[k]) || undefined).find((v) => typeof v === "function");
      if (!alt) {
        throw new Error("No se encontró una función de eliminación de fondo en la librería (ni en propiedades comunes). Revisa la consola para ver el módulo importado.");
      }
      console.log("Found alternate function on module:", alt);
      // intentamos llamar la función con reintentos para manejar problemas de WASM/ORT
      try {
        const result: any = await alt(props.file);
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${props.file.name}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (errInner) {
        console.warn("Error al ejecutar la función alternativa, reintentando con configuración WASM de un solo hilo:", errInner);
        const result: any = await alt(props.file, { wasm: { numThreads: 1 } });
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${props.file.name}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } else {
      // función encontrada directamente
      try {
        const result: any = await fn(props.file);
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${props.file.name}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (errFn) {
        console.warn("Error al ejecutar removeBackground; reintentando con configuración WASM de un solo hilo:", errFn);
        // reintento forzando un hilo (reduce la probabilidad de problemas si el navegador no soporta crossOriginIsolated)
        const result: any = await fn(props.file, { wasm: { numThreads: 1 } });
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${props.file.name}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    }
  } catch (err) {
    console.error("Error eliminando fondo:", err);
    // Mensaje breve para el usuario; puedes personalizar esto.
    alert("Ocurrió un error al eliminar el fondo. Revisa la consola para más detalles.");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-3 rounded-xl flex flex-col gap-2 w-80 relative pt-8 bg-slate-200 dark:bg-slate-900">
    <div class="rounded-xl bg-center bg-no-repeat bg-cover aspect-video w-full mt-2 relative" :style="`background-image: url(${mainWindow.URL.createObjectURL(
      props.file
    )});`">
      <div v-if="loading"
        class="absolute top-0 bottom-0 left-0 right-0 rounded-xl flex flex-wrap justify-center content-center bg-slate-100/50 dark:bg-slate-950/50">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] border-primary"
          role="status">
          <span
            class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </div>
    </div>

    {{ props.file.name }}
    <button class="vsk-gradient text-white rounded-xl p-3" @click="removeBackgroundFile()">
      Descargar
      <font-awesome-icon icon="fas fa-cloud-download-alt" />
    </button>
    <div class="hidde"></div>

    <span class="p-2 absolute top-1 right-1 text-secondary" @click="deleteFile()">
      <font-awesome-icon icon="fas fa-xmark" />
    </span>
  </div>
</template>
