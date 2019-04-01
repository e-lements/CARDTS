<<<<<<< HEAD

### Known Issues

* letters can not be Emoji 
* when outputting to SVG (default is IMG with SVG as ``data:image/svg+xml`` ) custom letters can't be used (bug) and are ignored

### Resources

https://www.me.uk/cards/makeadeck.cgi

https://deck-of-cards.js.org/

http://www.petercollingridge.appspot.com/svg-editor

https://jakearchibald.github.io/svgomg/

http://lzma-js.github.io/LZMA-JS/demos/advanced_demo.html
https://github.com/LZMA-JS/LZMA-JS

https://www.google.com/search?q=old+52+cards&tbm=isch&tbs=rimg:CQvmkLdr_14McIjgYvxv84K-eaVXk-0nLcJFF3OanFgQriEXAiZjXEp9zM2hJ2fYh1rUdAmXW8kROLnUlky-kQYhn7SoSCRi_1G_1zgr55pEZomC09EhU8oKhIJVeT7SctwkUURF50UBpuCFl0qEgnc5qcWBCuIRRGBNOuJrmaMECoSCcCJmNcSn3MzESHqEP4mrUbzKhIJaEnZ9iHWtR0R9s1Zi32qMiwqEgkCZdbyRE4udRFP-xbZjpVQIioSCSWTL6RBiGftEX2c9kdcxbzu&tbo=u&sa=X&ved=2ahUKEwjCgrW0x6nhAhXCDOwKHbHpDiIQ9C96BAgBEBs&biw=1920&bih=947&dpr=1#imgrc=GL8b_OCvnml8hM:


https://dafrok.github.io/gzip-size-online/

https://encode.ru/threads/1889-gzthermal-pseudo-thermal-view-of-Gzip-Deflate-compression-efficiency

Reduce SVG path precision (doesn't optimize paths like SVGO does)
https://jsfiddle.net/dannye/austjc1y/
=======
# CARDTS- Custom Elements for (Card) (Games)

I PEEK-ed and POKE-ed at the age of 10, and learned HTML (yes, a tat late) at 25  
When you cross the big Five-Oh, thoughts of endless possibilities are taken over by glorious memories.

What I liked about HTML 1.0 was its simplicity and the ability to 'peek at' and learn from someone else's effort.  
Why did Web Development in the past decade become *For-Rocket-Scientists-Only*?  
What happened to the days when all you needed where a handful of HTML tags and a headful imagination.

If Web Development in the Mosaic Browser was simple in 1994, then why can it not be simple now?

I am getting ready for the next 50 years,  
most likely a future where I only remember what I learned in the first 10 years of my life.  
So, this code is for myself.

Feel free to PEEK around, and if you want to POKE make it an issue, I will listen

## Theory

Create FreeCell with HTML Custom Elements

inspiration: https://www.free-freecell-solitaire.com/freecell.html

**This HTML should create ALL game functionality**

```html
  <cardts-game>
    <cardts-pile id="freecells" type="any">
      <% 4 times %>
        <cardts-pile max=1></cardts-pile>
      <%%>
    </cardts-pile>
    <cardts-pile id="foundation" type="stack">
      <% 4 times %>
        <cardts-pile></cardts-pile>
      <%%>
    </cardts-pile>
    <cardts-pile>
      <% 8 times %>
        <cardts-pile type="sequence"></cardts-pile>
      <%%>
    </cardts-pile>
    <cardts-deck type="frenchdeck"></cardts-deck>
  <cardts-game>
```
>>>>>>> 3201eeb1130d1a85da4ef94149b684939fb44cba
