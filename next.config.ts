@import "tailwindcss";

@theme {
  --font-display: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
}

:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  background: #09090b;
}

body {
  margin: 0;
  min-width: 320px;
  background: #09090b;
  color: #f5f2ea;
  font-family: Arial, Helvetica, sans-serif;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
}

::selection {
  background: #e9682d;
  color: #111011;
}

.grid-noise {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 70% 18%, rgba(255, 255, 255, 0.07), transparent 24%);
  background-size: 48px 48px, 48px 48px, auto;
  mask-image: linear-gradient(to bottom, black, transparent 87%);
}

.orange-glow {
  background: rgba(233, 104, 45, 0.18);
}

.purple-glow {
  background: rgba(127, 95, 245, 0.12);
}
