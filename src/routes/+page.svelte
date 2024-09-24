<script lang="ts">
  import * as duckdb from '@duckdb/duckdb-wasm';
  import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
  import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
  import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
  import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
  import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';
  import { onMount } from 'svelte';
  import { GridApi, createGrid } from 'ag-grid-community';
  import type * as arrow from 'apache-arrow';
  import 'ag-grid-community/styles/ag-grid.css';
  import 'ag-grid-community/styles/ag-theme-quartz.css';
//  import * as d3 from 'd3';
	import { scaleLinear } from 'd3';
  import BarChart from '$lib/BarChart.svelte';

  export let queryResult: arrow.Table<any>;
  export let queryInput = '';
  export let files: FileList;

  let db: Promise<duckdb.AsyncDuckDB>;
  let agGridApi: GridApi;
  let columns: string[] = [];
  let feedbackText: string = null;

	let barchart_points = [
		{ x: 1990, y: 16.6 },
		{ x: 1995, y: 19.6 },
		{ x: 2000, y: 14.4 },
		{ x: 2005, y: 14 },
		{ x: 2010, y: 13 },
		{ x: "lol", y: 12.4 },
    { x: 2020, y: 17 },
    { x: 2025, y: 10.9 },
    { x: 2030, y: 8 },
	];
  const barchart_width = 1500;
  const barchart_height = 400;
	const barchart_xTicks = [1990, 1995, 2000, 2005, 2010, 2015];
	const barchart_yTicks = [0, 5, 10, 15, 20];
	const barchart_padding = { top: 20, right: 15, bottom: 20, left: 25 };


  // duckdb
  async function initDuckDb(): Promise<duckdb.AsyncDuckDB> {
    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
      mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
      },
      eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
      },
    };
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    return db;
  }

  async function query(queryString: string) {
    const connection = await (await db).connect();
    const result = await connection.query(queryString).then((result) => {
      console.log(result);
      queryResult = result;

      columns = queryResult.schema.fields.map((field: any) => field.name);
      const queryData = queryResult.toArray();

      // Update the points array from queryResult based on the columns
      barchart_points = queryData.map(row => ({
        x: row.x,  // TODO
        y: row.y  // TODO: make column names for x and y user input
      }));

      let colDefs: any[] = [];
      columns.forEach((key: any) =>
        colDefs.push({
          field: key,
          filter: true,
        })
      );
      agGridApi.setGridOption('columnDefs', colDefs);
      agGridApi.setGridOption('rowData', queryData);
      // agGridApi.autoSizeAllColumns();
      agGridApi = agGridApi;

      let nbRows = queryResult.batches.reduce((result, {data}) => result + data.length, 0);
      let nbCols = queryResult.schema.fields.length;
      feedbackText = `Query executed successfully. ${nbRows} rows returned in ${nbCols} columns.`;
    }).catch((error) => {
      feedbackText = error;
      console.log(error);
    });
  }

  async function registerFiles(files: FileList) {
    for (let file of files) {
      console.log(file);
      await (
        await db
      ).registerFileHandle(
        file.name,
        file,
        DuckDBDataProtocol.BROWSER_FILEREADER,
        true
      );
      queryInput = `select * from '${file.name}';`;
    }
  }


  // D3
 // $: bins = d3.histogram().domain(x.domain()).thresholds(x.ticks(40))(data);

//  // set the parameters for the histogram
//  const histogram = d3.histogram()
//      .value(function(d) { return d.price; })   // I need to give the vector of value
//      .domain(x.domain())  // then the domain of the graphic
//      .thresholds(x.ticks(70)); // then the numbers of bins
//
//  // And apply this function to data to get the bins
//  const bins = histogram(data);
  // End D3

  onMount(() => {
    agGridApi = createGrid(
      document.getElementById('queryResultGrid') as any,
      {}
    );
    db = initDuckDb();
  });
</script>

<div class="container">
  <figure>
    <img src="inspector_duck.png" alt="Inspector Duck Logo" height="100px" />
    <h1>Inspector Duck</h1>
  </figure>
  <input type="file" id="file" bind:files multiple on:change={() => {registerFiles(files)}} />
  {#if files && files[0]}
    <textarea
      class="input"
      bind:value={queryInput}
      rows="10"
      placeholder="select * from {files[0].name};"
    />
    <br />
    <button
      on:click={() => {
        query(queryInput);
      }}>Query</button
    >
  {/if}
  <div >
    <br />
  </div>
  <div class="feedback">
    {#if feedbackText}
      <p>{feedbackText}</p>
    {/if}
  </div>
  <div
    id="queryResultGrid"
    class={columns.length > 0
      ? 'queryResult ag-theme-quartz-auto-dark'
      : 'queryResult ag-theme-quartz-auto-dark hidden'}
    >
  </div>
  <div>
    <br />
    <b>Barchart</b>
    <BarChart
      points={barchart_points}
      xTicks={barchart_xTicks}
      yTicks={barchart_yTicks}
      padding={barchart_padding}
      width={barchart_width} height={barchart_height} />
  </div>
</div>  <!-- end container -->

<style>
  h1 {
    font-family: Arial;
  }
  .hidden {
    display: none;
  }
  .queryResult {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 50%;
    height: 50%;
    overflow-x: auto;
  }
  .input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 50%;
    height: 100px;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
</style>
