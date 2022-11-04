<template>
  <header class="flex items-center justify-center p-2 sticky top-0 z-50 border rounded bg-green-300">
    <button @click="clearLogs" class="ml-2 border border-black rounded px-2 py-1 bg-orange-400" type="button">
      Clear Logs
    </button>
    <div class="grid grid-cols-2 gap-1">
      <label class="text-right">Num Runs:</label><input type="text" class="text-center" v-model="runs">
      <label class="text-right">Steps / Run:</label><input type="text" class="text-center" v-model="steps">
    </div>
    <button @click="startTest" class="ml-2 border border-black rounded px-2 py-1 bg-orange-400" type="button">
      Start Test
    </button>
    <button @click="stopTest" class="ml-2 border border-black rounded px-2 py-1 bg-orange-400" type="button">
      Stop Test
    </button>
  </header>
  <div class="grid grid-cols-2">
    <section class="flex flex-col">
      <h2>Test Log: Current Julian Time = {{ julianTimeNow }}</h2>
      <div class="flex flex-col">
        <div v-for="status in test_status"> {{ status }}</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";

const runs = ref(1);
const steps = ref(1);
const test_status = reactive([] as string[]);
const julianTimeNow = ref("");
const clearLogs = () => {
  window.api.send("clear_log");
  test_status.splice(0, test_status.length);
  julianTimeNow.value = "";
};
const startTest = () => window.api.send("start_test", {runs: runs.value, steps: steps.value});
const stopTest = () => window.api.send("stop_test");
onMounted(() => {
  window.api.receive("test_status", (value: string) => test_status.push(`${value}`));
  window.api.receive("julian_time", (value: string) => julianTimeNow.value = value);

  window.api.receive("get_log", (value: string) => {
    test_status.splice(0, test_status.length);
    test_status.push(...value.split("\n"));
  });

  window.api.send("get_log");
});

</script>

