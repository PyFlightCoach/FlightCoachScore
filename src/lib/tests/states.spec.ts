import { describe, expect, it } from 'vitest';
import {States} from '$lib/utils/state';
import * as fs from 'fs';


describe('ScheduleIndex', async () => {

  const stcsv = fs.readFileSync('static/st.csv').toString();


  it('should parse states from a csv', async ()=>{
    const sts = States.read_csv(stcsv);
    expect(sts).toBeDefined();
    expect(sts.data.length).toBeGreaterThan(0);
    expect(sts.data[0].x).toBeDefined();
    expect(sts.data[sts.data.length-1].x).toBeDefined();
  });


});

