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
