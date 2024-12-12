<script lang="ts">
	import navBarContents from '$lib/stores/navBarContents';
  import {base} from '$app/paths';
	$navBarContents = undefined;


</script>

<div class="container-fluid text-center mt-5" style="max-width:800px; ">
	<div class="row align-items-center ">
		<p>
			Flight Coach Score facilitates automatic judging of aerobatic flights and offers a place to
			share your scores. Use the tools above to get started or click 
      <a 
        href="#help"
        data-bs-toggle="offcanvas"
        data-bs-target="#help"
      >
        here
      </a>
      for more info.
		</p>
	</div>

  <div class="row pt-5">
  <div id="carouselExample" class="carousel slide carousel-dark">
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="{base}/images/leaderboard.png" class="d-block w-100" alt="...">
        <div class="carousel-caption d-none d-md-block  bg-light">
          <p>See how your flights compare to other pilots'.</p>
        </div>
      </div>
      <div class="carousel-item">
        <img src="{base}/images/intra_analysis.png" class="d-block w-100" alt="...">
        <div class="carousel-caption d-none d-md-block  bg-light">
          <p>Understand why you received every downgrade.</p>
        </div>
      </div>
      <div class="carousel-item">
        <img src="{base}/images/templates.png" class="d-block w-100" alt="...">
        <div class="carousel-caption d-none d-md-block  bg-light">
          <p>View your flights alongside aligned perfect templates.</p>
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="false"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="false"></span>
      <span class="visually-hidden">next</span>
    </button>
  </div>
</div>
</div>
