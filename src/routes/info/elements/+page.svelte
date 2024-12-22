<h1>Element Splitting</h1>
<p>
Each manoeuvre is built up from a number of principal elements flown sequentially. These may be loops, lines, stallturns, spins or snaps (tailslides to follow). Identifying the principal elements within the flight data for a manoeuvre is one of the most challenging tasks in automatically scoring a flight, even though it is something a human judge can perform very easily. 
</p>
<h2>Dynamic Time Warping</h2>
<p>
In FCScore the task is achieved by comparing the recorded flight data to a computer generated set of template flight data. A [Dynamic Time Warping](https://cs.fit.edu/~pkc/papers/tdm04.pdf) algorithm is used, which finds the optimal alignment between two time series which may vary in the time axis. The element split locations may then be copied from the template data along the warping path produced by the DTW algorithm. 
</p>
<h2>DTW in Two Stages</h2>
<p>
Additional complexity is added as it is not known in advance which roll and yaw directions a pilot chooses. This is overcome by running the DTW process twice, first with the absolute roll and yaw directions from both the flown and template data sets. A new template is then constructed based on the results of the initial alignment with the roll and yaw directions adjusted to match measurements of the flown elements. In addition the other parameters such as loop diameter, roll rate and speed are also adjusted to match. The DTW algorithm is then run again based on this new template to produce a more accurate alignment. 
</p>
<h2>Split Point Optimisation</h2>
<p>
The DTW element splitting only produces an initial guess of the split locations. In order to get the best results the Intra element scores are calculated and each element split location is adjusted in turn in order to find the minimum possible total downgrade for the two surrounding elements. The adjustment is performed by a very simple local optimiser. We are treating the multivariant global optimisation problem as lots of single variable local optimisations, which is usually a reasonable assumption as the initial guess from the DTW process should be close to the final result.
</p>
<h2>When Each Stage is Run</h2>
<p>
Both the DTW alignment and the split optimisation is performed when a manoeuvre is analysed for the first time. When a manoeuvre is re-run for a new analysis version only a split optimisation is performed with the initial guess taken from the split locations calculated by the analysis.

To reduce the storage required and upload times we do not keep all the detailed analysis information about each manouevre in the database. We just store the flight data, the manoeuvre scores and the element split locations. This means that in order to display the detailed analysis information for a flight loaded from the database or for the example flight the analysis needs to be re-run. When a manouevre is run for the same analysis version as before only the scores are calculated, the element split locations are not adjusted and the resulting score should be identical. 
</p>
<h2>What Can Go Wrong</h2>
<p>
In some cases the element splitting process can fail. This happens when the initial DTW aligment process has left the local optimisation process a long way away from the actual element split locations and you will almost certainly receive a zero for the manoeuvre.

There are a few conditions that can make the initial DTW alignment more likely to fail. 
</p>
<ul>
<li>If the manoeuvre level splitting is performed poorly, so that the split between manoeuvres is not in the straight line between manoeuvres but cutting into the loop or radius at the start or end of the manouevre. In this case go back to the flight/create/manouvre page and adjust the manoeuvre splitting.</li>
<li>In roll combinations with reversing roll elements, the initial absolute roll direction alignment can miss the change of roll direction.</li>
</ul>

<h2>How To Fix It</h2>
<p>
You can check and correct the alignment for a manouevre by clicking on the name of the manoeuvre in the results page, then selecting the alignment tab from there navbar. There You can either adjust the splits and press *score* to just calculate the scores without re-running the split point optimisation, or you can press *optimise* to run the split optimisation from the defined initial position.
</p>
<h2>Future Work</h2>
<p>
The alignment process is something I intend to improve significantly in future, as it is the most likely place for the analysis to fail and it is an intersting problem. There are two possible ways to go, one is to apply more robust global optimisation techniques, the other is to apply machine learning based techniques. The second approach will benefit hugely from the flight data uploaded to the database.
</p>