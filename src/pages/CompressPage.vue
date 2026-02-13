<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { encode as encodeAvif } from "@jsquash/avif";
import FileDrop from "../components/FileDrop.vue";

type ItemStatus = "queued" | "loading" | "done" | "error";

type ConversionItem = {
	id: string;
	file: File;
	status: ItemStatus;
	errorMessage: string;
	originalUrl: string;
	avifUrl: string | null;
	avifBlob: Blob | null;
	avifFileName: string;
};

const files = ref<File[]>([]);
const items = ref<ConversionItem[]>([]);
const isProcessing = ref(false);

const clearAll = () => {
	items.value.forEach((item) => {
		URL.revokeObjectURL(item.originalUrl);
		if (item.avifUrl) {
			URL.revokeObjectURL(item.avifUrl);
		}
	});
	items.value = [];
	files.value = [];
};

onBeforeUnmount(() => {
	items.value.forEach((item) => {
		URL.revokeObjectURL(item.originalUrl);
		if (item.avifUrl) {
			URL.revokeObjectURL(item.avifUrl);
		}
	});
});

const totalOriginalSize = computed(() =>
	formatBytes(items.value.reduce((sum, item) => sum + item.file.size, 0))
);
const totalAvifSize = computed(() =>
	formatBytes(items.value.reduce((sum, item) => sum + (item.avifBlob?.size ?? 0), 0))
);
const totalDelta = computed(() => {
	const original = items.value.reduce((sum, item) => sum + item.file.size, 0);
	const avif = items.value.reduce((sum, item) => sum + (item.avifBlob?.size ?? 0), 0);
	if (!items.value.length) {
		return "-";
	}
	const diff = avif - original;
	const sign = diff > 0 ? "+" : "";
	return `${sign}${formatBytes(diff)}`;
});

const buildFileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const enqueueFiles = (incoming: File[]) => {
	const existing = new Set(items.value.map((item) => item.id));
	incoming.forEach((file) => {
		const id = buildFileId(file);
		if (existing.has(id)) {
			return;
		}
		const item: ConversionItem = {
			id,
			file,
			status: "queued",
			errorMessage: "",
			originalUrl: URL.createObjectURL(file),
			avifUrl: null,
			avifBlob: null,
			avifFileName: file.name.replace(/\.[^/.]+$/, "") + ".avif"
		};
		items.value.push(item);
	});
};

const processQueue = async () => {
	if (isProcessing.value) {
		return;
	}
	isProcessing.value = true;
	try {
		const queued = items.value.filter((item) => item.status === "queued");
		if (!queued.length) {
			return;
		}
		await Promise.all(queued.map((item) => processItem(item)));
	} finally {
		isProcessing.value = false;
	}
};

const processItem = async (item: ConversionItem) => {
	if (!item.file.type.startsWith("image/")) {
		item.status = "error";
		item.errorMessage = "El archivo seleccionado no es una imagen valida.";
		return;
	}
	item.status = "loading";
	try {
		const blob = await convertToAvif(item.file);
		item.avifBlob = blob;
		item.avifUrl = URL.createObjectURL(blob);
		item.status = "done";
	} catch (error) {
		item.status = "error";
		item.errorMessage = error instanceof Error ? error.message : "No se pudo convertir.";
	}
};

const removeItem = (id: string) => {
	const index = items.value.findIndex((item) => item.id === id);
	if (index === -1) {
		return;
	}
	const item = items.value[index];
	URL.revokeObjectURL(item.originalUrl);
	if (item.avifUrl) {
		URL.revokeObjectURL(item.avifUrl);
	}
	items.value.splice(index, 1);
};

watch(files, (value) => {
	if (!value.length) {
		return;
	}
	enqueueFiles(value);
	void processQueue();
});

const convertToAvif = async (file: File): Promise<Blob> => {
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
		quality: 90,
		effort: 4,
		chromaSubsampling: "4:4:4"
	});

	return new Blob([avifBytes], { type: "image/avif" });
};

const loadBitmap = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
	if ("createImageBitmap" in window) {
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

const getItemDelta = (item: ConversionItem) => {
	if (!item.avifBlob) {
		return "-";
	}
	const diff = item.avifBlob.size - item.file.size;
	const sign = diff > 0 ? "+" : "";
	return `${sign}${formatBytes(diff)}`;
};
</script>

<template>
	<section class="min-h-screen px-6 py-12 md:py-16">
		<div class="mx-auto w-full max-w-4xl">
			<div class="flex flex-col gap-4">
				<h1 class="font-display text-3xl md:text-4xl font-bold text-primary m-0">
					Comprimir imagenes a AVIF
				</h1>
				<p class="text-base md:text-lg m-0">
					Sube una o varias imagenes en cualquier formato y las convertimos a AVIF para reducir
					el peso sin perder calidad visible.
				</p>
			</div>

			<div class="mt-8 rounded-2xl bg-slate-200 dark:bg-slate-900 p-6 shadow-sm">
				<div class="flex flex-col gap-4">
					<label class="text-sm font-semibold">Selecciona imagenes</label>
					<FileDrop v-model:allFiles="files" />

					<div class="flex flex-wrap gap-3 text-sm text-gray-600">
						<span>Archivos: {{ items.length }}</span>
						<span>Peso total original: {{ totalOriginalSize }}</span>
						<span>Peso total AVIF: {{ totalAvifSize }}</span>
						<span>Diferencia total: {{ totalDelta }}</span>
					</div>

					<div class="flex flex-wrap gap-3">
						<button
							type="button"
							class="text-sm font-semibold text-gray-600 hover:text-primary"
							@click="clearAll"
						>
							Limpiar todo
						</button>
					</div>
				</div>
			</div>

			<div v-if="items.length" class="mt-10 grid gap-6 md:grid-cols-2">
				<div
					v-for="item in items"
					:key="item.id"
					class="rounded-xl p-4 bg-slate-100 dark:bg-slate-900"
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="text-sm font-semibold break-all">{{ item.file.name }}</p>
							<p class="text-xs text-gray-500">{{ item.file.type || "image/*" }}</p>
						</div>
						<button
							type="button"
							class="text-xs text-gray-500 hover:text-red-500"
							@click="removeItem(item.id)"
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
									:src="item.originalUrl"
									class="h-full w-full object-contain"
									alt="Imagen original"
								/>
							</div>
						</div>
						<div>
							<p class="text-xs font-semibold">AVIF</p>
							<div class="mt-2 aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
								<img
									v-if="item.avifUrl"
									:src="item.avifUrl"
									class="h-full w-full object-contain"
									alt="Imagen comprimida"
								/>
							</div>
						</div>
					</div>

					<div class="mt-3 flex flex-col gap-1 text-xs text-gray-600">
						<span>Peso original: {{ formatBytes(item.file.size) }}</span>
						<span>Peso AVIF: {{ item.avifBlob ? formatBytes(item.avifBlob.size) : "-" }}</span>
						<span>Diferencia: {{ getItemDelta(item) }}</span>
					</div>

					<div class="mt-3">
						<div v-if="item.status === 'loading'" class="text-sm text-primary">
							Convirtiendo...
						</div>
						<div v-if="item.status === 'error'" class="text-sm text-red-600">
							{{ item.errorMessage }}
						</div>
						<div v-if="item.status === 'done'" class="flex flex-col gap-3">
							<a
								class="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white"
								:href="item.avifUrl || undefined"
								:download="item.avifFileName"
							>
								Descargar AVIF
							</a>
							<p class="text-xs text-gray-500 m-0">
								Calidad configurada al maximo. El resultado puede variar segun el navegador.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
  </section>
</template>
