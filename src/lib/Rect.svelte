<!-- Rect.svelte -->
<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { interpolate } from 'd3';

  export let x;
  export let value;
  export let yScale;

  export let width;
  export let height;
  export let i;
  export let fill;

  const tweenParams = {
    delay: 300 + i * 50,
    duration: 250,
    interpolate,
    easing: cubicOut
  };

  const tY = tweened(undefined, tweenParams);
  const tFill = tweened(undefined, { ...tweenParams, delay: 800 + i * 50 });

  $: tY.set(value);
  $: tFill.set(fill);
</script>

<rect
  {x}
  {width}
  y={yScale($tY)}
  height={yScale(0) - yScale($tY)}
  fill={$tFill}
  stroke="none" />
