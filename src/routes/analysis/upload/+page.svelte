<script lang='ts'>

  import navBarContents from "$lib/stores/navBarContents";
  import UploadMenu from './UploadMenu.svelte';
  $navBarContents = UploadMenu;

</script>


<div>
	<h4>1 - Load Flight</h4>
	<list>
		<li>Data can be extracted from an ardupilot BIN file and / or a flight coach json file.</li>
		<li>
			If both a bin file and a fc json file are available the flight data will be extracted from the
			BIN file and the json file will be used for other information such as the flightline and
			manoeuvre splitting.
		</li>
		<li>
			If a bin file is not available the flight data can also be extracted from the fc json file,
			but this is not ideal as some information must be calculated and the calculation is less
			accurate.
		</li>
	</list>

	<h4>2 - Define the Box</h4>
	<list>
		<li>
			Use the box dropdown to defined the aerobatic box. Either set the pilot position and heading
			manually or by loading an F3A zone file or a FC json file.
		</li>
		<li>
			Once the flight data and box has been loaded select 'Create State' to move onto the next
			stage, where manoeuvre splitting can be selected or confirmed.
		</li>
	</list>

	<h4>3 - Define the Manoeuvres</h4>
	<list class="space-y-1 text-gray-500 dark:text-gray-400">
		<li>
			The manoeuvre splitting can be done manually by selecting each manoeuvre and its end point.
		</li>
		<li>
			If a FC json file is available the manoeuvre splitting is loaded from that by default, you can
			also load the splitting from an FC JSon at this stage.
		</li>
		<li>
			Manual splitting is best done from the start. First adjust the plot so that the region up to
			the start of the first manoevure is visible by sliding the slider, clicking on the ribbon or
			pressing the 'a' and 'd' keys.
		</li>
		<li>
			When the you are happy with the split location click on 'Set Range' in the table, or press the
			's' key.
		</li>
		<li>Carry on selecting each manoeuvre and its end point for the whole flight.</li>
		<li>
			A flight does not need to contain all the manoevures from a schedule in order, but it can only
			be used as a valid competition flight if it does.
		</li>
		<li>
			For a competition flight then the correct direction of each manoeuvre is established based on
			the direction in which the first manoeuvre was flown. For a training flight the direction is
			assumed to be correct.
		</li>
		<li>
			When you have finished splitting the manoeuvres click on 'Setup Analysis' to move onto the
			next stage.
		</li>
	</list>
</div>
