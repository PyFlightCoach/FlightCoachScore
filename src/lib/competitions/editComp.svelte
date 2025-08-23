<script lang="ts">
  import type {CompThingSummary, CompThingCreateUpdate} from '$lib/competitions/compInterfaces'
  import TextInput from '$lib/components/TextInput.svelte';
	
  let {compThing=$bindable()}: {compThing: CompThingSummary} = $props();

  let name: string = $state("")
  let comment: string | undefined= $state()
  
  let index = $derived(compThing.index);
  let what_am_i = $derived(compThing.what_am_i);
  
//  let date_start: Date | undefined = $state()
//  let date_end: Date | undefined = $state()

  function updateThing(thing: CompThingSummary) {
    name = thing.name;
    comment = thing.comment;
  }

</script>


<TextInput name={'Name*'} bind:value={name} classappend={name==compThing.name ? "" : "bg-warning"}/>
<TextInput name={'Comment'} bind:value={comment} classappend={name==compThing.name ? "" : "bg-warning"}/>
<button></button>