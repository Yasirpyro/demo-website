# Photo replacement guide

Put source files in assets-src and run npm run images. The pipeline generates widths 480, 960, 1600 and inline tiny WebP previews. Missing images use branded fallback tiles without an HTTP request.

| Filename    | Content                   | Crop                                    |
| ----------- | ------------------------- | --------------------------------------- |
| tikka.jpg   | Chicken tikka on a plate  | hero 5:4 desktop, 4:5 mobile; cards 4:3 |
| karahi.jpg  | Chicken curry in a karahi | 4:3                                     |
| biryani.jpg | Chicken biryani           | 4:3                                     |
| kebab.jpg   | Seekh kebab               | 4:3                                     |
| naan.jpg    | Tandoori naan             | 4:3                                     |
| chai.jpg    | Karak chai                | 4:3                                     |

Photos illustrate representative dishes, not a real restaurant?s serving sizes. Replace them with the prospect?s own photos before commercial use.
