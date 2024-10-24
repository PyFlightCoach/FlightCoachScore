<script lang='ts'>

  
    import Plot from 'svelte-plotly.js';
    import {modeltrace, ribbon} from '$lib/plots/traces';
    import {layout3d} from '$lib/plots/layouts';    
    import {Checkbox, BottomNav, BottomNavItem} from 'flowbite-svelte';
    import { analyses, selManID, fcj} from '$lib/stores';
    import type {States} from '$lib/state';
    import colddraft from '$lib/plots/colddraft.js';
    
    $: man = analyses[$selManID];
 
  
    const make_trace = (tp: States, models: boolean, name: string, color: string) => {
      const trs = [ribbon(tp, 5, {}, {name, color})]
  
      if (models) {
        trs.push(...modeltrace(tp.downsample(20), colddraft, {name, color}));
      }
      return trs;
    }
  
    const make_traces = (bf: boolean, bi: boolean, bc: boolean) => {
      const trs = [];
      if (bf) {trs.push(...make_trace($man.flown, true, 'flown', 'red'))}
      if (bi) {trs.push(...make_trace($man.template!, true, 'intended', 'blue'))}
      if (bc) {trs.push(...make_trace($man.corrected_template!, true, 'corrected', 'green'))}
      return trs
    }
  
    let flown=true; let intended=true; let corrected=true;
  
    $: all_traces=make_traces(flown, intended, corrected);
    
    
  </script>

<div>
  <div style:height=100%>  
    <Plot 
      data={all_traces} 
      layout={layout3d} 
      fillParent={true} 
    />
  </div>
  <BottomNav classInner="grid-cols-5" >
    <BottomNavItem><Checkbox bind:checked={flown}>Flown</Checkbox></BottomNavItem>
    <BottomNavItem><Checkbox bind:checked={intended}>intended</Checkbox></BottomNavItem>
    <BottomNavItem><Checkbox bind:checked={corrected}>corrected</Checkbox></BottomNavItem>
  </BottomNav>
</div>
  
