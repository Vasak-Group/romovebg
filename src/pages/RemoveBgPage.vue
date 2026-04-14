<script lang="ts" setup>
import { Ref, ref } from "vue";
import ImageProcessLayout from "../layouts/ImageProcessLayout.vue";
import FileConvert from "../components/FileConvert.vue";

const files: Ref<File[]> = ref([]);

const deleteFile = (file: File) => {
  files.value = files.value.filter((f: File) => f !== file);
};
</script>

<template>
  <ImageProcessLayout v-model:files="files" title="Quita el fondo a las imágenes">
    <template #subtitle>
      Al subir una imagen o URL, aceptas nuestros
      <a target="_blank" class="underline" draggable="false" href="/es/tos">Condiciones
        del servicio</a>. Para saber más sobre cómo maneja tus datos personales
      brenini.dev, echa un vistazo a nuestra
      <a target="_blank" rel="noopener" class="underline" style="color: inherit" href="/es/privacy">Política
        de privacidad</a>.
    </template>
    <FileConvert v-for="file in files" :key="`${file.name}-${file.size}-${file.lastModified}`" :file="file" @delete="deleteFile(file)" />
  </ImageProcessLayout>
</template>
