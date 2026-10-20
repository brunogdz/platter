# Best Sellers UI preview

A static, responsive HTML product-card showcase styled with locally compiled Tailwind CSS and a small vanilla JavaScript enhancement. It is a visual demo, not a store: product names, prices, review counts and links are illustrative and do not represent purchasable inventory.

## Build

Requires Node.js and npm. From this directory:

```sh
npm ci
npm run build
```

The build writes the compiled stylesheet to `assets/styles.css`. Open `index.html` directly or serve this folder as static files. All project asset and stylesheet links are relative, so the page works at a GitHub Pages project path such as `/platter/`. Fonts and product photography load from Google Fonts and Unsplash.

On desktop, scroll the horizontal product rail with a trackpad, keyboard focus on its scrollbar, or drag the scrollbar. On small screens, the first four products are shown initially and Show More reveals the rest. Without JavaScript every product remains visible.
