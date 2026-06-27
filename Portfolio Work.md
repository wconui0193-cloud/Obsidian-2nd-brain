# Portfolio Page Development

## What Changed

### Layout Alignment
- Changed padding from `7%` to `5%` across all sections
- Removed `max-width: 1400px` centering from grid
- Now all sections (header, grid, CTA) use consistent `5%` padding
- **Result:** No more horizontal misalignment

### Card Improvements
- Removed all broken HTML tags (`1</span>` through `8</span>`)
- Bar moved from bottom to top of card
- Added padding increase: `9px 14px` → `14px 18px`
- Gap increased: `10px` → `12px`

### Discover Case Animation
- Fixed clip reveal animation
- Changed from `y: '110%'` percentage to pixel values
- Proper height measurement before animation

### Typography
- Added Qanelas Heavy font support
- Bar elements use Qanelas Heavy
- "Discover Case" text uses Qanelas Heavy with tight letter-spacing

### Links
- All 8 industry cards have clickable "Discover Case" links
- Links point to individual case study pages
- Orange hover effect: `color: #FF6A00`

---

## Grid Structure
- 2 columns on desktop
- 18px gap between cards
- Max-width: None (uses 5% padding)
- Cards are 1:1 square (aspect-ratio: 1/1)

## File Structure
```
portfolio.html
├── Header (port-header)
├── Grid (port-grid)
│   ├── Card 1: HVAC
│   ├── Card 2: Roofing
│   └── ... (8 total)
├── CTA Band (port-cta)
└── Footer
```
