module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          'sans': ['HelveticaNeueCyr', 'Helvetica', 'Arial', 'sans-serif'],
          'product': ['Google Sans Code', 'monospace'],
        },
        animation: {
          'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        }
      }
    }
  }