const SEED_DATE = new Date("2026-01-01").toISOString();

export const SEED_PRODUCTS = [
  { id:1,  createdAt: SEED_DATE, title:"Classic Logo Tee",     cat:"men",      price:295, disc:0,  stock:"in",  quantity:50, img:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", img2:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", sizes:["XS","S","M","L","XL"],      desc:"Oversized cotton jersey with signature logo at neckline." },
  { id:2,  createdAt: SEED_DATE, title:"Track Pants",          cat:"men",      price:450, disc:0,  stock:"in",  quantity:30, img:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800", img2:"https://images.unsplash.com/photo-1594938298603-c8148c4b8b0b?w=800", sizes:["XS","S","M","L","XL"],      desc:"Technical track pants with side stripe and elasticated waist." },
  { id:3,  createdAt: SEED_DATE, title:"Windbreaker Jacket",   cat:"men",      price:890, disc:20, stock:"low", quantity:5,  img:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", img2:null, sizes:["S","M","L","XL"],            desc:"Water-resistant windbreaker with reflective detailing." },
  { id:4,  createdAt: SEED_DATE, title:"Bear Hoodie",          cat:"men",      price:680, disc:0,  stock:"in",  quantity:25, img:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800", img2:null, sizes:["S","M","L","XL","XXL"],      desc:"Premium heavyweight hoodie with all-over bear print." },
  { id:5,  createdAt: SEED_DATE, title:"Mini Logo Dress",      cat:"women",    price:520, disc:0,  stock:"low", quantity:7,  img:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800", img2:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800", sizes:["XS","S","M","L"],            desc:"Fitted mini dress with all-over logo print." },
  { id:6,  createdAt: SEED_DATE, title:"Palm Linen Blazer",    cat:"women",    price:1100,disc:30, stock:"in",  quantity:20, img:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800", img2:null, sizes:["XS","S","M","L","XL"],       desc:"Relaxed linen blazer with peak lapels." },
  { id:7,  createdAt: SEED_DATE, title:"Logo Skirt",           cat:"women",    price:410, disc:0,  stock:"low", quantity:8,  img:"https://images.unsplash.com/photo-1594938298603-c8148c4b8b0b?w=800", img2:null, sizes:["XS","S","M","L"],            desc:"High-rise midi skirt with contrast logo waistband." },
  { id:8,  createdAt: SEED_DATE, title:"Cashmere Turtleneck",  cat:"women",    price:750, disc:10, stock:"in",  quantity:15, img:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", img2:null, sizes:["XS","S","M","L"],            desc:"Luxuriously soft cashmere turtleneck." },
  { id:9,  createdAt: SEED_DATE, title:"Logo Shorts",          cat:"men",      price:320, disc:25, stock:"in",  quantity:40, img:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800", img2:null, sizes:["XS","S","M","L","XL"],       desc:"Mesh basketball shorts with large varsity logo print." },
  { id:10, createdAt: SEED_DATE, title:"Mini Logo Tee Kids",   cat:"children", price:185, disc:0,  stock:"in",  quantity:60, img:"https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800", img2:null, sizes:["4Y","6Y","8Y","10Y","12Y"],  desc:"Junior version of the signature logo tee." },
  { id:11, createdAt: SEED_DATE, title:"Track Suit Kids",      cat:"children", price:390, disc:15, stock:"in",  quantity:22, img:"https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800", img2:null, sizes:["4Y","6Y","8Y","10Y"],        desc:"Mini-me version of the adult tracksuit." },
  { id:12, createdAt: SEED_DATE, title:"Bear Zip Hoodie Kids", cat:"children", price:280, disc:0,  stock:"low", quantity:6,  img:"https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800", img2:null, sizes:["4Y","6Y","8Y","10Y","12Y"],  desc:"Full-zip hoodie with bear logo graphic." },
];

export const SEED_BANNER = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600";

export const SEED_CATEGORY_IMAGES = {
  women:    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700",
  men:      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700",
  children: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=700",
};
