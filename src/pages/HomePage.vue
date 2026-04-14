<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <section class="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-slate-50 shadow-xl sm:p-10">
      <div class="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/30 blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-secondary/40 blur-3xl"></div>

      <div class="relative z-10 max-w-2xl">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Herramientas de imagen</p>
        <h1 class="text-3xl font-extrabold leading-tight sm:text-5xl">
          Procesa tus imágenes en segundos desde una sola web
        </h1>
        <p class="mt-4 text-base text-slate-200 sm:text-lg">
          Elige entre quitar fondos automáticamente o comprimir imágenes a AVIF para reducir peso sin perder calidad.
        </p>
      </div>
    </section>

    <section class="mt-10 grid gap-6 md:grid-cols-2">
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 class="text-2xl font-bold">Quitar fondo</h2>
        <p class="mt-3 text-slate-600 dark:text-slate-300">
          Sube una imagen y elimina su fondo para crear recursos listos para catálogo, diseño o redes sociales.
        </p>
        <RouterLink
          to="/removebg"
          class="vsk-gradient mt-6 inline-flex items-center rounded-xl px-5 py-3 font-bold text-slate-900 transition hover:brightness-105"
        >
          Ir a quitar fondo
        </RouterLink>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 class="text-2xl font-bold">Comprimir a AVIF</h2>
        <p class="mt-3 text-slate-600 dark:text-slate-300">
          Convierte tus imágenes a AVIF para mejorar la velocidad de carga en web y ahorrar almacenamiento.
        </p>
        <RouterLink
          to="/compress"
          class="vsk-gradient mt-6 inline-flex items-center rounded-xl px-5 py-3 font-bold text-slate-900 transition hover:brightness-105"
        >
          Ir a compresión
        </RouterLink>
      </article>
    </section>

    <section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      Al usar estas herramientas, aceptas nuestros
      <a target="_blank" class="underline" draggable="false" href="/es/tos">Condiciones del servicio</a>
      y nuestra
      <a target="_blank" rel="noopener" class="underline" style="color: inherit" href="/es/privacy">Política de privacidad</a>.
    </section>
  </main>
</template>
