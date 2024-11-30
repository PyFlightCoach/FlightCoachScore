import { describe, expect, it } from 'vitest';
import {Category, Schedule, Manoeuvre, loadSchedules, loadCategories} from '$lib/schedules';
import { dbServerAddress } from '$lib/api';
import { type Manoeuvre } from '$lib/database';




describe('ScheduleIndex', async () => {
  dbServerAddress.set('http://localhost:8000');    
  
  const si = await ScheduleIndex.load({category: 'f3a', owner: 'thomasdavid0@googlemail.com'});

  it('should parse schedules in a category', async ()=>{
    expect(si.p25).toBeDefined(); 
    expect(si.advanced2024).toBeUndefined();
  });

  it('should have some manoeuvres', async ()=>{
    expect(si.p25.manoeuvres[0].short_name).toBe('trgle');
  });

});


describe('CategoryIndex', async () => {
  dbServerAddress.set('http://localhost:8000');  
  const ci = await CategoryIndex.load();

  it('should parse categories', async ()=>{
    expect(ci.f3a).toBeDefined();  
    expect(ci.iac).toBeUndefined();
  });

  it('should have some schedules', async ()=>{
    expect(ci.f3a.p25).toBeDefined(); 
    expect(ci.f3a.advanced2024).toBeUndefined();
  });
});