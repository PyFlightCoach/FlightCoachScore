<script lang='ts'>
  import { analyses, selManID, fcj } from '$lib/stores';
    import {P} from 'flowbite-svelte';
  import { AccordionItem, Accordion } from 'flowbite-svelte';
  import PlotInter from '$lib/plots/PlotInter.svelte';
	import { d3Color, colscale, redsColors } from '$lib/plots/styling.js';

  $: man = analyses[$selManID];
  $: states = $man?.flown.split();
  
</script>

{#if man}
<Accordion>

  {#each Object.values($man.mdef.mps) as mp}
    
    <AccordionItem>
      <span slot="header">{mp.name} (dg={mp.name in $man.scores.inter.data ? $man.scores.inter.data[mp.name].total.toFixed(2) : 0})</span>
      {#if mp.name in $man.scores.inter.data}
      
        <div class='container'>
          <div class='cell'>Collector</div>
          <div class='cell'>Value</div>
          <div class='cell'>Error</div>
          <div class='cell'>Visibility</div>
          <div class='cell'>Downgrade</div>

          {#each Object.values(mp.collectors) as co, i}            
            <div class='cell' style:background-color={d3Color(i)}>{co}</div>
            <div class='cell'>{$man.scores.inter.data[mp.name].sample[i].toFixed(2)}</div>
            <div class='cell'>{$man.scores.inter.data[mp.name].errors[i].toFixed(2)}</div>
            <div class='cell'>{$man.scores.inter.data[mp.name].measurement.visibility[i].toFixed(2)}</div>
            <div class='cell' style:background-color={colscale(
              $man.scores.inter.data[mp.name].dgs[i], 
              $man.scores.inter.data[mp.name].total, redsColors
            )}>{$man.scores.inter.data[mp.name].dgs[i].toFixed(2)}</div>
          {/each}
        </div>

        <div style:height=600px>
          <PlotInter 
            sts={states} 
            activeEls={mp.getCollectorEls(Object.keys($man.mdef.eds))}
          />
        </div>
        
        
      {:else}
        <P>This parameter is not downgradable. This is probably because it is just used to ensure the correct manoeuvre is flown by constraining the options on roll direction.</P>
      {/if}


    </AccordionItem>

    
  {/each}
</Accordion>
{:else}
  <div>no data</div>
{/if}

<style>
  .cell {color: black; height:100%; width: 100%; display: flex;
align-items: center; justify-content: center;}
  .container {
    display:grid; 
    grid-template-columns: 2fr repeat(4, 1fr);
    text-align: center;
  }
</style>