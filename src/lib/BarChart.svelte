<!-- Barchart.svelte -->
<!-- Modified from https://datavisualizationwithsvelte.com/animated-bar-chart	-->
<script lang="ts">
  import { scaleLinear } from 'd3';
  import Rect from './Rect.svelte';

  // Interface
  export let points = [
      { x: 1990, y: 6.7 },
      { x: 1995, y: 4.6 },
      { x: 2000, y: 14.4 },
      { x: 2005, y: 18 },
      { x: 2010, y: 7 },
      { x: 2015, y: 12.4 },
      { x: 2020, y: 17 },
      { x: 2025, y: 10.9 },
      { x: 2030, y: 8 },
  ];
  export let xTickMessage = ' x';
  export let yTickTopMessage = ' y';
  export let padding = { top: 20, right: 45, bottom: 20, left: 25 };
  export let width = 500;
  export let height = 350;

  // Fill
  let fill = '#fffbeb';

  setTimeout(() => {
    fill = '#fcd34d';
  }, 100);

  // Ticks
  const nbOfYTicks = 5;
  console.log(points.map((point) => point.y));
  const maxY = Math.max(...(points.map((point) => point.y)));
  const maxX = Math.max(...(points.map((point) => point.x)));
  console.log(maxY);
  let yTicks = Array.from({ length: nbOfYTicks + 1 }, (_, i) => (i) * ( maxY / nbOfYTicks));

  // Calculate the scales
  $: xScale = scaleLinear()
    .domain([0, points.length])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([0, Math.max(...yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = innerWidth / points.length;

  // Shorten the date axis values for mobile
  function formatMobile(tick) {
    return "'" + tick.toString().slice(-2);
  }

</script>

<div class="chart" bind:clientWidth={width}>
  <svg {width} {height}>
    <!-- Draw the bars -->
    <g class="bars">
      {#each points as point, i}  <!-- svelte "each" block -->
        <Rect
          {i}
          {yScale}
          value={point.y}
          x={xScale(i) + 2}
          width={barWidth * 0.9}
          {fill} />
      {/each}
    </g>

    <!-- Draw the y axis -->
    <g class="axis y-axis">
      {#each yTicks as tick}
        <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
          <line x2="100%" />
          <text y="-4"
            >{tick} {tick == Math.max(...yTicks) ? yTickTopMessage : ''}</text>
        </g>
      {/each}
    </g>

    <!-- Draw the x axis -->
    <g class="axis x-axis">
      {#each points as point, i}
        <g class="tick" transform="translate({xScale(i)}, {height})">
          <text x={barWidth / 2} y="-4">
            {width > 380 ? point.x : formatMobile(point.x)}
          </text>
          {#if i === points.length - 1}
            <g class="ticklabel" transform="translate({xScale(1)}, 0)">
              <text x={-padding.right} y='-4'> {xTickMessage} </text>
            </g>
          {/if}

        </g>
      {/each}
    </g>
  </svg>
</div>

<style>
  .x-axis .tick text {
    text-anchor: middle;
    color: black;
    margin: 40px;
  }

  .tick {
    font-family: Poppins, sans-serif;
    font-size: 0.725em;
    font-weight: 200;
    color: black;
  }

  .tick .ticklabel text {
    font-size: 1.2em;
  }

  .tick text {
    fill: black;
    text-anchor: start;
    color: black;
  }

  .tick line {
    stroke: #fcd34d;
    stroke-dasharray: 2;
    opacity: 1;
  }

  .tick.tick-0 line {
    display: inline-block;
    stroke-dasharray: 0;
  }
</style>
