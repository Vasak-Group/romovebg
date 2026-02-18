<script setup lang="ts">
import { ref } from "vue";
import { encode as encodeAvif } from "@jsquash/avif";
import ImageProcessLayout from "../layouts/ImageProcessLayout.vue";
import ImageProcessCard from "../components/ImageProcessCard.vue";

const files = ref<File[]>([]);
const processedItems = ref<Map<string, Blob>>(new Map());

const deleteItem = (file: File) => {
	const index = files.value.findIndex(
		(f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
	);
	if (index !== -1) {
		const id = buildFileId(files.value[index]);
		files.value.splice(index, 1);
		processedItems.value.delete(id);
	}
};

const buildFileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const convertToAvif = async (file: File): Promise<Blob> => {
	if (!file.type.startsWith("image/")) {
		throw new Error("El archivo seleccionado no es una imagen valida.");
	}

	const bitmap = await loadBitmap(file);
	const canvas = document.createElement("canvas");
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("No se pudo crear el canvas.");
	}
	context.drawImage(bitmap, 0, 0);

	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	const avifBytes = await encodeAvif(imageData, {
		quality: 90
	});

	return new Blob([avifBytes], { type: "image/avif" });
};

const loadBitmap = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
	if ("createImageBitmap" in globalThis) {
		try {
			return await createImageBitmap(file);
		} catch {
			// Fallback to HTMLImageElement
		}
	}

	return await new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
		img.src = url;
	});
};
</script>

<template>
	<ImageProcessLayout v-model:files="files" title="Comprimir imagenes">
		<template #subtitle>
			Al subir una imagen o URL, aceptas nuestros
			<a target="_blank" class="underline" draggable="false" href="/es/tos">Condiciones
				del servicio</a>. Para saber más sobre cómo maneja tus datos personales
			brenini.dev, echa un vistazo a nuestra
			<a target="_blank" rel="noopener" class="underline" style="color: inherit" href="/es/privacy">Política
				de privacidad</a>.
		</template>
		<ImageProcessCard v-for="file in files" :key="`${file.name}-${file.size}-${file.lastModified}`" :file="file"
			:output-file-name="`${file.name.replace(/\.[^/.]+$/, '')}.avif`" :process-function="convertToAvif"
			@delete="deleteItem(file)" @processed="(blob) => processedItems.set(buildFileId(file), blob)" />
	</ImageProcessLayout>
</template>
