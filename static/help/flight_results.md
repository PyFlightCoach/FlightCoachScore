## Analysis
The table in the middle of the page shows the sum of each group of downgrade (Intra, Inter, Positioning) and the total score (10 - Intra - Inter - Positioning) for each manoeuvre. If this is a flight that hasn't been scored before click *Run All* at the top of the table to analyse the whole flight, or *Run* on a table row to analyse a single manoeuvre. The analysis is performed on our server and usually takes a few minutes, but may take longer at busy times or if the internet connection is poor.

Once an analysis has been completed you can click on a row of the table to see more information about the analysis for that manoeuvre. 

### Alignment
Supplementary information about the element alignment process is available <a href="https://pyflightcoach.github.io/ScoringInfo/elements" target=”_blank” >here</a>. Read this if you are interested in how it works or if you are wondering why some scores are lower you expected.

## Downgrades
The downgrades are classified into three groups, you can click on a table cell to see more information on how the downgrade is calculated.
- **Intra** - downgrades relating to the execution of a single element (deviations in roll angle, track, loop curvature etc.)
- **Inter** - downgrades for errors in the relationships between elements, such as when two lines should have the same length or two loops the same radius.
- **Positioning** - Downgrades for positioning the manoeuvre, so box infringements and centering.

## Analysis Parameters
Once the analysis is complete the form on the left of the page allows you to select parameters relating to the analysis. The most reliable scores will always be from the latest analysis version, difficulty hard and not truncated.
- **Analysis Version** - We are continually improving the scoring process and will regularly upgrade the analysis server with these improvements. You can only run an analysis for the latest version, but if this flight was loaded from the database and has been run with a previous version you will be able to view the old scores for that version too. 
- **Difficulty** - Each individual downgrade is passed through an exponential curve before being added up, so that small downgrades have less effect. A hard zero (eg 90 degree roll error) will still be a hard zero though, giving a 10 mark downgrade in IAC and IMAC or a 6 mark dowgrade in F3A.
- **Truncate** - Each individual downgrade is rounded down to the nearest 0.5 marks before being added up. This is an attempt to mimic human judging.

## Upload

If you are logged in and this is a new flight or you have loaded one of your own flights from the database and changed something you will have some options to upload the flight in the form on the left. You will only be given these options if these conditions are true. 

- **Privacy** - This controls how much information other people can see about your flight. *Basic* means people will only see the scores and the origin. *view flown* also allows people to see a ribbon plot of your flight. *view analysis* lets people see all the analysis information that you can see here.
- **Comments** - Add some comments about your flight that people will be able to see.
- **Upload** - An upload button will appear if the conditions are met for uploading, if not a reason will be shown.