<script lang="ts" setup>
import { Ref, ref } from "vue";

const props = defineProps(["allFiles"]);
const emits = defineEmits(["update:allFiles"]);
const isDragover: Ref<Boolean> = ref(false);

const dropHandler = (event: any) => {
  const droppedFiles = Array.from(event.dataTransfer.files);
  emits("update:allFiles", [...props.allFiles, ...droppedFiles]);
  isDragover.value = false;
};

const addImage = (event: any) => {
  const droppedFiles = Array.from(event.target.files);
  emits("update:allFiles", [...props.allFiles, ...droppedFiles]);
};

const setIsDragOver = (status: boolean) => {
  isDragover.value = status;
};

const chooseFiles = () => {
  document.getElementById("imageUpload")?.click();
};

</script>

<template>
  <div
    class="border-2 w-full flex flex-col justify-center items-center gap-8 pt-16 pb-16 rounded-xl bg-slate-200 dark:bg-slate-900"
    @drop.prevent="dropHandler($event)" @dragover.prevent="setIsDragOver(true)"
    @dragleave.prevent="setIsDragOver(false)"
    :class="isDragover ? 'border-dashed border-secondary ' : 'border-primary '">
    <div class="flex flex-col gap-1.5">
      <button type="button" @click="chooseFiles()"
        class="rounded-full font-semi-bold transition ease-in-out text-center font-body no-underline hover:no-underline py-3 inline-flex items-center justify-center text-2xl font-bold text-white vsk-gradient active:scale-[0.97] mb-6">
        <div class="[&amp;>svg]:scale-133 [&amp;>svg]:shrink-0 flex items-center gap-2">
          <font-awesome-icon icon="fas fa-cloud-upload-alt" class="text-2xl text-white ms-1" />
          Cargar imagen
        </div>
      </button>
      <input id="imageUpload" ref="file" type="file" hidden @change="addImage($event)" />
      <p class="m-0 font-bold text-xl">O arrastrala y sueltala aquí</p>
    </div>
  </div>
</template>
