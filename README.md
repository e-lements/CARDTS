# CARDTS- Custom Elements for (Card) (Games)

** ALPHA!!! **

https://e-lements.github.io/CARDTS/

Has generic WebComponents to display cards... any card like HTML element

### Examples

* 52 playing cards (working on it)
    * Solitaire game 
    * Card Designer - design your own look
* [HogCardts](https://e-lements.github.io/hogcardts/) - (multimedia) Harry Potter themed Concentration game
    * https://e-lements.github.io/hogcardts/
* Game of SET
* Kanban/Scrum board

## Features

### Cardts core

* Custom Elements/Web Components
    * \<cardts-container>
    * \<cardts-area>
    * \<cardts-slot>
    * \<cardts-card>
* single file
* Event drive

### 52 Playing cards

* **one** file (no separate SVG files!)
* SVG cards are created client-side (thus fully configurable)
* standard Court(UK) / Face(USA) images (adds an extra 160 Kb)
* Smallest possible (minified) filesize:
  * cardts core 7 Kb
  * SVG elements 160 Kb
  * **total: ___SIZE52___ Kb (___SIZE52GZ___ GZipped)**

## Usage:
```
    <cardts-card rank="Ace" suit="Spade"><cardts-card>
```

## Motivation

I PEEK-ed and POKE-ed at the age of 10, and learned HTML (yes, a tat late) at 25  

In **1994** Web Development in the **Mosaic Browser** was easy.  
What I liked about **HTML 1.0** was its simplicity and the ability to 'peek at' and learn from someone else's effort.

Why has 'Web Development' in the past decade become *For-Rocket-Scientists-Only*?  
What happened to the days when all you needed where a handful of HTML tags and a headful imagination.

Feel free to PEEK around, and if you want to POKE make it an issue

## Theory

Solitaire - https://codepen.io/bfa/pen/ggGYeE

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


## Why and How I made SVG cards smaller

All good open-source SVG cards available are high-precision ready for print. SVG files can be made a lot smaller by reducing precision (https://jakearchibald.github.io/svgomg/)

Since card 2 and 9 (or any card) don't differ that much, building the SVG for cards client-side saves (some) code

(optional)
Use 2 court image for all 4 suits reduces the SVG fragments by over 50%

## Resources

#### Cards

* [The International Playing-Card Society](https://www.i-p-c-s.org/)

* SVG (serverside) Card Creator (I used these and altered them)  
https://www.me.uk/cards/makeadeck.cgi
* ES6/Polymer WebComponent - separate SVG files for courts (last commit:2017)  
https://www.webcomponents.org/element/vpusher/game-card
* CSS playing cards - PNG images (over 250 Kb) (last commit: 2012)  
https://donpark.github.io/scalable-css-playing-cards/
* HTML5 deck of cards (all 52 cards are separate SVG files) (last commit: 2017)  
https://github.com/pakastin/deck-of-cards  
https://deck-of-cards.js.org/
* CSS only (no Court images) (last commit: 2012)  
https://github.com/zachwaugh/Helveticards
* [Google Images playingcards](https://www.google.com/search?q=old+52+cards&tbm=isch&tbs=rimg:CQvmkLdr_14McIjgYvxv84K-eaVXk-0nLcJFF3OanFgQriEXAiZjXEp9zM2hJ2fYh1rUdAmXW8kROLnUlky-kQYhn7SoSCRi_1G_1zgr55pEZomC09EhU8oKhIJVeT7SctwkUURF50UBpuCFl0qEgnc5qcWBCuIRRGBNOuJrmaMECoSCcCJmNcSn3MzESHqEP4mrUbzKhIJaEnZ9iHWtR0R9s1Zi32qMiwqEgkCZdbyRE4udRFP-xbZjpVQIioSCSWTL6RBiGftEX2c9kdcxbzu&tbo=u&sa=X&ved=2ahUKEwjCgrW0x6nhAhXCDOwKHbHpDiIQ9C96BAgBEBs&biw=1920&bih=947&dpr=1#imgrc=GL8b_OCvnml8hM:)

* Solitaire
    * Redux,React, the lot https://codepen.io/HunorMarton/details/rwpGXj

#### SVG
* SVGO GUI - https://jakearchibald.github.io/svgomg/
* http://www.petercollingridge.appspot.com/svg-editor

#### LZMA compression
* http://lzma-js.github.io/LZMA-JS/demos/advanced_demo.html
* https://github.com/LZMA-JS/LZMA-JS
* https://dafrok.github.io/gzip-size-online/
* Analyze GZ compression:  
https://encode.ru/threads/1889-gzthermal-pseudo-thermal-view-of-Gzip-Deflate-compression-efficiency

#### Tools/Utilities
* Reduce SVG path precision (doesn't optimize paths like SVGO does)  
https://jsfiddle.net/dannye/austjc1y/

## Known Issues

* letters can not be Emoji 
* when outputting to SVG (default is IMG with SVG as ``data:image/svg+xml`` ) custom letters can't be used (bug) and are ignored


# Challenge - built your own game

Create FreeCell with HTML Custom Elements

inspiration: https://www.free-freecell-solitaire.com/freecell.html

**(something like) This HTML should create ALL game functionality**

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
