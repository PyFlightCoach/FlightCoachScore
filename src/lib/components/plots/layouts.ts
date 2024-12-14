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