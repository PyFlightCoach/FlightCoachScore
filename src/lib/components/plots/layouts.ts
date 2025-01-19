import type { States } from '$lib/analysis/state';
import {max, min} from '$lib/utils/arrays';


export const layout3d = {
    legend: {font: {size: 20}, yanchor: "top", y: 0.99, xanchor: "left", x: 0.01},
    //autosize: true,
    margin: {l:0, r:0, t:0, b:0},
    scene: {
        aspectmode:'data',
        camera: {
            up: {x:0, y:0, z:1},
            center: {x:0, y:0, z:0},
            eye: {x:0, y:-2, z:-1},
            projection:{type:'perspective'}
        },
        xaxis: {},
        yaxis: {},
        zaxis: {},
        aspectratio: {},
    }
};

export const create3DLayout = (sts: States, includeZero: boolean = false, expand: number=0, hideAxes: boolean=false) => {

  const newlayout = structuredClone(layout3d);
  const ranges = {
    x: sts.plotRange('x', includeZero, expand),
    y: sts.plotRange('y', includeZero, expand),
    z: sts.plotRange('z', includeZero, expand)
  };

  newlayout.scene.xaxis = { range: ranges.x, visible: !hideAxes };
  newlayout.scene.yaxis = { range: ranges.y, visible: !hideAxes };
  newlayout.scene.zaxis = { range: ranges.z, visible: !hideAxes };
  newlayout.scene.aspectmode = 'manual';

  const max_range = Math.max(
    ranges.x[1] - ranges.x[0],
    ranges.y[1] - ranges.y[0],
    ranges.z[1] - ranges.z[0]
  );
  //
  newlayout.scene.aspectratio = {
    x: (ranges.x[1] - ranges.x[0]) / max_range,
    y: (ranges.y[1] - ranges.y[0]) / max_range,
    z: (ranges.z[1] - ranges.z[0]) / max_range
  };
  return newlayout;

}



export const get_ar = (data: Record<string, any>[], offset: number=20) => {

    const axes: Record<string, Record<string, number[]>> = {};
    const ranges: Record<string, number> = {};

    ['x', 'y', 'z'].forEach(d=>{
        let maxlim: number=data[0][d][0];
        let minlim: number=data[0][d][0];
        Object.values(data).forEach(v=>{
            maxlim  = max([maxlim, ...v[d]]);
            minlim  = min([minlim, ...v[d]]) ;
        });
        if ((maxlim!=null) && (minlim!=null)) {
            maxlim = maxlim + offset;
            minlim = minlim - offset;
            const range = maxlim - minlim;
    
            axes[d + 'axis'] = {range:[minlim, maxlim]};
            ranges[d] = range;
        }
    });

    const maxrange = Math.max.apply(0, Object.values(ranges));
    ['x', 'y', 'z'].forEach(d=>{
        ranges[d + 'axis'] = ranges[d] / maxrange;
    });
    
    return {...layout3d, 
        scene:{
            ...layout3d.scene,
            ...axes,
            aspectratio:ranges,
            aspectmode:'manual'
    }}
  
  }