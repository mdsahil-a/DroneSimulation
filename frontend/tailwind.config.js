export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#F3F6F9',    
        panel: '#FFFFFF',  
        line: '#D3DCE3',    
        sand: '#1B2A33',    
        amber: '#B45F06',   
        alert: '#C93C2A',   
        ok: '#2E8B57',      
      },
      fontFamily: { sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'], mono: ['"IBM Plex Mono"', 'monospace'] },
    },
  },
  plugins: [],
}