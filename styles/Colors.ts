// src/styles/Colors.ts;

const Base = {
    Grey: {
        UltraLight: '#f2f2f2',
        Lighter: 'e5e5e5',
        Light: '#d3d3d3',
        Default: '#808080',
        Dark: '#a9a9a9',
        Darker: '#404040',
        UltraDark: '#0c0c0c',
    },
    Red: {
        Default: '#ff0000',
        Dark: '#8b0000',
    },
    White: {
        Default: '#ffffff',
    },
};

export default {
    Background: {
        Default: Base.Grey.Default,
        White: Base.White.Default,
        Hover: Base.Grey.Light,
    },
    Border: Base.Grey.Dark,
    Text: {
        Error: {
            Default: Base.Red.Default,
            Hover: Base.Red.Dark,
        },
    },
};