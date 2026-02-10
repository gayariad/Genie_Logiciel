<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/dashboard', { replace: true })
    },
  ],
})
</script>

<template>
  <div />
</template>

