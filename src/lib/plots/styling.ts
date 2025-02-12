
export const plotlycolours = ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52'];

export const d3Colors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
  ];

export const d3Color = (i: number) => d3Colors[i % d3Colors.length];

export const burgColors = [
    'rgb(255, 198, 196)',
    'rgb(244, 163, 168)',
    'rgb(227, 129, 145)',
    'rgb(204, 96, 125)',
    'rgb(173, 70, 108)',
    'rgb(139, 48, 88)',
    'rgb(103, 32, 68)'
];

export const redsColors = [
"#ffffff",
"#fff5f2", 
"#ffede9", 
"#ffe4df", 
"#ffdbd5", 
"#ffd1ca", 
"#ffc8bf", 
"#ffbeb4", 
"#ffb3a9", 
"#ffa89d", 
"#ff9d90", 
"#ff9183", 
"#ff8476", 
"#ff7568", 
"#ff6559", 
"#fa594e", 
"#f44c44", 
"#ee3e39", 
"#e72e2e", 
"#e01b24", 
];

export const tealsColrs = [
"#ffffff",
"#f7f8fd", 
"#eff2fb", 
"#e6edfa", 
"#dde7f8", 
"#d3e1f6", 
"#cadbf5", 
"#c1d5f4", 
"#b7cff2", 
"#adc8f1", 
"#a3c2f0", 
"#98bcee", 
"#8db6ed", 
"#83afec", 
"#78a8ea", 
"#6da1e9", 
"#619ae7", 
"#5393e5", 
"#458be4", 
"#3584e4", 
]

export const yellColors = [
"#ffffff",
"#f8fcf6", 
"#f0faef", 
"#e8f8e9", 
"#e0f6e2", 
"#d7f4db", 
"#cef2d4", 
"#c5f0cd", 
"#bcedc6", 
"#b2ebbf", 
"#a9e9b8", 
"#9fe6b1", 
"#95e4ab", 
"#8ae1a4", 
"#7fdf9d", 
"#73dc95", 
"#67d98f", 
"#5ad689", 
"#49d381", 
"#33d17a", 
]

export const rainbowColors = ['rgb(150,0,90)',
'rgb(0,0,200)',
'rgb(0,25,255)',
'rgb(0,152,255)',
'rgb(44,255,150)',
'rgb(151,255,0)',
'rgb(255,234,0)',
'rgb(255,111,0)',
'rgb(255,0,0)'];

export const redblueColors = ['rgb(0,0,255)',
'rgb(13,0,241)',
'rgb(26,0,228)',
'rgb(40,0,214)',
'rgb(53,0,201)',
'rgb(67,0,187)',
'rgb(80,0,174)',
'rgb(93,0,161)',
'rgb(107,0,147)',
'rgb(120,0,134)',
'rgb(134,0,120)',
'rgb(147,0,107)',
'rgb(161,0,93)',
'rgb(174,0,80)',
'rgb(187,0,67)',
'rgb(201,0,53)',
'rgb(214,0,40)',
'rgb(228,0,26)',
'rgb(241,0,13)',
'rgb(255,0,0)'];



export const colscale = (v: number, vmax: number, scale: string[]) => {

    return scale[Math.round((scale.length-1)*Math.min(v,vmax)/vmax)];

}

//colour = lambda v, vmax, scale=px.colors.sequential.Burg: scale[int((len(scale)-1)*v/vmax)]