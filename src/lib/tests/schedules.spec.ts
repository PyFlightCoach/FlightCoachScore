import { describe, expect, it } from 'vitest';
import {requestSchedules, ScheduleLibrary} from '$lib/schedule/library';
import { dbServerAddress, dbServer } from '$lib/api/api';




describe('Loading Schedules', async () => {
  dbServerAddress.set('http://localhost:8000');    
  const schedules = await requestSchedules({ owner: 'thomasdavid0@googlemail.com' });

  it('should contain some schedules', async ()=>{
    expect(schedules.length).toBeGreaterThan(0);
  });



});

describe ('Schedule Library', async () => {
  dbServerAddress.set('http://localhost:8000');    
  const library = new ScheduleLibrary(await requestSchedules({ owner: 'admin@fcscore.org' }));

  it('should subset the library', async ()=>{
    expect(library).toBeDefined();
    expect(library.schedules.length).toBeGreaterThan(0);
    expect(library.subset({schedule_name: 'p25'}).only.schedule_name).toBe('p25');
    expect(library.subset({category_name: 'f3a'}).length).toBe(6);
  });

  it('should return unique values', async ()=>{
    expect(library.unique('owner_name')).toEqual(['Fcscore Admin']);
  })

  it('should append unique schedules to a library', async ()=>{
    let lib = new ScheduleLibrary();
    expect(lib.length).toBe(0);
    const new_schedules = await requestSchedules({ owner: 'admin@fcscore.org' });
    lib = lib.append(new_schedules); 
    expect(lib.length).toBeGreaterThan(0);
    const lib2 = lib.append(new_schedules); 
    expect(lib2.length).toEqual(lib.length);
  })

})