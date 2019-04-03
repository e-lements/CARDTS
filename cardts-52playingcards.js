
!(function (document, window, marker) {
    console.log('executing svg_52cardts.js');
    let random = x => Array.isArray(x) ? x[random(x.length)] : 0 | x * Math.random();

    let draggingCard = false;
    let dragIMG = false;
    let dragEvent = false;
    function dragstart_handler(evt) {
        console.log("dragStart", evt.target, evt, evt.target.cardIMG);
        // Set the drag's format and data. Use the event target's id for the data 
        evt.dataTransfer.setData("text/plain", evt.target.id);
        draggingCard = evt.target;
        console.dir(draggingCard);
        dragIMG = new Image();
        dragIMG.src = evt.target.cardIMG.src;
        //        evt.dataTransfer.setDragImage(dragIMG, 10, 10);
        dragEvent = evt;
    }
    function dragover_handler(evt) {
        console.log(evt.target.cardIMG);
        //evt.target.cardIMG.src = draggingCard.cardIMG.src;
        dragIMG = new Image();
        dragIMG.src = evt.target.cardIMG.src;
        //      dragEvent.dataTransfer.setDragImage(dragIMG, 10, 10);
    }

    let Cardts = window[marker] = {
        //suitcolor: suit => '0S3C'.includes(suit) ? '#000' : 'red',//['black', 'red', 'blue', 'green'][suit],
        svg: [],
        random: () => Cardts.card(random(Cardts.suits), random(Cardts.ranks)),
        init: (settings = {
            ranks: 'A,1,2,3,4,5,6,7,8,9,10,J,Q,K',
            suits: 'S,H,D,C'
        }) => {
            Cardts.ranks = settings.ranks.split`,`;
            Cardts.suits = settings.suits.split`,`;

            let getCardtsAttrValue = (name) => {
                let value = this.getAttribute(name);
                let arr = Cardts[name + 's'];
                let nr = arr.includes(value);
                if (nr) nr = arr.indexOf(value);
                else nr = Number(value);
                return nr;
            }

            Cardts.extend('Zone', 'Pile', superclass => class extends superclass {
                constructor() {
                    super();
                }
            });

            Cardts.extend('Pile', 'Stack', superclass => class extends superclass {
                static get observedAttributes() {
                    return [];
                }
                constructor() {
                    super();
                }
                attributeChangedCallback(name, oldValue, newValue) {
                }
            });

            Cardts.extend('cardt', 'card', superclass => class extends superclass {
                static get observedAttributes() {
                    return ['suit', 'rank', 'pips', 'letters', 'suits', 'courts', 'cardborder_radius', 'cardborder_color', 'cardborder_width', 'backcolor', 'opacity'];
                }
                constructor() {
                    super();
                    this.attachShadow({ mode: 'open' });
                    this.shadowRoot.innerHTML = `<STYLE>:host{display:inline-block}img{width:100%}</STYLE>`;
                    //console.log('constructor', this.nodeName, this);
                }
                attributeChangedCallback(name, oldValue, newValue) {
                    if (oldValue) this.card();
                }

                get ranknr() {
                    return getCardtsAttrValue('rank');
                }
                get suitnr() {
                    return getCardtsAttrValue('suit');
                }
                random() {
                    clearInterval(this.interval);
                    this.interval = setInterval(() => {
                        this.cardIMG.src = Cardts.random().src;
                    }, 0);
                }
                draggable() {
                    this.ondragstart = dragstart_handler;
                    this.ondragover = dragover_handler;
                    this.draggable = "true"
                }
                card() {
                    let cardSettings = {
                        card_colorbackground: 'whitesmoke',     // default is #FFF
                        opacity: 0.9                            // default is 0.8
                    }
                    // create one Object from all (String) attributes
                    cardSettings = this.constructor.observedAttributes
                        .reduce((attrSettings, attr) => {
                            let value = this.getAttribute(attr);
                            if (value && typeof value != 'string') console.error('CARDTS: not a string attribute', attr, value);
                            if (value) Object.assign(attrSettings, { [attr]: value });
                            return attrSettings;
                        }, cardSettings);
                    let card = Cardts.card(cardSettings);// default returns IMG
                    if (typeof card === 'string') {
                        this.shadowRoot.innerHTML = card;
                    }
                    else {
                        // if image was already created
                        if (this.cardIMG) {
                            // only replace the image src
                            this.cardIMG.src = card.src;
                        } else {
                            // create a new IMG 
                            this.cardIMG = this.shadowRoot.appendChild(card);
                            this.draggable = false;
                        }
                    }
                }
                connectedCallback() {
                    this.card();
                }
            })
        },// << init
        newCard: (settings) => {
            let card = document.createElement('CARDTS-CARD');
            let keys = Object.keys(settings);
            keys.forEach(attr => {
                try {
                    card.setAttribute(attr, settings[attr])
                } catch (e) {
                    console.warn('newCard', settings, keys, e);
                }
            });
            card.id = 'CARD_' + settings.rank + settings.suit;
            return card;
        },

        addCards: (zone = document.body) => {
            //ranks = [1, 2, 3, 4, 5, 10, 'J', 'Q', 'K', 0];
            //ranks = ['J', 'Q'];
            //suits = ['H'];
            ranks = Cardts.ranks;
            suits = Cardts.suits;
            suits.map(suit => {
                ranks.map(rank => {
                    let card = CARDTS.newCard({ suit, rank });
                    // card.setAttribute('pips', 'SbSdefghiHk');
                    // card.setAttribute('pips', 'SSSHHHCCCDD');
                    // card.setAttribute('cardborder_radius', String(random([10, 20, 30])));
                    zone.appendChild(card);
                });
            });
        }
    }

    Cardts.cardString = (title) => {
        let fragment = document.createDocumentFragment();
        title.split('').map((letter, idx) => {
            let suit = random([0, 1, 2, 3]);
            let rank = random([11, 12, 13])
            if (idx == 6) rank = 0;
            if (idx == 0 || idx == 7) {// Ace of Spades
                suit = 0;
                rank = 1;
            }
            let letterCard = Cardts.newCard({ suit, rank });
            letterCard.setAttribute('letters', letter.repeat(4)); //4 letters for default Ace,Jack,Queen,King cards
            let card = fragment.appendChild(letterCard);
        })
        return fragment;
    }

})(document, window, 'CARDTS');

window['CARDTS'].card = (
    // card attributes
    {
        logging = 0,

        suit,
        rank,

        pips = false,           // see pips below, custom 'abcdefghijk' string define pip locations
        letters = false,        // default:false displays standard JQK with SVG
        //letters = 'AJQK',     // set Ace , Jack , Queen, King letters with Arial font
        //letters = 'ABVH',     // A,B,V,H = Aas,Boer,Vrouw,Heer (Dutch language)
        courts = '012',         // default 0,1,2 is JQK order
        suits = '0123',         // default 0,1,2,3 is standard court images: Spades, Hearts, Diamonds, Clubs
        suitcolor = suit => '0S3C'.includes(suit) ? '#000' : 'red',//['black', 'red', 'blue', 'green'][suit],

        backcolor = '#ea4848',          // card backside color index NR 0=blue 1=red

        card_colorbackground = '#FFF',

        opacity = .8,
        cardborder_radius = 12,
        cardborder_color = '#000',
        cardborder_width = '1.5',

        //colors for court image:
        court_color_rect = '#44F',
        court_color_gold = '#E8B23B',   //'#FC4';        // ['#FC4', 'gold', 'gold'][courtRank];
        court_color_red = 'red',        // ['green', 'red', 'orange', 'lightblue'][1];
        court_color_blue = '#44F',      // blue/prurple 44F //eyes and robe
        court_color_black = '#000',
        court_color_detail = '#000',
        court_color = false,            // shorthand (textArray) overrules above
        court_sharpness = 4,            // higher is thicker stroke for black detail lines in courts
        court_reverse = false,          // todo add reverse

        label = 'CARDTS',
        outputSVG = 0,          // default(0) output IMG with SVG as data, else return SVG string
        pipletters = 0,         // for designing new cards with different pip layout/order
        pips_topoffset = 0,     // wider vertical space between pips
    }
) => {
    if (outputSVG && letters) {
        console.warn('ignoring custom letters attribute, set outputSVG to true (default)');
        letters = false;            // open bug: output to SVG ignores custom letters
    }
    if (!courts.match(/[012][012][012]/g)) {
        console.error('Corrected courts definition', courts, 'to 012');
        courts = '012';
    }
    if (!suits.match(/[0123][0123][0123][0123]/g)) {
        console.error('Corrected suits definition', suits, 'to 0123');
        suits = '0123';
    }

    if (backcolor == '1') backcolor = '#5464f3';//blue
    let getColor = (arr, idx) => arr.includes(',') ? arr.split(',')[idx] : arr;
    if (court_color) {
        if (court_color == 'ghost') court_color = 'orange,lightcoral,lightblue,grey,black';
        court_color = court_color.split(',');
        court_color_gold = court_color[0];
        court_color_red = court_color[1];
        court_color_blue = court_color[2];
        court_color_black = court_color[3];
        court_color_detail = court_color[4];
    }

    // let courtsIndex = 22;
    // letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(courtsIndex, courtsIndex + 4);
    let marker = 'CARDTS';
    let Cardts = window[marker];

    //design card back side
    let back_dotsize = 10;
    let back_label = label;
    let back_label_color = '#777';

    if (!Cardts.svg) setTimeout(() => {
        console.log('delay');
        window['CARDTS'].card(suit, rank);
    }, 50);

    let rankStr = marker + 'rank';
    let suitStr = marker + 'suit';
    let rankFont = 'Arial';                     // when letters is set
    let rankFontSize = 40;
    let SVGpaths = Cardts.svg || paths;
    let isString = x => typeof x == 'string';
    let parseAttribute = (x, n = -1) => {
        let y = isString(x) ? x.split(x.includes(',') ? ',' : '') : x;
        return n > -1 ? y[n] : y;
    }

    let upperCase = x => String(x).toUpperCase();

    if (isString(suit)) {
        try {
            if (['0', 'S', 'SPADES', 'SPADE'].includes(upperCase(suit))) suit = 0;
            if (['1', 'H', 'HEARTS', 'HEART'].includes(upperCase(suit))) suit = 1;
            if (['2', 'D', 'DIAMONDS', 'DIAMOND'].includes(upperCase(suit))) suit = 2;
            if (['3', 'C', 'CLUBS', 'CLUB'].includes(upperCase(suit))) suit = 3;
        } catch (e) {
            console.error(suit, typeof suit, e);
        }
    }
    if (isString(rank)) {
        if ('A'.includes(rank)) rank = 1;
        if ('Jj'.includes(rank)) rank = 11;
        if ('Qq'.includes(rank)) rank = 12;
        if ('Kk'.includes(rank)) rank = 13;
    }
    if (rank == 0) suit = 0;
    if (suit < 0 || rank < 0) {
        console.error('incorrect suit and rank', suit, rank);
        return;
    } else {
        if (logging) console.log('new CARDTS card', suit, rank, pips, letters, courts);
    }
    let color_suit = suitcolor(suit);

    let cardId = suit + '_' + rank;

    let SVG_attr_fill = x => `fill='${x}'  fill-opacity='1'`;
    let SVG_strokefill = (x, y = 'none') => `stroke='${x}' fill='${y}' `;
    let SVG_attr_rotate = x => `rotate(${x})`;
    let dropshadow = ` style='filter:url(#shadow);' `;
    let whxy = (w, h, x, y) => {
        let svg_part = ``;
        if (w) svg_part += ` width='${w}'`;
        if (h) svg_part += ` height='${h}'`;
        if (x) svg_part += ` x='${x}'`;
        if (y) svg_part += ` y='${y}' `;
        return svg_part;
    }
    let SVG_rect = (w, h, x, y, radius, attrs) => `<rect ${whxy(w, h, x, y)} rx='${radius}' ry='${radius}' ${attrs}></rect>`;
    let SVG_text = (text, x = 0, y = 0, stroke = 'red', fill = 'red', size = 20, textanchor = 'middle') =>
        `<text x='${x}' y='${y}' stroke='${stroke}' text-anchor='${textanchor}'`
        + ` style='font-weight:600;font-family:${rankFont};letter-spacing:${String(text).includes(marker) ? 0 : -7}px;fill:${fill};stroke:none;font-size:${size}px;'>`
        + `${text}</text>`;
    let SVG_circle = () => `<circle width='100' height='100' cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='red' />`;
    let SVG_use_symbol = (href, w, h, x, y, transform = '') => `<use xlink:href='#${href + cardId}'` + whxy(w, h, x, y) + ` ${transform}></use>`;
    let SVG_symbol = (id, viewbox, path, attr, symbol_uses = []) =>
        `<symbol id='${id + cardId}' viewBox='${viewbox}' preserveAspectRatio='xMinYMid'  opacity='${opacity}' >`
        + `<path d='${path}' ${attr} ></path>`
        + `${symbol_uses.map(d => SVG_use_symbol(...d)).join('')}`
        + `</symbol>`;

    let uses_suit_rank = [//position of suits and ranks on card
        [rankStr, 0, letters ? 50 : 34, -115, -156],  // href,w,h,x,y
        [suitStr + suit, 0, rank > 9 ? 38 : 42, -119, -119],
    ].map(d => SVG_use_symbol(...d)).join``;

    let pips_on_card = [];
    let pips_labels = [];
    let mirrored_bottom_pips = [];
    if (rank > 0 && rank < 11) {
        pips = pips || [
            // 0abcdefghijk are BLANKs!
            // SHDC are 0123 =  Spades , Hearts , Diamonds , Clubs
            'abcdefghiPk', // rank 1/Ace
            'abcdePghijk', // rank 2
            //'aPcdefghiPk', // rank 3 - above
            'abPdefghi1k', // rank 3 - diagonal
            'PbPdefghijk', // rank 4
            'PbPdefghiPk', // rank 5
            'PbPdefghPjP', // rank 6
            'PbPdefgPPjP', // rank 7
            'PbPdefPhPjP', // rank 8 3+2+3
            'PbPPPfghiPk', // rank 9
            'PbPPPPghijk'  // rank 10
        ][rank - 1];
        pips.split``.map((pip_char, idx) => {
            let pipdata;
            let pipsize = 70;
            let pipXcenter = -pipsize / 2;                          // -35
            let pipXright = -pipXcenter / 2;                        // -17.5
            let pipXleft = -pipsize - pipXright;                    // -87.5
            let pipYtop = (rank == 9 || rank == 10) ? -130 : -122;  //-pipsize * 2; // -140 (-135.5);
            pipYtop -= pips_topoffset;
            let pipY10center = -102;                                // 38 /2 19
            let pipY78center = -85.25;                              // 16.75
            pipY78center = -90.25;                              // 16.75
            let pipY910center = -68.5;                              // 16.75
            if (pips_topoffset) pipY910center -= pipYtop / 2.2;
            let pipYcenter = pipXcenter;                            // 23.5
            let piplocations = [
                // locations below rotate 180deg to bottom of card
                [pipXleft, pipYtop],                                //  [0] in 10000000000 in card: 4,5,6,7,8,9,10
                [pipXcenter, pipYtop],                              //  [1] in 01000000000 in card: 2,3
                [pipXright, pipYtop],                               //  [2] in 00100000000 in card: 4,5,6,7,8,9,10
                [pipXleft, pipY910center],                          //  [3] in 00010000000 in card: 9,10
                [pipXright, pipY910center],                         //  [4] in 00001000000 in card: 9,10
                [pipXcenter, pipY10center],                         //  [5] in 00000100000 in card: 10
                [pipXcenter, pipY78center],                         //  [6] in 00000010000 in card: 8 
                // locations below do NOT rotate 180deg to bottom of card
                [pipXcenter, pipY78center],                         //  [7] in 00000001000 in card: 7
                [pipXleft, pipYcenter],                             //  [8] in 00000000100 in card: 6,7,8
                [pipXcenter, pipYcenter],                           //  [9] in 00000000010 in card: 3,5,9 // half suit size
                [pipXright, pipYcenter]                             // [10] in 00000000001 in card: 6,7,8
            ];
            let location;//location for this pip;
            location = piplocations[idx];

            let pip_locationnames = 'abcdefghijk';
            if (!('0' + pip_locationnames).includes(pip_char)) {
                let x = location[0];
                let y = location[1];
                if (rank == 4) y += 30;
                if (rank == 1 && idx == 9) { // Ace in center pip gets bigger center pip
                    [x, y] = [-pipsize, -pipsize];
                    pipsize = pipsize * 2;
                }

                let suitorder = 'SHDC';
                if (suitorder.includes(pip_char)) pip_char = suitorder.indexOf(pip_char);   // translate S=0 , H=1 , D=2 , C=3

                pipdata = SVG_use_symbol(
                    suitStr + (
                        Number(pip_char)
                            ? pip_char
                            : suit),    // symbolid
                    false,              // width
                    pipsize,            // height    
                    x,                  // x
                    y,                  // y
                    ''                  // transform
                ); //suitsize
                pips_on_card.push(pipdata);
                if (idx < 7) mirrored_bottom_pips.push(pipdata);
            }

            if (pipletters) pips_labels.push(SVG_text(pip_locationnames[idx], location[0] + 27, location[1] + 40, 'green', 'green', 40));
        });
    }
    //let xml = `<?xml version='1.0' encoding='UTF-8' standalone='no'?>`;
    let card_width = 240;   //!!! DO NOT CHANGE
    let card_height = 334;  //!!! DO NOT CHANGE
    let viewbox_ranksuit = `-500 -500 1000 1000`;
    let svg = outputSVG ? '' : `data:image/svg+xml,`;
    svg += `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'`
        //+ ` height='3.5in'  wi1dth='2.5in'`
        //+ ` transform='rotate(5,0,0)'`
        // + ` opacity='.25'`
        + ` preserveAspectRatio='none' viewBox='${-card_width / 2} ${-card_height / 2} ${card_width} ${card_height}'>`;
    //card border
    svg += SVG_rect(
        card_width,
        card_height,
        -card_width / 2,
        -card_height / 2,
        cardborder_radius,
        SVG_strokefill(cardborder_color, card_colorbackground) + ` stroke-width='${cardborder_width}'`    // attrs
    );
    // drop shadow effect
    svg += `<defs><filter id='shadow'><feDropShadow dx='5' dy='10' stdDeviation='20' /></filter></defs>`;

    if (rank > 0) { // draw rank and suit on every card
        if (letters) { // user overruled courts letters with 'AJQK' - Ace, Jack , Queen , King : 'ABVK'
            let courtsArr = parseAttribute(letters);
            let suitText = ['UNUSED', courtsArr.shift(), 2, 3, 4, 5, 6, 7, 8, 9, 10, ...courtsArr][rank];
            let suitText_X = 0;
            let suitText_Y = 33;
            if (suitText == 'W') rankFontSize -= 10;
            svg += `<symbol id='${rankStr}${cardId}' viewbox='${viewbox_ranksuit}' opacity='${opacity}'>`
                + `${SVG_text(
                    suitText,
                    suitText_X,
                    suitText_Y,
                    'red',
                    color_suit,
                    rankFontSize,
                    'left'
                )}</symbol>`;
        } else {
            // SVG used for suit numbers/letters:
            svg += SVG_symbol(
                rankStr,
                viewbox_ranksuit,
                SVGpaths[1][rank],
                SVG_strokefill(color_suit) + `stroke-width='110'`
            );
        }
        //for extra fun  add all 4 suits to each card, so cards can have multiple suits and colors
        [0, 1, 2, 3].map(suitNr => {
            //if(rank>10) color_suit = ['green', 'blue', 'hotpink'][rank - 11];
            let foreign_suitcolor = suitNr === suit ? color_suit : ['red', 'green', 'blue', 'orange'][suitNr];
            svg += SVG_symbol(
                suitStr + suitNr,
                '-600 -600 1200 1200',
                SVGpaths[0][suitNr],
                `fill='${foreign_suitcolor}' ${rank == 1 ? dropshadow : ''}`
            );
        });
        // draw on on card
        svg += `${uses_suit_rank}${pips_on_card.join``}<g transform='rotate(180)'>${uses_suit_rank}${mirrored_bottom_pips.join``}</g>`;
        svg += pips_labels.join``;
    } else {// card backside
        let back_size2 = back_dotsize / 2;
        let back_margin = cardborder_radius;
        let back_width = card_width - back_margin * 2;
        let back_height = card_height - back_margin * 2;
        let back_id = marker + 'Back_' + cardId;
        if (back_label) svg += SVG_text(
            back_label,
            0,              // x
            10,             // y
            'red',          // stroke
            back_label_color,
            42              // font-size
            //false           // default textanchor middle
        );
        svg += `<defs><pattern id='${back_id}' width='${back_dotsize}' height='${back_dotsize}' patternUnits='userSpaceOnUse'>`
            + `<path d='M${back_size2} 0L${back_dotsize} ${back_size2}L${back_size2} ${back_dotsize}L0 ${back_size2}Z' fill='${backcolor}'></path>`
            + `</pattern></defs>`
            + SVG_rect(
                back_width,
                back_height,
                -back_width / 2,
                -back_height / 2,
                cardborder_radius,
                `fill='url(#${back_id})'`   // attrs
            );
    }
    if (rank > 10) {
        // default courts='0,1,2' Make Q the King with '0,2,1'
        let court_rankimage = parseAttribute(courts, rank - 11); // 0=Jack  1=Queen  2=King
        // (optional) use another suitimage
        let court_suitimage = parseAttribute(suits, suit);
        let court_faceside = [//make suits look to another side, so JQK look to the same side
            [0, 1, 0, 0],   // Jacks - JH looks to the other side
            [1, 0, 0, 1],   // Queens - QS and QC look to the other side
            [0, 0, 1, 0]    // Kings - KD looks to the other side
        ];
        court_faceside = [[1, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 1]];// suits in court on opposite side
        if (court_faceside[court_rankimage][court_suitimage]) svg += `<g transform='scale(-1 1)'>`;
        else svg += '<g>';

        let suits_deco = (size, x, y, transform = '', mirror = true) => [suitStr + suit, false, size, x, y, `transform='${transform}'`, mirror];
        let suit_decorations = [
            [ /*  JACK */
                [ /* SPADES */
                    //Spades on sleave
                    suits_deco(90, 1016, -78, SVG_attr_rotate(33)),
                    suits_deco(100, 1010, 24, SVG_attr_rotate(33)),
                    suits_deco(105, 1004, 140, SVG_attr_rotate(33)),
                    //extra 2 spades on sleave
                    suits_deco(130, 332, 492),
                    suits_deco(130, 334, 610),
                ],
                [ /* HEARTS */
                    suits_deco(118, 520, 936),//on chest
                    //on sleave
                    suits_deco(95, false, false, SVG_attr_rotate('30 -880 1970')),
                    suits_deco(95, false, false, SVG_attr_rotate('30 -676 2030')),
                    //on robe
                    suits_deco(110, false, false, SVG_attr_rotate('55 -440 480')),
                    suits_deco(120, false, false, SVG_attr_rotate('40 -830 470')),
                    suits_deco(140, false, false, SVG_attr_rotate('20 -2120 410'))
                ],
                [ /* DIAMONDS */
                    suits_deco(200, 550, 903),
                    suits_deco(200, 60, 903),
                    /* collar */
                    suits_deco(50, false, false, 'scale(1 .97)' + SVG_attr_rotate('-26 1738 -1562')),
                    suits_deco(50, false, false, 'scale(1 .97)' + SVG_attr_rotate('-22 2023 -1794')),
                    suits_deco(50, false, false, 'scale(1 .97)' + SVG_attr_rotate('-14 2991 -2839')),
                    suits_deco(50, false, false, 'scale(1 .97)' + SVG_attr_rotate('-6 6532 -6637')),
                    suits_deco(50, 681, 631),
                    suits_deco(50, false, false, 'matrix(.996 .084 -.087 .968 633 627)'),
                    suits_deco(50, false, false, 'scale(1 .97)' + SVG_attr_rotate('10 -3345 3671')),
                    suits_deco(50, false, false, 'scale(1 .97)' + SVG_attr_rotate('15 -2101 2372'))
                ],
                [ /* CLUBS */
                    suits_deco(100, 460, 680),
                    suits_deco(100, 460, 800),
                    suits_deco(140, 760, 580),
                ]
            ],
            [ /*  QUEEN */
                [ /* SPADES */
                    suits_deco(130, 300, 1080, SVG_attr_rotate(-33)),
                    suits_deco(140, 254, 1250, SVG_attr_rotate(-33)),
                    suits_deco(200, 330, 1380, SVG_attr_rotate(-33)),
                ],
                [ /* HEARTS */
                    suits_deco(70, 1208, 234, SVG_attr_rotate(20)),
                    suits_deco(75, 1140, 552, SVG_attr_rotate(10)),
                    suits_deco(80, 1155, 660, SVG_attr_rotate(11)),
                    suits_deco(85, 1240, 660, SVG_attr_rotate(17)),
                    suits_deco(95, 1310, 660, SVG_attr_rotate(23)),
                ],
                [ /* DIAMONDS */
                    suits_deco(200, 550, 903),
                    suits_deco(180, 399, 420, SVG_attr_rotate(35)),
                ],
                [ /* CLUBS */
                    suits_deco(150, 15, 1320, SVG_attr_rotate(-45)),
                    suits_deco(150, 34, 1480, SVG_attr_rotate(-45)),
                ]
            ],
            [ /*  KING */
                [ /* SPADES */
                    suits_deco(100, 960, 250, SVG_attr_rotate(20)),
                    suits_deco(100, 960, 380, SVG_attr_rotate(20)),
                    suits_deco(100, 180, 820, SVG_attr_rotate(-20)),
                    suits_deco(100, 200, 680, SVG_attr_rotate(-20)),
                ],
                [ /* HEARTS */
                    suits_deco(100, 690, 890, SVG_attr_rotate(-15)),
                    suits_deco(113, 928, 798, SVG_attr_rotate(0)),
                    suits_deco(100, 1280, 230, SVG_attr_rotate(35)),
                ],
                [ /* DIAMONDS */
                    suits_deco(200, 550, 903),
                    suits_deco(130, 300, 760, SVG_attr_rotate(-5)),
                    suits_deco(140, 90, 680, SVG_attr_rotate(-20)),
                ],
                [ /* CLUBS */
                    suits_deco(100, 1110, 10, SVG_attr_rotate(30)),
                    suits_deco(115, 1025, 420, SVG_attr_rotate(15)),
                    suits_deco(130, 823, 820),
                ]
            ]
        ];
        function doublecourtsymbol() {//function because arrow-function doesn't handle ...arguments
            return SVG_use_symbol(...arguments) + SVG_use_symbol(...arguments, `transform='rotate(180)'`);
        }
        //position of suit INside court
        let incourtsuit_left = [-88, -124];
        let incourtsuit_right = [30, -127];
        let courtsuitPosition = [
            [incourtsuit_left, incourtsuit_right, incourtsuit_right, incourtsuit_right],    // Jack
            [incourtsuit_right, incourtsuit_left, incourtsuit_right, incourtsuit_right],    // Queen
            [incourtsuit_left, incourtsuit_left, incourtsuit_left, incourtsuit_left]        // King
        ][court_rankimage][court_suitimage];

        let court_symbols = 'gold,red,blue,black,detail'.split`,`
            .map((symbolId, idx) => {
                svg += SVG_symbol(
                    symbolId,
                    '0 0 1300 2e3',
                    SVGpaths[2][court_rankimage][idx][court_suitimage],
                    [
                        SVG_attr_fill(getColor(court_color_gold, court_rankimage)),
                        SVG_attr_fill(getColor(court_color_red, court_rankimage)),
                        SVG_attr_fill(getColor(court_color_blue, court_rankimage)),
                        SVG_attr_fill(getColor(court_color_black, court_rankimage)),
                        SVG_strokefill(court_color_detail) + `stroke-linecap='round' stroke-linejoin='round' stroke-width='${court_sharpness}'`, //detail
                    ][idx],
                    //add suit decorations in last symbol (in original SVG there was a sixt SVG symbol with more minor details)
                    symbolId == 'detail' ? suit_decorations[court_rankimage][court_suitimage] : []
                );
                return doublecourtsymbol(symbolId, 165, 261, -82, -130)
            }).join``;

        svg += court_symbols;
        //2 suits inside court:
        svg += doublecourtsymbol(suitStr + suit, false, 55, courtsuitPosition[0], courtsuitPosition[1]);

        //JQK blue borderbox:
        svg += `<defs>${SVG_rect(
            166,        // width   //!! STILL HARDCODED VALUES
            254,        // height
            -83,        // x
            -127,       // y
            2,          // radius
            "id='box'"  // attrs
        )}</defs><use xlink:href='#box' ${SVG_strokefill(court_color_rect)} opacity='${opacity}'></use>`;

        svg += `</g>`; // end court transform
    }
    //ACE of Spades decoration
    if (rank == 1 && suit == 0) svg += SVG_text(
        marker,     // text
        0,          // x
        17,         // y
        '#FFF',     // stroke
        '#DDD',     // color
        16          // fontsize
    );

    svg += `</svg>`;

    if (outputSVG) return svg

    // can do extra check for " here and replace with '
    let img = document.createElement('IMG');
    img.src = svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23');
    return img;

} // <<< svgcard

console.log('loaded 52 playing cards');

window['CARDTS'] = window['CARDTS'] || {
    suitcolor: suit => (suit == 0 || suit == 3) ? '#000' : 'red'
}

window['CARDTS'].svg = [
    [
        /* 0,0 = Spades*/
        'M0 -500C100 -250 355 -100 355 185A150 150 0 0 1 55 185A10 10 0 0 0 35 185C35 385 85 400 130 500L-130 500C-85 400 -35 385 -35 185A10 10 0 0 0 -55 185A150 150 0 0 1 -355 185C-355 -100 -100 -250 0 -500Z',
        /* 0,1 = Hearts*/
        'M0 -300C0 -400 100 -500 200 -500C300 -500 400 -400 400 -250C400 0 0 400 0 500C0 400 -400 0 -400 -250C-400 -400 -300 -500 -200 -500C-100 -500 0 -400 -0 -300Z',
        /* 0,2 = Diamonds*/
        'M-400 0C-350 0 0 -450 0 -500C0 -450 350 0 400 0C350 0 0 450 0 500C0 450 -350 0 -400 0Z',
        /* 0,3 = Clubs*/
        'M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z'
    ],
    [ /* 1 = Ranks */
        '0 UNUSED',
        /* 1,1 = Ace */
        'M-270 460L-110 460M-200 450L0 -460L200 450M110 460L270 460M-120 130L120 130',
        /* 1,2 = 2 */
        'M-225 -225C-245 -265 -200 -460 0 -460C 200 -460 225 -325 225 -225C225 -25 -225 160 -225 460L225 460L225 300',
        /* 1,3 = 3 */
        'M-250 -320L-250 -460L200 -460L-110 -80C-100 -90 -50 -120 0 -120C200 -120 250 0 250 150C250 350 170 460 -30 460C-230 460 -260 300 -260 300',
        /* 1,4 = 4 */
        'M50 460L250 460M150 460L150 -460L-300 175L-300 200L270 200',
        /* 1,5 = 5 */
        'M170 -460L-175 -460L-210 -115C-210 -115 -200 -200 0 -200C100 -200 255 -80 255 120C255 320 180 460 -20 460C-220 460 -255 285 -255 285',
        /* 1,6 = 6 */
        'M-250 100A250 250 0 0 1 250 100L250 210A250 250 0 0 1 -250 210L-250 -210A250 250 0 0 1 0 -460C150 -460 180 -400 200 -375',
        /* 1,7 = 7 */
        'M-265 -320L-265 -460L265 -460C135 -200 -90 100 -90 460',
        /* 1,8 = 8 */
        'M-1 -50A205 205 0 1 1 1 -50L-1 -50A255 255 0 1 0 1 -50Z',
        /* 1,9 =9 */
        'M250 -100A250 250 0 0 1 -250 -100L-250 -210A250 250 0 0 1 250 -210L250 210A250 250 0 0 1 0 460C-150 460 -180 400 -200 375',
        /* 1,10 = 10 */
        'M-260 430L-260 -430M-50 0L-50 -310A150 150 0 0 1 250 -310L250 310A150 150 0 0 1 -50 310Z',
        /* 1,11 = 11 Jack */
        'M50 -460L250 -460M150 -460L150 250A100 100 0 0 1 -250 250L-250 220',
        /* 1,12 = 12 Queen */
        'M-260 100C90 100 -40 460 260 460M-175 0L-175 -285A175 175 0 0 1 175 -285L175 285A175 175 0 0 1 -175 285Z',
        /* 1,13 = 13 King */
        'M-285 -460L-85 -460M-185 -460L-185 460M-285 460L-85 460M85 -460L285 -460M185 -440L-170 155M85 460L285 460M185 440L-10 -70',
    ], // <<< end Ranks
    [ /* 2 = COURTS */
        [ /* 2,0 = JACK */
            [ /* 2,0,0 = Jack court_GOLD */
                /* paths:2,0,0,0 Jack court_gold 0 Spades */
                'M1220 34c-31 0-57 47-57 105 0 40 13 77 32 95l-46 45 46 46c-19 18-32 54-32 94 0 34 9 63 22 82 1 4 47 26 51 19 24-13 41-53 41-101 0-40-12-76-32-94l46-46-46-46c19-17 32-54 32-94 0-58-26-105-57-105zm0 45c18 0 33 27 33 60s-15 60-33 60-32-27-32-60 14-60 32-60zm-526 90c-64 7-128 17-191 30 17 64-52 104-43 176 2 15 12 23 23 27-3 26-20 59-43 53 8 0 15-5 15-15 0-25-50-40-50 15 0 26 32 41 61 32l-16 4v267a62 62 0 0 0-45-18c-32 0-57 21-57 47v10c24 30 47 63 68 98h334v-74-2c0-19-20-33-45-33a61 61 0 0 0-3 0l10-16 65 45 10-15-64-45-7 10 126-185 65 44 9-15-64-44-3 5 52-76 64 44 11-14-58-40-8 1-9 8 4-6c-4 2-9 3-15 3-25 0-55-5-75-5-10 0-28-6-45-12l-40 12c-18 4-51-11-59-14a74 74 0 0 1-38 30c26-9 52-35 56-87 25-5 46-23 46-44 0-55-55-45-55-10 0 10 3 15 8 17-80-31 38-123 6-208zm526 81l29 29-29 30-29-30zm0 109c18 0 33 27 33 60s-15 60-33 60-32-27-32-60 14-60 32-60zM485 476v0zm-5 4v35h380L660 802v7-10-2c0-24-21-43-47-43-24 0-44 16-48 35-1-25-24-44-51-44a54 54 0 0 0-34 11V480zm94 4v1a69 69 0 0 1 0-1zm407 32L750 855v40l175-258-117 174a427 427 0 0 1-1 0l-19 29c62 1 122 16 178 44l6 4c41 22 80 51 113 87a478 478 0 0 1 114 427l26 13a509 509 0 0 0-65-389l-1-1c42 32 90 56 141 71V900c-52-26-110-87-101-152a3192 3192 0 0 0 101 73V708c-105-68-201-128-300-182v1zm-646 4l-20 8v230l20 23zm55 19c-14 0-28 8-11 25-34-34-34 56 0 22-34 34 56 34 22 0 26 26 32-21 19-29-5-2-11-1-19 7 17-17 3-25-11-25zm90 31v25h324l16-25zm519 49h0zm-610 34c-14 0-27 9-10 26-35-35-35 55 0 21-35 34 55 34 21 0 26 26 33-20 19-28-4-3-11-2-19 7 17-17 3-26-11-26zm399 7l-11 15 65 45 10-15zM470 766zm-8 23v0zm218 3zm338 51zm3 8l1 2-1-2zm3 8l2 4-2-4zm3 7zm3 6zm5 10zm3 5a407 407 0 0 0 7 13l-1-3-6-10zm-243 18l7 21-2-6H430l13 25 366-1 4 11c202 5 320 193 297 395l35 22c-7-9-7-16 2-19a425 425 0 0 0 3-69c-14-10-12-19-2-28-3-25-8-49-14-73-19-13-12-18-8-24-8-23-19-45-31-67-8-4-14-8-9-16a390 390 0 0 0-59-72c-4-2-8-4-11-9-23-21-49-39-76-52l-6-3c-27-14-57-23-87-29l-12-2c-14-2-27-4-40-4zm259 9zm-536 50c-14 0-28 9-11 26-34-35-34 55 0 21-34 34 56 34 21 0 27 26 33-20 19-28-4-3-10-2-19 7 17-17 4-26-10-26zm88 0c-14 0-28 9-11 26-34-35-34 55 0 21-34 34 56 34 21 0 27 26 33-20 19-28-4-3-10-2-19 7 18-17 4-26-10-26zm227 41l17 35a267 267 0 0 1 183 249l28 24v-13c0-147-98-269-228-295z',
                /* 2,0,0,1 Jack court_gold 1 Hearts */
                'M0 27v75l60 73v479l45-31V332c48 14 58 60 60 113 42-79 7-103-10-140 22-7 44-16 60-40-20-21-40-27-60-35 46-70 20-97-2-126 4 34 6 68-47 117l-1 60V155zm616 93c-90 0-177 16-250 36-51 122 18 219-46 324 20-55-82-75-75 5 2 19 15 29 32 30l-12-2-45 31L0 696v30l235-162-14-19 277 358v17h305v-17c28-118 72-224 144-320l-104-76c-19 21-36 43-51 66l3-3H410l-50-65h-22l22-7 12-2-12 9 12 15h459l13-13-24-17H413c35-6 69-14 96-32 7-5 13-12 21-17 11-7 22-14 28-25l-26 10 25-10c9-4 16-11 23-26 60-120-20-130 64-269l-28-1zm547 345c-23-1-52 9-73 25-40 30-80 15-75-25-70 30-5 140 65 95 42-27 105-40 115-5 32-65 6-90-32-90zm-868 49l-3 1-8 1 11-2zm498 60c-66 98-97 213-126 328L413 574l10 11h362zm226 63c-52 66-91 137-120 213l22 24c28-80 65-154 117-222-5 26-8 54-8 83 0 137 65 256 161 318l-3-1c-45 116-116 226-186 304l14 17c73-76 146-188 196-307l-6-3c29 17 61 28 94 33v-18c-143-19-255-164-255-339 0-27 3-52 7-77l-14-11zm89 65l18 14-1 20c0 123 75 226 175 249v-31c-86-24-149-113-149-219v-2zm-20 14c-11 0-21 7-14 26-44-9-26 59 7 29 8 43 69-5 21-21 19-20 2-34-14-35zm-255 87l-30 105a191 191 0 0 1 51 256l67 88a294 294 0 0 0-88-450zm276 19c-13 0-25 9-13 29-45 1-12 63 13 27 17 41 66-20 16-25 13-21-2-31-16-31zm60 96c-15 0-32 15-12 33-43 14 6 64 21 22 28 34 57-38 8-28 5-19-5-27-17-27zm92 75c-17 0-38 23-9 36-37 26 25 59 26 15 9 6 16 6 21 3v-35c-5-2-12-2-22 3-1-15-8-21-17-22z',
                /* 2,0,0,2 Jack court_gold 2 Diamons */
                'M0 0v603a53 18 0 0 1 53-18 53 18 0 0 1 47 10V397a240 240 0 0 0 165-182c-50 41-106 67-165 82V100L0 0zm0 603v32c0-7 14-13 34-16a53 18 0 0 1-34-16zm0 32v35a53 18 0 0 1 53-17 53 18 0 0 1 47 10v-18c-10 5-26 8-45 8-30 0-55-8-55-18zm0 35v1040l100-100V708c-8 6-24 10-42 10-27 0-48-8-48-18 0-6 8-11 20-14a53 18 0 0 1-30-16zm873-505c5 20 17 62 17 70 0 10-10 40-10 55s-10 70-20 95-45 90-50 101c3 18 22 33 42 38h-2c-33 24-71 38-112 44-68 11-147-4-232-47l-1 1c11-8 23-22 33-46 17-42-23-146 57-301-68 0-134 4-191 23-61 128-58 214-78 256 4-39-86-64-86 11 0 21 16 50 43 51a308 308 0 0 0 210 11l-11 5c94 50 182 68 259 56 52-8 100-29 141-63h-2c10-3 17-9 20-19 25-29 35-44 47-62 3-6 4-14 3-24-5-40-50-20-50-5-3-10-5-22-5-35 20 8 45-6 45-30 0-40-40-5-40-5s17-124-17-179l-10-1zm88 301a319 319 0 0 1-217 142c-88 13-187-10-291-70l-8 2 27 32c96 49 190 69 275 56 71-11 135-44 187-97l-3 3 17 275 18-59-15-238 27-34 3-6-20-6zm72 20c27 105 80 198 166 268l1-38a456 456 0 0 1-133-222l-34-8zm-668 56l151 170a47 47 0 0 0-6 0c-10 0-20 5-27 11a44 44 0 0 0-8 48c-6-2-12-2-18-2-10 1-19 5-26 12a43 43 0 0 0-11 39l-13-1c-10 1-19 5-26 12a43 43 0 0 0-11 39l-1-1a15 15 0 0 0-6 0l1 2a771 771 0 0 0-156-326l-64 41c4 15 10 38 11 54l-1 22a584 584 0 0 1 38 633c27 33 50 70 68 110 44-73 79-154 98-240v2l296-301 121 137 21-21-388-437-43-3zm-265 68a53 18 0 0 1-27 9h1c10 1 20 3 26 6v-15zm0 67a53 18 0 0 1-20 8h1c8 2 15 4 19 7v-15zm739 21l-26 8c9 26 23 64 37 84 11 15 28 35 45 53 0 0 23-12 16-20-14-15-27-31-36-43-14-20-28-57-36-82zm-52 14l-27 5c8 25 24 70 40 93 14 20 40 49 60 69 7 8 17-19 17-19-18-19-40-43-52-60-15-21-30-62-38-88z',
                /* 2,0,0,3 court_gold 3 Clubs */
                'M0 3v1657l110-110v-126a942 942 0 0 0 228-272c139-34 229-152 327-251 99-100 202-184 378-175l21-27-12-1 3 1V464l-20-9v243h2a469 469 0 0 0-287 90V607l-42 22c0 4-2 8-3 11 5 10 11 34-20 20 15 30-10 25-20 20-9 5-32 9-22-16l30-16-88 47-5-3v257a1309 1309 0 0 1-54 54c-30-24-62-47-101-68-7 25-14 49-23 73l68 45c-35 28-72 51-114 65 96-192 116-403 123-623-17-7-13-13-27-26v-2c-21-39-62-119-62-142v-70c0-10-5-30-5-40s10-80 10-80l-10 5c-21 61-19 126-25 190 0-25-50-28-50 15 0 38 50 37 71 6-8 15-2 42 2 65-3 47-28 44-38 44-7 0-11-3-12-8 4 11 29 8 32-17 4-36-60-20-55 25 1 11 7 19 15 25 0 0 35 25 70 15 6-2 11-4 15-8l41-5c-10 337-49 647-341 900v16-838c-5-10-5-25 0-44v-1c-12 6-12-6-15-15l-19 26c-2 3-4 5-7 6h2c7 2 10 5 10 8 0 7-16 13-36 13s-36-6-36-13c0-6 16-12 36-12h10l1 1c-6-5-8-14-1-24 15-20 16-26 20-30s19-5 35-2V160h30zm284 43c-67 9-52 101-109 144 93 28 143-35 162-81zm356 79c63 116 35 200 35 305 0 40 24 57 46 55 44-4 111-43 167-66 17-5 32-22 32-49 0-10-5-40-39-35 5-66 26-132-16-210zm249 293l-4 2v297l20-6V421l-16-3zm-549 17zm-70 68c-28 0-51 14-75 22-6-1-11-2-20 5-2 40-8 76-15 110 0 10 7 13 20 10 25 18 57 51 87 69 5-20-3-46-22-74 13 4 32-3 50-10a81 81 0 0 0-44-38c23 0 39-9 49-22a69 69 0 0 0-45-30c19-7 33-17 35-40-7-2-14-2-20-2zM39 560a36 13 0 0 1 36 13 36 13 0 0 1-36 12 36 13 0 0 1-36-12 36 13 0 0 1 36-13zm-2 28a33 13 0 0 1 33 12 33 13 0 0 1-33 13 33 13 0 0 1-32-13 33 13 0 0 1 32-12zm3 25a35 13 0 0 1 35 12 35 13 0 0 1-35 13 35 13 0 0 1-35-13 35 13 0 0 1 35-12zm610 108c5 0 11 2 15 4 10-5 35-10 20 20 30-15 25 10 20 20 5 10 11 34-20 20 15 30-10 25-20 20-10 5-35 10-20-20-30 15-25-10-20-20-5-10-10-35 20-20-9-19-3-24 5-24zm0 125c5 0 11 2 15 4 4-2 10-4 15-4l-14 15 3-3-15 14-33 33c0-5 2-11 4-15-5-10-10-35 20-20-9-19-3-24 5-24z'
            ] // <<< end Jack court GOLD
            ,
            [ /* 2,0,1 = Jack court_RED */
                /* paths:2,0,1,0 Jack court_red 0 Spades */
                'M340 0c47 48 101 103 140 166 120-49 359-77 479-26 42-51 93-96 148-140zm880 79a33 60 0 0 0-32 60 33 60 0 0 0 32 60 33 60 0 0 0 33-60 33 60 0 0 0-33-60zm0 171l-29 29 29 30 29-30zm0 109a33 60 0 0 0-32 60 33 60 0 0 0 32 60 33 60 0 0 0 33-60 33 60 0 0 0-33-60zM989 544l-20 29c120 70 232 145 331 219v-47c-94-70-198-136-311-201zm-709 1c-48 23-96 48-142 73 53 30 100 65 142 105zm110 15a15 15 0 0 0-11 4 15 15 0 0 0 0 22 15 15 0 0 0 22 0 15 15 0 0 0 0-22 15 15 0 0 0-11-4zm90 75v120c10-6 21-10 34-10 27 0 50 19 51 44 4-19 24-35 47-35 27 0 48 19 48 43v5l116-167zm-90 39a15 15 0 0 0-11 5 15 15 0 0 0 0 21 15 15 0 0 0 21 0 15 15 0 0 0 0-21 15 15 0 0 0-10-5zm888 131c-12 22 8 47 22 59v-43l-22-16zM809 944v1h1zm-158 1H443c17 34 33 71 48 110h-1 161zm162 10l20 50a295 295 0 0 1 228 308l49 37c23-202-95-390-297-395zm-295 9c14 0 27 9 10 26 9-9 15-10 19-7 14 8 8 54-19 28 35 34-55 34-21 0-34 34-34-56 0-21-17-17-3-26 11-26zm-11 26a15 15 0 0 0 0 21 15 15 0 0 0 21 0 15 15 0 0 0 0-21 15 15 0 0 0-21 0zm99-26c14 0 28 9 10 26 9-9 15-10 19-7 14 8 8 54-19 28 35 34-55 34-21 0-34 34-34-56 0-21-17-17-3-26 11-26zm-11 26a15 15 0 0 0 0 21 15 15 0 0 0 21 0 15 15 0 0 0 0-21 15 15 0 0 0-21 0zm255 50c48 99 108 182 183 249-4-119-80-218-183-249zm360 18a552 552 0 0 1 41 369l49 19v-350c-31-9-61-22-90-38z',
                /* 2,0,1,1 Jack court_red 1 Hearts */
                'M200 0l156 159c128-37 303-61 459-9L960 0h-86l-72 88h-3c-35-7-70-12-103-15h-5l7-73h-68v71h-5c-39 0-77 3-113 7l-4 1-15-79h-78l33 88-6 1-82 19-4 1L284 0zm96 0l65 97c23-6 48-11 74-16L405 0zm207 0l13 68c33-4 68-7 104-7V0zm205 0l-6 64c31 2 63 7 96 13l63-77zM0 102v594l60-42V175zm435 427c-6 0-12 3-5 11a8 8 0 0 1 5-2 8 8 0 0 1 5 2c7-8 1-11-5-11zm5 11zm0 0a8 8 0 0 1 2 5 8 8 0 0 1-2 5c15 14 15-24 0-10zm0 10zm0 0a8 8 0 0 1-5 3 8 8 0 0 1-5-3c-14 15 24 15 10 0zm-10 0zm0 0a8 8 0 0 1-3-5 8 8 0 0 1 3-5c-15-14-15 24 0 10zm0-10zm71-11c-6 0-12 3-5 11a8 8 0 0 1 5-2 8 8 0 0 1 6 2c7-8 1-11-6-11zm6 11h-1 1zm0 0a8 8 0 0 1 2 5 8 8 0 0 1-2 5c14 14 14-24 0-10zm0 10h-1 1zm0 0a8 8 0 0 1-6 3 8 8 0 0 1-5-3c-14 15 25 15 11 0zm-11 0zm0 0a8 8 0 0 1-2-5 8 8 0 0 1 2-5c-14-14-14 24 0 10zm0-10zm72-11c-6 0-12 3-5 11a8 8 0 0 1 5-2 8 8 0 0 1 5 2c7-8 1-11-5-11zm5 11zm0 0a8 8 0 0 1 2 5 8 8 0 0 1-2 5c15 14 15-24 0-10zm0 10zm0 0a8 8 0 0 1-5 3 8 8 0 0 1-5-3c-14 15 24 15 10 0zm-10 0zm0 0a8 8 0 0 1-3-5 8 8 0 0 1 3-5c-15-14-15 24 0 10zm0-10zm71-11c-6 0-12 3-5 11a8 8 0 0 1 5-2 8 8 0 0 1 6 2c7-8 1-11-6-11zm6 11h-1 1zm0 0a8 8 0 0 1 2 5 8 8 0 0 1-2 5c14 14 14-24 0-10zm0 10h-1 1zm0 0a8 8 0 0 1-6 3 8 8 0 0 1-5-3c-14 15 25 15 11 0zm-11 0zm0 0a8 8 0 0 1-2-5 8 8 0 0 1 2-5c-14-14-14 24 0 10zm0-10zm72-11c-6 0-12 3-5 11a8 8 0 0 1 5-2 8 8 0 0 1 5 2c7-8 1-11-5-11zm5 11zm0 0a8 8 0 0 1 2 5 8 8 0 0 1-2 5c15 14 15-24 0-10zm0 10zm0 0a8 8 0 0 1-5 3 8 8 0 0 1-5-3c-14 15 24 15 10 0zm-10 0zm0 0a8 8 0 0 1-3-5 8 8 0 0 1 3-5c-15-14-15 24 0 10zm0-10zm71-11c-6 0-12 3-5 11a8 8 0 0 1 5-2 8 8 0 0 1 6 2c7-8 1-11-6-11zm6 11h-1 1zm0 0a8 8 0 0 1 2 5 8 8 0 0 1-2 5c14 14 14-24 0-10zm0 10h-1 1zm0 0a8 8 0 0 1-6 3 8 8 0 0 1-5-3c-14 15 25 15 11 0zm-11 0zm0 0a8 8 0 0 1-2-5 8 8 0 0 1 2-5c-14-14-14 24 0 10zm0-10zm-292 60l185 240c17-85 45-165 85-240zm681 133v2c0 106 63 195 149 219v-62c-46-18-82-63-93-118zM855 852c-5 0-10 2-15 8l-19 23 34 30 20-23c11-14-3-39-20-38zm49 53c-4 1-8 2-12 5l-26 16 25 39 25-16c17-11 8-44-12-44zm-101 2v11a3 3 0 0 0-3-1 3 3 0 0 0-3 3v20a3 3 0 0 0 5 2v44c42 40 29 85 16 130l36 47a189 189 0 0 0-51-256zm-303 10a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm15 0a3 3 0 0 0-3 3v20a3 3 0 1 0 6 0v-20a3 3 0 0 0-3-3zm148 54l-7 1-29 7 13 45 27-7c21-5 21-46-4-46zm-20 71l-1 46 26 1c23 1 34-45 2-46zm-5 68l-14 44 28 7c23 5 43-37 12-45zm-20 55l-15 24 26 33c17-4 32-25 13-39z',
                /* 2,0,1,2 Jack court_red 2 Diamons */
                'M200 0l157 166 26-5a2333 2333 0 0 1 503-36l34 2L1041 0h-90l-74 109h-3a2999 2999 0 0 0-97-1h-8L798 0H696l-8 110-5 1-88 5h-5L571 0H448l45 127h-7l-80 13h-4L293 0zm108 0l99 127 70-10L435 0zm275 0l17 104 77-5 7-99zm228 0l-26 96a2780 2780 0 0 1 86 1l65-97zM0 50v70l80 80v-70zm0 150v110c27-1 54-4 80-9v-21zm226 67c-69 41-145 60-226 63v74c88-16 143-43 180-76 20-18 35-39 46-61zM80 404c-24 8-50 15-80 20v11l80 80zm182 105l-55 36c66 83 110 167 137 252l131-132-110-123c-34-11-70-13-103-33zm863 2l-42 33 10 24h66l-40 50 14 22 62-11-18 64 12 12 11-39v-44l-7-8-60 10 37-46-13-25h-60l46-37zM0 515v88a53 18 0 0 1 53-18 53 18 0 0 1 18 1zm0 88v32c0-7 14-13 34-16a53 18 0 0 1-34-16zm0 32v35a53 18 0 0 1 53-17 53 18 0 0 1 27 2v-4l-25 2c-30 0-55-8-55-18zm0 35v80l80 80V715c-7 2-14 3-22 3-27 0-48-8-48-18 0-6 8-11 20-14a53 18 0 0 1-30-16zm170-103a3 3 0 1 0 0 6h9a3 3 0 1 0 0-6zm-97 19a53 18 0 0 1 7 2v-2zm74 1a3 3 0 1 0 0 6h47a3 3 0 1 0 0-6zm15 20a3 3 0 1 0 0 6h47a3 3 0 1 0 0-6h-1zm-82 10a53 18 0 0 1-7 2h7zm97 10a3 3 0 1 0 0 6h45a3 3 0 1 0 0-6zm14 20a3 3 0 1 0 0 6h44a3 3 0 1 0 0-6zm12 20a3 3 0 1 0 0 6h44a3 3 0 1 0 0-6zm13 20a3 3 0 1 0 0 6h42a3 3 0 1 0 0-6zm597 19l-26 6c8 26 23 67 38 88 13 18 34 42 53 62l17-19c-17-18-34-38-45-53-14-20-28-58-37-84zm-586 1a3 3 0 1 0 0 6h41a3 3 0 1 0 0-6zm10 20a3 3 0 1 0 0 6h41a3 3 0 1 0 0-6zm10 20a3 3 0 1 0 0 6h40a3 3 0 1 0 0-6zm9 20a3 3 0 1 0 0 6h39a3 3 0 1 0 0-6zm8 20a3 3 0 1 0 0 6h39a3 3 0 1 0 0-6zm7 20a3 3 0 1 0 0 6h39a3 3 0 1 0 0-6zm6 20a3 3 0 1 0 0 6h39a3 3 0 1 0 0-6zM0 830v235l80 80V910zm283 17a3 3 0 1 0 0 6h38a3 3 0 1 0 0-6zm5 20a3 3 0 1 0 0 6h38a3 3 0 1 0 0-6zm5 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm3 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm3 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm2 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm2 20a3 3 0 1 0 0 6h36a3 3 0 1 0 0-6zm1 20a3 3 0 1 0 0 6h36a3 3 0 1 0 0-6zm0 20a3 3 0 1 0 0 6h36a3 3 0 1 0 0-6zm-1 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm-1 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm-1 20a3 3 0 1 0 0 6h36a3 3 0 1 0 0-6zm-3 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm-3 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm-4 20a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zM0 1145v235l80 80v-235zm287 2a3 3 0 1 0 0 6h37a3 3 0 1 0 0-6zm-6 20a3 3 0 1 0 0 6h38a3 3 0 1 0 0-6zm-5 20a3 3 0 1 0 0 6h38a3 3 0 1 0 0-6zm-7 20a3 3 0 1 0 0 6h39a3 3 0 1 0 0-6zm-7 20a3 3 0 1 0 0 6h40a3 3 0 1 0 0-6zm-7 20a3 3 0 1 0 0 6h39a3 3 0 1 0 0-6zm-9 20a3 3 0 1 0 0 6h41a3 3 0 0 0 0-6zm-9 20a3 3 0 1 0 0 6h41a3 3 0 1 0 0-6zm-9 20a3 3 0 1 0 0 6h41a3 3 0 1 0 0-6zm-10 20a3 3 0 1 0 0 6h41a3 3 0 1 0 0-6zm13 20a3 3 0 1 0 0 6h18a3 3 0 1 0 0-6zM0 1460v200l80-80v-41z',
                /* 2,0,1,3 court_red 3 Clubs */
                'M246 0l124 150c181-37 352-16 520 10L1023 0H246zm639 421L570 580l-92-52-2 59 104 58 305-160v-64zm190 53v213c34-38 72-75 115-111v-16c-35-33-69-62-115-86zm-754 26l-32 9-4 14 38-12-2-11zm3 35l-54 3-10 7 11 5 54-3-1-12zm561 0l-115 62v177c35-24 73-43 115-57V535zm-588 37l-3 11 31 2v-12l-28-1zm-3 11h-1 1zm-36 12c-6 0 11 11 14 14l52 6 1-12-61-7-6-1zm33 33c12 4-12 11-7 11l37 6 2-12-32-5zm181 8c-6 82-16 161-33 238 46 18 85 43 121 71V682l-88-46zm-312 4c-17 6-33 6-50 3v344c89-106 107-198 126-290-20-17-39-35-56-47-13 3-20 0-20-10zm525 2l-30 15c3 2 6 3 10 3 10 0 19-8 20-18zm-437 6l6 13 64 13 1-13-71-13zm15 30l3 13 47 11 3-11-53-13zm402 67a20 20 0 0 0-20 20 20 20 0 0 0 20 20 20 20 0 0 0 20-20 20 20 0 0 0-20-20z'
            ] // <<< end Jack court RED
            ,
            [ /* 2,0,2 = Jack court_BLUE */
                /* paths:2,0,2,0 Jack court_BLUE 0 Spades */
                'M515 515v55h55v-55zm28 10a18 18 0 0 1 17 18 18 18 0 0 1-17 17 18 18 0 0 1-18-17 18 18 0 0 1 18-18zm92-10v55h55v-55zm28 10a18 18 0 0 1 17 18 18 18 0 0 1-17 17 18 18 0 0 1-18-17 18 18 0 0 1 18-18zm92-10v55h55v-55zm28 10a18 18 0 0 1 17 18 18 18 0 0 1-17 17 18 18 0 0 1-18-17 18 18 0 0 1 18-18zM513 770a38 38 0 0 0-38 38 38 38 0 0 0 0 2v85h75v-85a38 38 0 0 0 0-2 38 38 0 0 0-37-38zm-108 0a37 37 0 0 0-38 40v12l48 73h27v-87c0-21-17-38-37-38zm208 18a32 32 0 0 0-33 32 32 32 0 0 0 0 2v73h65v-73a32 32 0 0 0 0-2 32 32 0 0 0-32-32zm90 22a27 26 0 0 0-28 26 27 26 0 0 0 0 2v58h55v-58a27 26 0 0 0 0-2 27 26 0 0 0-27-26zm308-254l-18 31 34 21 18-31zm63 39l-18 30 34 22 18-31zm63 39l-18 31 33 23 19-33zm63 40l-20 32 33 24 20-33zm61 43l-20 32 33 24 19-33zm-410 31l24 17c50 35 90-35 50-70l-27-18zm49-28a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm98-102l-42-24-36 51 20 15c21 14 39 11 52 0zm-33-3a15 15 0 1 1 0 30 15 15 0 0 1 0-30zM810 810l56 8c-2-10-7-20-16-28l-19-13zm183-60l-59 88c40 15 77 36 111 62-27-47-45-97-52-150zm-68-355s-15-5-20-5-10 15-20 15-10 5-10 5c-1 0 23 4 30-5 3-4 20-2 20-2m-75-8c15 0 35-27 45-27l25-1-4 8-18 2c-5 0-23 23-33 23s-15-5-15-5zm62-43c26-4 44-18 28-17-21 1-29 11-33 16m2-154l-8 8s-31-12-48-10c-16 2-78 33-78 33 14-18 87-62 134-31zm-38 51a8 17 0 0 1-8 17 8 17 0 0 1-8-17 8 17 0 0 1 8-18 8 17 0 0 1 8 18',
                /* 2,0,2,1 Jack court_BLUE 1 Hearts */
                'M1011 1309l-48-63a321 321 0 0 0-13-384c21-55 48-108 81-158l-1 31c0 124 53 233 134 299-37 101-93 198-153 275zM748 366c20-3 43-24 48-29 4-4 15 4 14 10-20 10-48 22-62 19m-61-142c2 3 66-39 77-43 14-5 27 7 26 6l2 11s-16-12-25-9-79 40-80 35zm101 10a8 16 0 0 1-9 15 8 16 0 0 1-8-15 8 16 0 0 1 8-16 8 16 0 0 1 9 16z',
                /* 2,0,2,2 Jack court_BLUE 2 Diamons */
                'M509 758c9 0 28-1 32 4 19 27 34 54 62 66 6 3 10 22 2 26-38 19-54-44-64-71-7-20-27-16-31-17-6-1-4-8-1-8zm-53 57c9 0 29-1 32 4 19 27 34 54 62 66 6 3 11 22 2 26-38 19-54-44-64-71-7-20-27-16-31-17-6-1-3-8-1-8zm-50 50c9 0 29-1 32 4 19 27 34 54 62 66 6 3 11 22 2 26-38 19-54-44-64-71-7-20-27-16-31-17-6-1-3-8-1-8zm-35 50c8 0 15 1 17 4 19 27 34 54 62 66 6 3 11 22 2 26-38 19-54-44-64-71-3-9-10-14-16-15m4 94c7 7 15 12 24 16 6 3 11 22 2 26-11 6-20 4-27-1m322-780a14 20 0 0 1-13 20 14 20 0 0 1-14-20 14 20 0 0 1 14-20 14 20 0 0 1 13 20zm163 5a12 20 0 0 1-12 20 12 20 0 0 1-13-20 12 20 0 0 1 13-21 12 20 0 0 1 12 21zm179 309c-17-37-30-76-39-117l-19-5-3 6-27 34 15 238c19-55 44-107 73-156zm106-78l55 15m-55-15c3 27 30 78 55 106v-91M138 706c-5 8-9 13-14 14-15 5-24-10-24-10v497c24 18 46 37 66 57a535 535 0 0 0-28-558zm-38 904l-110 110m365-887l141-144 21 23a47 47 0 0 0-7 0c-10 0-20 5-27 11a44 44 0 0 0-8 48c-6-2-12-2-18-2-10 1-19 5-26 12a43 43 0 0 0-11 39l-13-1c-10 1-19 5-26 12a43 43 0 0 0-11 39l-1-1a15 15 0 0 0-6 0zm745-313a10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10 10 10 0 0 1 10 10zm30 65a10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10 10 10 0 0 1 10 10zm45 70a10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10 10 10 0 0 1 10 10z',
                /* 2,0,2,3 Jack court_BLUE 3 Clubs */
                'M600 695h130v15H600zm0 130h104l-16 15h-87zm305-351v41l8 13-8 12v41l36-54zm130-4l-39 58 39 58v-42l-11-16 11-17zm-108-45l41 61 29-44-23-6-6 9-7-12zm41 144l-39 59 39 58 20-29 19-29-19-30zm0 41l1 1 11 17-11 16-1 1-11-17zm-63 101l21-4-21-32zm111-14l19-28v29l-19-1zm-660 421c18-36 33-73 46-110l68 45c-35 28-73 51-114 65zm643-336l-36 2-6 1 5 37 6-1 6-1 8-13-9 1-2-12 19-1 26-39h-6c-35 1-67 5-97 12l-7 2 15 47c-22 6-43 15-62 25l-6-10c10-6 20-10 30-14l7-3-17-33-6 2c-30 12-57 28-83 47l-5 4 30 38c-19 15-38 31-57 49l-8-9 28-25 4-4-24-28-5 4c-23 20-46 42-69 65l-6 6 36 36-61 63-9-9 16-16 4-5-9-9-4 5-20 21-4 5 27 25 4-4 69-72 4-5-35-35c20-20 40-40 61-57l8 9-28 25-5 5 26 27 5-5c21-21 43-39 65-55l5-4-30-39c22-15 45-29 70-39l5 11c-11 4-21 9-31 15l-6 3 20 31 5-3c22-12 45-21 71-27l6-2-15-47c25-6 52-9 82-10v5M-10 1670l120-120M340 490c3 73 0 146-10 220l-63-17c2 10 2 18 0 26l-31-22c-19 92-37 184-126 289v226c139-127 255-406 241-714m77-238a10 20 0 0 1-10 20 10 20 0 0 1-10-20 10 20 0 0 1 10-20 10 20 0 0 1 10 20zm141 2a10 20 0 0 1-10 20 10 20 0 0 1-10-20 10 20 0 0 1 10-20 10 20 0 0 1 10 20z'
            ] // <<< end Jack court BLUE
            ,
            [ /* 2,0,3 = Jack court_BLACK*/
                /* paths:2,0,3,0 Jack court_BLACK 0 Spades */
                'M280 545l35-17v230l-35-35zm150 375l-15-25h376l9 25zm50-325h324l-28 40H480zm745 820a514 514 0 0 0-65-389l51 33a559 559 0 0 1 39 368l-25-12zM955 847l30-47 18 71M480 166l20 34c144-30 292-47 435-30l24-30c-120-51-359-23-479 26z',
                /* 2,0,3,1 Jack court_BLACK 1 Hearts */
                'M633 94c-111-1-211 20-297 44l20 21c128-37 303-61 459-9l27-28c-73-20-143-28-209-28zM266 513l-4 2-7 22 12 13 48-8-14 45 10 13 46-4-12 52 12 12 45-8-12 56 12 12 44-7-16 49 12 13 49-8-16 50 10 13h51l-15 42 9 13h49l-7 17 21 1 11-24-9-14h-51l15-42-9-13h-51l16-52-12-13-49 8 16-50-12-13-45 8 12-56-12-12-45 8 12-51-11-12-45 4 15-46-11-13-49 8 4-13zm627 30l-45 7-8 12 13 56-55 12-7 14 21 51-51 21-5 13 21 52-42 25-4 14 21 37-43 35c-3 3-5 6-4 10l23 1 43-35 3-13-21-36 42-25 4-13-21-51 51-21 5-13-20-49 53-12 8-12-13-55 53-8zm-543 7a8 8 0 0 0-7 8 8 8 0 0 0 7 7 8 8 0 0 0 8-7 8 8 0 0 0-8-8zm-62 8a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm605 20a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-453 7l220 285c24-101 57-200 105-285zm388 8a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-358 7h270c-40 75-68 155-85 240zm-137 8a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm60 0a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm646 43c-52 69-90 143-118 222a294 294 0 0 1 0 378l81 105c71-78 140-188 186-304l-23-18c-38 101-94 198-154 275l-48-63a321 321 0 0 0 57-198h30a3 3 0 1 0 0-6h-31l-2-24h46a3 3 0 1 0 0-6h-47l-5-24h54a3 3 0 1 0 0-6h-55l-6-21h76a6 6 0 0 0 4-2l-6-10h-79l-7-18h73a6 6 0 0 0 3-1l-6-11h-76l-9-18h76l-4-12h-80l-12-18h85l-4-12h-86l7-18h74l-3-12h-66l8-18h55l-2-12h-48l9-18h36l-1-12h-29c12-22 25-44 39-65 1-18 4-35 8-53zm-196 2a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-465 15a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm60 0a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm345 10a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-300 45a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-65 5a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm387 7a8 8 0 0 0-7 8 8 8 0 0 0 7 7 8 8 0 0 0 8-7 8 8 0 0 0-8-8zm-55 30a8 8 0 0 0-7 8 8 8 0 0 0 7 7 8 8 0 0 0 8-7 8 8 0 0 0-8-8zm457 9c11 55 47 100 93 118v-49l-93-69zm-744 9a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm65 0a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm250 35a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-270 25a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm65 0a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm152 2a8 8 0 0 0-7 8 8 8 0 0 0 7 7 8 8 0 0 0 8-7 8 8 0 0 0-8-8z',
                /* 2,0,3,2 Jack court_BLACK 2 Diamons */
                'M130 1057c-4 0-4 6 0 6h60c4 0 4-6 0-6zm-10 25c-4 0-4 6 0 6h85c4 0 4-6 0-6zm-20 27v12h118l2-12zm0 25v12h112l3-12zm0 25v12h104l4-12zm0 25v12h97l3-12zm18 37h68l5-12h-87zm29 25h28l5-12h-46zM886 125l-62-1c-145 0-291 9-441 37l-26 4 33 35c168-31 332-39 495-35l35-38zm48 474a428 428 0 0 1-377 69l44 49c124 18 244-4 337-70zM817 960L444 541l-36 4 388 437zM496 689L355 833l-11-35 131-133zm382 209l-18-19 51-55 20 21m-738 451a586 586 0 0 0-39-634c-5 16-10 33-16 44a538 538 0 0 1 29 558z',
                /* 2,0,3,3 Jack court_BLACK 3 Clubs */
                'M585 695l-113-59 2-28 106 62 305-160v25zM440 873l-8 35c44 20 81 46 117 74l31-33V692l-20-10v263c-36-28-75-53-120-72zm310-85V607l20-10v177l-20 14zm325-314l-20-10v235l9 1 11-12zM330 710c10-74 13-147 10-220l-19 8 2 13c6 65 0 138-11 194zM110 966h17l9-12h-25zm0-30h39l6-12h-46zm0-60h73l5-12h-78zm0 30h57l6-12h-63zm0-60h86l5-12h-91zm1-30h84a6 6 0 1 0 0-12h-85zm-1-33h65c4 0 4-6 0-6h-65zm0-30h45c4 0 4-6 0-6h-46zm146-40l-2 6c-17 85-40 175-121 274l-1 2v164l11-14c76-95 142-242 171-411l1-5zm9 15l36 9a929 929 0 0 1-157 387V999c79-98 103-188 121-271zm489-175l-25-54-60 30 26 56m18-55a12 12 0 1 1 0 25 12 12 0 0 1 0-25zm57-52l25 54 60-31-25-52zm43 0a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm-232 97l26 56 59-31-26-56zm42-2a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm-112-26l-26 45 58 33 26-46zm27 31a12 12 0 1 1-21 14 12 12 0 0 1 21-14zm369-439l-14-2c-105-16-212-31-324-30-66 0-134 6-204 20l-12 3 17 20c181-37 352-16 520 10l17-20 133-160'
            ] // <<< end Jack court BLACK
            ,
            [ /* 2,0,4 = Jack court_BLUE_DETAIL */
                /* paths:2,0,4,0 Jack court_BLUE_DETAIL 0 Spades */
                'M1300 708c-135-88-255-162-386-226 M779 854c90 302 247 491 521 592 M791 895H416m384 25H430m378 25H443m462-457L702 786m279-270L750 855M417 481c-94 43-188 87-280 137m198-98v261m115-289v266M280 545v178m35-194v229m165-278v276m0-241h380L660 803 M713 771l64 44m-54-60l65 45m168-206c126 72 242 150 344 227 M969 573c120 70 232 145 331 220M989 544c113 66 218 131 311 201m0 258a331 331 0 0 1-218-333m218 426c-66-20-127-54-177-100a402 402 0 0 1-124-378m301 361a308 308 0 0 1-190-291m190 272a291 291 0 0 1-172-260m172 358c-58-19-111-49-156-89a362 362 0 0 1-118-334m5 95a338 338 0 0 1 4-89m26 201c-15-33-25-68-29-105m90 198c-23-26-42-55-57-85m139 155a407 407 0 0 1-73-60m153 100c-20-8-40-17-58-27m-186-301a333 333 0 0 1 3-64m21 171c-10-24-17-50-21-77m71 165c-13-18-25-36-35-55m109 126a394 394 0 0 1-32-26m120 77l-21-10 M972 888c41 22 80 51 113 87a478 478 0 0 1 114 427 M966 884l6 4m-184-48c62 1 122 16 178 44m228 495l-1 9m5-35l-1 10m4-68v5l-2 38m1-66v12m-3-42l2 16m-12-74c4 16 7 33 9 50m-15-71l3 12m-12-38l5 12m-29-67l20 43m-31-63l4 6m-19-30l7 9m-49-63c12 13 24 28 35 43m-51-60l5 5m-23-22l5 5m-60-45l41 29m-60-40l4 2m-25-13l4 2m-74-27c18 4 35 10 52 17m-74-22l9 1m-34-6l9 2m-61-5l36 2m373 446v2l-1 36m-1-82v1m-11-66c4 14 6 29 9 43m-47-145c7 13 13 26 18 40m-85-136c12 13 23 26 34 41 M986 918c14 9 27 18 40 29m-146-74c17 4 33 10 49 16m-149-29a437 437 0 0 1 36 2m366 435a295 295 0 0 1-1 40m-12-146c4 14 6 29 9 44m-46-144c6 13 13 27 18 41m-85-136s0 0 0 0c13 13 24 28 35 43 M979 926c15 9 29 19 43 30m-146-74c18 4 35 10 52 17m-143-29l32 2m353 422a454 454 0 0 1-2 47m-12-151c4 16 8 33 10 51m-47-148c8 15 15 31 21 47m-87-139a403 403 0 0 1 40 49 M968 934c17 10 34 21 49 34m-149-75c20 5 40 12 59 20m-138-30l32 2m339 405a435 435 0 0 1-2 56m-13-158c5 19 9 39 12 59m-49-153c9 17 18 36 25 54m-92-144a392 392 0 0 1 47 58 M956 939c21 12 41 26 59 41m-155-78c24 6 47 14 69 24m-138-32l35 2m324 388a426 426 0 0 1-3 69m-13-170c6 24 11 48 14 73m-53-164c12 22 23 44 31 67m-40-83v1m-59-73a380 380 0 0 1 59 72 M940 943c27 13 53 31 76 52m-82-55l6 3m-93-32c30 6 60 15 87 29m-139-35c13 0 26 2 40 4m-22 46c202 5 320 193 297 395m-277-345a295 295 0 0 1 228 308m-211-273a267 267 0 0 1 183 249m127-263a517 517 0 0 1 65 389 M829 994l47-31 39 73 81-12 1 83 83 32-29 79 61 52-43 50 M813 955l49 57 80-24 16 78 85 9-13 86 72 47-41 62 51 54-16 16m-24-18l40 2m153 109v-243m15 249v-239m15 245v-235m-240-359c37-11 25 48 76 17m-41-91c-57 27-5 50-36 73m67 97c30-14 36 40 75-4m-65-75c-46 40 4 49-12 76m94 76c23-12 43 30 68-24m-83-53c-33 49 10 47 8 73m75-20c-18 48 7 48 19 61m-278-321c41 0 9 53 68 40m-10-99c-62 8-19 47-58 58m20-89c3 15 1 33 38 31m2 60c-8 3-17 5-27 3m10-25c1 17 9 18 17 18m0 7c-7 5-16 12-17 20m42 63c-8 5-16 10-28 12m3-27c6 18 15 14 23 13m2 5c-6 7-14 16-12 25m68 58c-3 9-6 17-13 25m-15-22c15 9 20 1 25-5m5 6c0 9 1 18 7 23m69 38c-2 7-5 13-11 20m-15-23c12 8 17 5 21 0m9 5c1 8 2 16 7 20m25-191c-11 22 9 47 23 59m-50-80c-45-9-118-17-110-44 3-9 11-16 18-20m8 46c-40 32-12 48 108 53m-94-10c-27 59 44 33 96 24m-76 14c-14 54 30 34 84 0m-63 32c7 59 38 28 73-21m-45 50c28 71 39 4 51-38m-18 58c8 17 14 25 18 26M894 800l-2 2m69-102l-2 4m-54 99l-6 9m74-110l-8 13m-45 86l-17 26m87-129l-22 32m-26 58l-29 42m77-113l-26 39m-14-61c47 38-8 124-56 105l-9-5m105-96c-13 5-27 5-40-4m-65 100c11 9 16 20 18 32m317-468c18 0 33 27 33 60s-15 60-33 60-32-27-32-60 14-60 32-60v0m0-109l29 29-29 30-29-30 29-29v0m0-171c18 0 33 27 33 60s-15 60-33 60-32-27-32-60 14-60 32-60v0m16 441c24-13 41-53 41-101 0-40-12-76-32-94l46-46-46-46c19-17 32-54 32-94 0-58-26-105-57-105s-57 47-57 105c0 40 13 77 32 95l-46 45 46 46c-19 18-32 54-32 94 0 34 9 64 22 83m-89 78c2-13 11-40 19-45 10-6 45-35 60-35s30 20 60 20c25 0 20 20 0 20s-35-5-35-5c-15 17-25 15-35 20s15-5 20 5c4 9-15 53-19 63m83-87c18 1 31 7 31 14 0 8-19 15-42 15-24 0-43-7-43-15 0-5 7-9 17-12m36 26c18 0 31 4 32 11 1 8-17 17-40 20-24 3-43-2-44-10-1-5 9-15 34-20m18 29c18 0 32 4 32 11 1 8-17 17-40 20s-43-2-44-10c-1-5 9-14 32-19m19 29c16 2 33 9 33 16 0 8-17 15-38 15-20 0-37-7-37-15 0-4 9-13 30-15M930 169c0 26-10 50-9 56 2 10 50 90 52 105 4 27-37 27-39 31-1 2 1 19 1 19 0 5-10 20-10 20s0 10 5 15-25 20-25 20 15 20 15 30-5 25-30 25-55-5-75-5-75-25-85-25m-58 11c7 3 40 18 58 14l40-12m155-78l-20-3c-5 0-10 13-20 13s-10 5-10 5c-1 0 23 4 30-5 3-4 20-2 20-2m-75-8c15 0 35-27 45-27l25-1-4 8-18 2c-5 0-23 23-33 23s-15-5-15-5v0m62-74c-15 0-26 35 0 31s44-18 28-17c-21 1-29 11-33 16m2-154l-8 8s-31-12-48-10c-16 2-78 33-78 33 14-18 87-62 134-31v0m-114 59c32 5 47-31 103-31m-68 22c-32 29 66 20 66 20m-393-68c17 64-52 104-43 176 5 40 70 35 70 0 0-25-30-20-30-5s10 20 10 20m13-195c20 65-51 105-42 178 2 19 16 23 29 18m30-199c25 66-46 105-40 178m58-181c27 64-37 103-40 169m59-173c30 67-44 118-47 185m63-187c33 70-46 118-47 184-1 68 74 53 74 18s-52-37-50-5 39 13 30 5m13-206c29 66-46 118-47 184 0 15 4 26 10 32m58-219c26 64-43 120-49 182m35 27c30 56 115 28 115-15 0-55-55-45-55-10s45 15 25-5m-50-182c23 65-45 139-45 177l2 14m62-193c26 64-45 127-39 189 5 50 80 42 80 15 0-10-10-20-10-20m-11-186c32 85-86 177-6 209m-203 98c-31 27-80 12-80-21 0-55 50-40 50-15 0 21-30 20-30-5m85-34c1 17-1 32-5 44m-10-42c11 60-69 90-75 52-1-5 0-10 5-20m58-33c-3 26-20 59-43 53m133 30c-31 34-88 31-88-15 0-30 50-35 50-10 0 30-30 20-30 10m87-56l1 22m-17-22c1 14 0 38-11 51-29 34-59 15-60 5-1-5 2-7 5-10m54-51c-6 45-18 72-39 70m28-80c-5 22-11 44-18 61m11-83c-7 23-17 50-27 67m170-30c-10 115-125 104-119 51 5-45 49-30 50-5 1 26-30 25-30 5m84-49c-6 42-47 95-75 63m60-64c-5 30-16 54-43 59m27-65c-4 23-14 38-23 50m9-61c-1 18-8 34-15 48m-8-38c2 10 2 21 0 31M339-1c56 57 120 123 161 201 144-30 292-47 435-30 47-63 107-118 172-170M480 166c120-49 359-77 479-26',
                /* 2,0,4,1 Jack court_BLUE_DETAIL 1 Hearts */
                'M498 1098V903h305m-305 17h304m-304 20h305m-305-37L220 544m308 359L240 531m398 372L332 508m336 395L360 505m484 2C742 620 702 760 668 903m194-382c-93 110-131 245-164 382m230-334a844 844 0 0 0-155 334m174-320a853 853 0 0 0-144 320m216-266c-52 66-90 137-119 213m139-199c-52 69-90 143-118 223m-88-72a297 297 0 0 1 88 449M809 875a221 221 0 0 1 64 314m-70-282a191 191 0 0 1 51 256M410 570h385m-423-50h459m-451-30h440l480 353M266 513L0 696m235-132L0 726m950 137a322 322 0 0 1 13 383m337-150c-153-25-270-177-270-361 0-29 3-57 8-84m262 334c-100-24-175-127-175-250l1-20m174 239c-86-24-149-113-149-219v-2m149 159c-46-18-82-63-93-118m5 292c-49 120-123 232-196 307m172-321c-46 116-115 226-186 304m163-322c-38 101-94 198-154 275m-49-63l49 63m20-605c-33 50-60 103-81 158M423 585h362m515 493c-143-19-255-164-255-339 0-27 3-53 8-78m6 80v-2c0-24 3-47 7-69m12 186c-8-25-14-51-17-79m79 192c-20-24-37-51-50-81m151 156c-31-13-59-32-84-57m143 74l-24-5m-199-338c0-12 2-25 4-37m13 169c-8-24-14-50-17-78m73 181c-18-21-33-45-44-72m147 147c-29-11-55-28-78-49m-82-263l3-23m7 129l-7-34m55 137l-22-34m112 111c-13-6-27-14-39-24m-93-246l2-28m-2 30v-2m0 21a320 320 0 0 1 0-19m12 90l-9-42m19 72l-3-8m39 71c-9-12-17-24-24-37m47 63l-4-4m114 62c-32-5-62-19-88-39m-87-110c25-40-54-42-29-2-45 1-12 63 13 27 17 41 66-20 16-25v0m-24-102c33-34-43-54-28-9-44-9-25 59 8 29 7 44 68-5 20-20v0m85 193c12-45-64-25-29 7-43 14 7 63 21 21 28 34 57-38 8-28v0m114 67c-5-2-12-2-22 3-2-46-68-4-25 15-37 26 25 59 26 15 9 5 16 5 21 2m-498-4c13-6 38-18 53-21 32-7 34 39 5 40l-57 4m-1-11l33-8m-32-28c8-9 24-26 35-33 24-16 40 20 17 31l-51 25m-1-9l27-20m-27-42l12-19c18-22 44 8 25 25l-37 35m0-16l12-16m-12-62c12 1 23 17 13 30l-13 19m0 103c13-2 42-5 58-3 32 4 19 48-9 39l-49-13m0-12l31 3m-31 9c13 4 40 11 54 19 26 14 5 44-16 37m-30-38l14 7m-4-233l19-23c21-25 50 12 35 30l-20 23m11 13l26-16c27-18 44 26 24 39l-25 16m6 14l29-7c32-8 34 39 11 45l-27 7m3 18l27 1c32 1 21 47-2 46h-26m-4 21l26 6c31 8 11 50-12 45l-28-7m-6 11l24 18c19 14 4 35-13 39m-68-416c8 11 11 26 5 38 34-41 81 19 57 49 44-29 72 43 39 63 52-12 55 64 18 74 53 1 35 76-4 75 52 12 19 82-18 73 29 22 10 53-15 62M0 27l105 128v468M0 102l60 73v479m46-433c66-60 47-99 44-141 151 129 110 255 15 380-1-59-8-113-60-128m48-228c22 29 48 56 2 126 20 8 40 14 60 35-16 24-38 33-60 40 17 37 52 61 10 140m921 241c2-15 5-43 9-46l50-60c5-5 35-10 40-10s27 10 30 25c10 45-10 75-35 10-10 10-15 10-30 10 43 34 29 60-15 80m55-125l15-15c31-24 77-8 30 30-7 6-13 10-19 12m15-9c37-11 67 9 8 42-55 32-78 14-54-13m53 14c34-3 55 18-2 38-60 21-77-2-44-22m45 22c35-2 56 22 1 36-57 14-69-12-32-28m-28 76c22-7 50-32 53-46m-62-34c4 19-16 43-19 42m-135-250c-5 40 35 55 75 25 54-40 157-42 105 65-10-35-73-22-115 5-70 45-135-65-65-95v0m0 0c-45 53 14 102 90 50 74-51 113 24 90 40l-5 15m-16-105c8 16 15 32 16 49m-40-49c10 11 18 23 23 36m-63-23c9 7 18 14 25 22m-59-1c13 2 25 6 36 12m-63-5c10 8 19 16 25 25m-54-40c7 15 13 31 15 46m130-3c6-10 4-22 0-35m-23 36c5-10 3-22 0-37m-41 50c5-8 5-20 5-33m-54 55c7-8 10-21 13-36m-60 19c6-5 12-11 18-19M807 147c6 18 13 42 13 48 0 11-5 13-5 20 0 5 40 70 40 90s-20 20-25 20 0 20 0 25-5 15-5 15 5 8 5 15c0 15-30 15-30 15s5 15 5 20 20 0 20 25c0 10-30 35-40 35s-20-10-30-10-25 10-35 10-61-21-80-30c-10-5-9-20-26-27-10-4-21-19-30-36m216-87c-39 4-16 40 20 15 8-6 0 5 0 5-9 0-18 5-25 4m-47 47c20-3 43-24 48-29 4-4 15 4 14 10-20 10-48 22-62 19m36 8c14-2 28-1 41-10M687 224c2 3 66-39 77-43 14-5 27 7 26 6l2 11s-16-12-25-9-79 40-80 35v0m28 21c33-2 60-32 87-30m-57 22c-12 28 41 8 58 17m17 236l-25-19M366 156c-51 122 18 219-46 324-10 16-50 25-55 0-9-44 50-28 35-10m89-320c-58 125 7 218-49 330-20 40-91 51-95 5-7-80 95-60 75-5m92-336c-63 128 5 223-52 336a68 68 0 0 1-68 34m142-375c-67 130-2 226-59 341-9 17-23 24-39 26m120-371c-71 132-3 219-61 335-12 25-37 39-60 35m143-374c-74 134-4 217-63 334-12 24-30 33-52 30m137-367c-77 135-6 219-65 337-12 25-27 29-50 25m137-364c-80 136-8 220-67 339-12 25-32 29-55 25m143-367c-82 138-8 213-68 332-12 25-27 34-50 30m139-363c-83 139-9 208-69 328-12 25-27 34-50 30m140-359c-85 139-10 204-70 324-10 21-18 27-35 26m125-351c-85 140-10 190-70 310-9 18-17 28-30 30m120-340c-85 140-10 180-70 300-6 12-15 18-26 21m116-320c-85 139-5 149-65 269-7 15-14 22-23 25M336 138c138-38 312-69 506-16M200 0l156 159c128-37 303-61 459-9L960 0',
                /* 2,0,4,2 Jack court_BLUE_DETAIL 2 Diamons */
                'M100 710v900L0 1710M100 678v14m0-47v17m0-52v15m0-228v198M0 0l100 100v197m0 910a521 521 0 0 1 200 316m-93-978a725 725 0 0 1 54 861m97-239l296-301M365 542l410 461M650 870v135m-15-120v236m-15-220v203m-15-188v171m-15-156v139m-15-124v107m-15-91v74m-15-59v42m-15-27v11M408 545l388 437M444 541l373 419m-448 151l264-268m-278-10l141-144M344 798l131-133m-331-78l118-78m678-49l260 71m-318-6c-41 34-89 55-141 63-77 12-165-6-259-56m-29 6c104 60 203 83 291 70 87-13 162-61 217-142m-111 58c-33 24-71 38-112 44-68 11-147-4-232-47m51 147c142 34 281 12 377-69m-3-65l17 275m3-297l15 238m-365-33c124 18 244-4 337-70m-178 70c8 25 24 70 40 93 20 28 61 71 78 88m-91-186c8 26 23 67 38 88 12 17 34 41 52 60m-64-154c9 26 23 64 37 84 11 15 28 35 45 53m-56-145c8 25 22 62 36 82 13 19 37 45 56 65M154 662a586 586 0 0 1 39 634m1007-580a444 444 0 0 1-133-222m132 260a489 489 0 0 1-166-268m112 30c3 27 30 78 55 106M80 240L0 160m0-40l80 80m0 80L0 200m80 355L0 475m0-40l80 80m0 355L0 790m0-40l80 80m0 80L0 830m80 355l-80-80m0-40l80 80m0 80l-80-80m80 355l-80-80m0-40l80 80m0 80l-80-80m80-744v864l-80 80M80 404v183M0 50l80 80v171m513 582L493 773c-20-30 10-60 40-40l100 110m-94 95l-99-108c-20-30 10-60 40-40l98 108m-89 91l-99-109c-20-30 10-60 40-40l99 108m-163-64c5 1 9 3 14 6l99 109m-40 40l-63-69m1 22l52 57m-40 40l-15-17m143-360a47 47 0 0 0-7 0c-10 0-20 5-27 11a44 44 0 0 0-8 48c-6-2-12-2-18-2-10 1-19 5-26 12a43 43 0 0 0-11 39l-13-1c-10 1-19 5-26 12a43 43 0 0 0-11 39l-1-1a15 15 0 0 0-6 0m549-45l-52 55m-11-153c30-14 61-30 91-47m-80 74c28-13 55-26 82-42m-68 68l70-35m-52 58l54-26m-34 49l36-18m-28 49l19-9m-91-123l42-34-50 11m20 51l45-37-53 11m22 52l46-38-53 11m24 50l44-36-53 11m65 15l-50 10m13 21l37-30m-2 28l-28 6m5 28l18-15m-143-28l-62-6 50-20m32 51l-62-6 46-18m36 49l-62-6 46-19m36 50l-62-6 48-19m22 49l-55-5 50-20m-88-134c-46 7-88 11-128 13m128-13l-62-6 50-20m24 57c-37 6-76 10-115 12m115-13l-59-6 49-19m27 55c-35 5-70 9-106 12 0 0 0 0 0 0m126 13c-34 5-69 9-104 12m125 12c-33 6-68 10-103 13m126 12c-34 6-68 10-104 13m103 15c-26 4-53 7-81 9m50 22l-28 3m41-16l-16-1 28-11M138 706a538 538 0 0 1 29 558m-22-677a636 636 0 0 1 72 742m24 36a681 681 0 0 0-65-799m-31 21a637 637 0 0 1 73 742m-42-763a681 681 0 0 1 65 799M100 710s9 15 24 10c16-5 32-55 31-80s-15-65-15-70 2-15 2-35c0-30-32-45-34-2-1 12 2 17 7 32m0 0c-1 5-10 15-10 20 0 20 8 23 8 23M0 603a53 18 0 0 1 53-18 53 18 0 0 1 52 18 53 18 0 0 1-52 17 53 18 0 0 1-53-17m0 32s0 0 0 0c0-7 14-13 34-16m40 0c21 2 36 8 36 16 0 10-25 18-55 18s-55-8-55-18m0 35a53 18 0 0 1 53-17 53 18 0 0 1 52 17 53 18 0 0 1-52 18 53 18 0 0 1-53-18m81 15c14 3 24 9 24 15 0 10-21 18-47 18-27 0-48-8-48-18 0-6 8-11 20-14m41-100L0 515m0-205c98-3 187-31 265-95-22 94-78 176-265 209m0-94c81-3 157-22 226-63-11 22-26 43-46 61-36 33-92 59-180 76m404-206c-68 142-57 233-84 267-20 25-55 30-55 0 0-35 35-15 35-10m120-260c-69 143-59 234-85 270-25 35-70 30-70 0m171-273c-70 145-61 236-86 273-65 95-110 35-110 0 0-75 90-50 85-10m128-265c-73 146-68 235-88 275s-78 66-95 49m199-327c-74 148-69 238-89 278s-64 68-85 55m190-335c-75 149-71 238-87 280-15 40-64 81-88 60m191-342c-76 150-68 242-85 284-21 53-54 86-82 66m183-352c-77 151-70 244-84 287-13 42-48 88-77 70m177-359c-78 153-70 245-80 290-8 36-38 92-74 71m170-363c-79 154-62 252-77 295-12 38-39 81-68 72m161-368c-80 154-61 249-68 294-7 40-36 77-69 70m152-365c-80 155-53 251-63 296-7 29-28 68-58 65m136-361c-80 155-40 259-57 301-15 38-35 51-52 52m387-363c5 20 17 62 17 70 0 10-10 40-10 55s-10 70-20 95-45 90-50 100-10 40-25 45-50 20-65 10-20-15-30-15-30 5-45 0-85-15-90-30c-4-13-10-20-12-38m57-207c38-16 66-53 135-10v0l-5 5c-36-35-82-18-130 5v0m285-10c-35-15-45-30-95 5v0c30-15 67-26 95-5v0m-95 5c-6 3-7 21-5 30 2 10 15 50 15 60s9 52 9 57c0 10-19 18-34 18m-35-40c-21 2-38 39 9 31 30-5 11-11-19-1m-35 40v15l10-10-10-5v0m110-5l-5 10-10-5 15-5v0m-105 10c15 0 30-10 35-10s15 10 20 10 15-10 20-10 10 5 15 5m-55 30c10 11 40 15 40-10M595 285c35 5 80-30 120-30m-80 25c-5 15 55 25 70 15s20-5 20-5m66-5c20 0 52-23 70-25s20 10 20 10m-91 15c20 10 33 20 53 20 19 0 37-15 37-15m3-124c34 55 16 119 17 179 1 16 15 10 20 5m-44-27c-13 79 64 69 64 27 0-40-40-25-40-5m-5 35c0 45 20 70 35 45m-67-47c0 88 95 106 87 42-5-40-50-20-49-3m-51-8c4 50 43 73 75 61 19-7 21-18 21-24m-110-11c9 43 67 69 94 35m-103-17c9 41 45 59 73 48 10-4 18-12 20-22m-102-10c12 36 45 52 72 42 10-4 16-9 19-14m-100-10c7 37 80 57 91 19m20-380l-34-1-62-1c-145 0-291 9-441 37l-26 4M200 0l190 200c168-31 332-39 495-35L1041 0M472 572c96 49 190 69 275 56 92-14 172-66 231-150l3-6',
                /* 2,0,4,3 Jack court_BLUE_DETAIL 3 Clubs */
                'M0 1660l110-110V565m0 859c314-261 358-585 369-929m-123 623c243-84 336-452 708-419m-726 454c139-35 229-153 327-252 99-100 202-184 377-175 M452 469c-10 345-45 660-342 918m965-913v214m-20-224v234m-20-243v242M905 421v290m-20-293v299m3-299c166 25 232 76 302 143M411 985c28 14 53 33 78 51m-64-101c39 21 71 44 101 68m-94-95c44 20 81 46 117 74M439 874c46 18 85 43 121 70m-84-358l104 59 305-160M474 608l106 62 305-160M472 636l113 59 300-160M560 682v263m20-253v257m20-262v240m130-309v185m20-196v181m20-191v177M478 528l92 52 319-162M685 765a20 20 0 0 0-20-20 20 20 0 0 0-20 20 20 20 0 0 0 20 20 20 20 0 0 0 20-20v0m-40-20c-15-30 10-25 20-20 10-5 35-10 20 20 30-15 25 10 20 20 5 10 11 34-20 20 15 30-10 25-20 20-10 5-35 10-20-20-30 15-25-10-20-20-5-10-10-35 20-20v0m-24 160c0-5 2-11 4-15-5-10-10-35 20-20-15-30 10-25 20-20 4-2 10-4 15-4m-25-189c3 2 6 3 10 3 10 0 19-8 20-18m23-13c0 4-2 8-3 11 5 10 11 34-20 20 15 30-10 25-20 20-9 5-32 9-22-16m-241 344l68 45m435-620l130 195m0-1l-47 71m-82-64l46 68m68-252L906 621m0 54l21 32m89-10l19-28m-596 332l13-24c12-20 39-3 28 17l-14 25m14-25c12-20 37-2 26 18l-12 21m-83-48l14-26c12-20 38-3 27 18 M70 487V200H0m70 366v-12m0 64v-40 M0 1600l70-70V631M0 160h140L0 3m0 127h80L0 50m315 845a8 8 0 0 1-7 8 8 8 0 0 1-8-8 8 8 0 0 1 8-7 8 8 0 0 1 7 7 v0m0 0c30-40 80 5 90-10m-90 15c10 49 72 27 75 45m-72-49c33-18 82 29 87-11m-15 60c5-30-66-20-72-46 24 24 67 31 77 21m0 0c4-21-63-33-80-20m17-75a7 8 0 0 1-7 8 7 8 0 0 1-7-7 7 8 0 0 1 7-8 7 8 0 0 1 7 7 v0m0 0c28-42 80 1 89-15m-88 20c12 48 73 23 77 41m-75-45c32-20 84 24 86-16m-11 61c3-30-67-17-75-42 26 23 69 27 78 17m0 0c3-22-65-30-80-16m14-82a7 8 0 0 1-6 8 7 8 0 0 1-8-6 7 8 0 0 1 6-9 7 8 0 0 1 8 7 v0m0 0c25-42 76-1 85-17m-85 22c14 48 71 22 75 39m-72-43c30-20 80 22 82-18m-10 61c2-30-64-15-72-40 25 22 66 26 75 15m0 0c2-21-63-28-78-14m12-73a7 8 0 0 1-6 8 7 8 0 0 1-8-6 7 8 0 0 1 6-8 7 8 0 0 1 8 6 v0m0 0c21-45 72-9 79-25m-79 30c17 46 70 14 75 32m-73-37c27-23 79 15 77-25m-4 62c0-31-63-9-72-34 25 20 65 20 72 8m0 0c1-21-62-22-75-6m8-83a7 8 0 0 1-6 9 7 8 0 0 1-8-6 7 8 0 0 1 6-9 7 8 0 0 1 8 6 v0m0 0c20-44 72-8 78-24m-78 29c17 47 69 15 74 32m-72-36c27-23 78 15 76-25m-4 61c0-30-62-9-71-33 25 20 64 19 72 8m0 0c0-22-62-22-75-7m0-70a7 8 0 0 1-6 8 7 8 0 0 1-8-5 7 8 0 0 1 6-9 7 8 0 0 1 8 6v0m0 0c20-45 73-11 80-27m-79 32c17 46 70 13 76 30m-74-35c26-24 79 13 77-27m-3 62c-1-31-64-8-74-32 26 19 66 18 74 6m0 0c0-21-64-21-76-4m-75 422a8 8 0 0 1-9 7 8 8 0 0 1-7-9 8 8 0 0 1 9-7 8 8 0 0 1 7 9v0m0 0c35-39 81 16 93 1m-94 4c4 54 71 39 71 58m-67-61c35-15 80 41 90-1m-23 62c9-31-65-30-68-59 22 30 65 42 76 33m0 0c7-22-60-44-79-32m-29 65a8 8 0 0 1-9 7 8 8 0 0 1-7-9 8 8 0 0 1 9-7 8 8 0 0 1 7 9v0m0 0c35-38 80 17 92 2m-93 3c3 54 70 39 70 59m-67-62c36-15 80 42 90 0m-23 62c9-32-65-31-67-60 21 30 64 43 75 34m0 0c7-22-59-44-78-33m-37 63a8 8 0 0 1-9 6 8 8 0 0 1-6-10 8 8 0 0 1 10-6 8 8 0 0 1 5 10v0m0 0c42-33 80 29 95 17m-96-12c-4 55 65 51 63 70m-59-73c39-8 75 55 92 15m-33 58c14-30-61-41-60-70 18 33 59 53 72 45m0 0c10-20-54-53-75-45m-47 64a8 8 0 0 1-10 5 8 8 0 0 1-4-11 8 8 0 0 1 10-4 8 8 0 0 1 4 10v0m0 0c47-28 78 38 94 27m-96-22c-9 53 62 57 57 76m-52-78c40-5 70 62 91 24m-39 54c17-28-58-48-53-76 14 35 54 59 68 53m0 0c13-20-50-59-72-53m-49 53a8 9 0 0 1-11 4 8 9 0 0 1-4-12 8 9 0 0 1 11-4 8 9 0 0 1 4 12v0m0 0c50-27 79 45 96 34m-98-29c-14 56 60 65 54 85m-50-87c42-3 69 71 94 31m-44 56c19-29-58-55-51-85 13 38 53 67 68 61m0 0c14-20-48-67-71-61m-14-21c139-128 255-407 241-715m-222 865c8-9-3-28-19-43m0 40c8 5 14 5 19 3m-19 22c5-7 4-13 1-20m-1-45c18 19 32 37 48 15m-47-39c22 15 35 44 47 38m-48-347c89-106 107-198 126-290 M15 200c0 24 20 46 20 70s-20 46-20 70m2 295c5 18 18 36 18 55 0 24-20 46-20 70m1-151l-1 7m0-276c0 24 20 46 20 70s-20 46-20 70c0 19 12 36 17 54M15 760c0 24 20 46 20 70s-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70c0 18-11 34-17 52M30 200c0 24 20 46 20 70s-20 46-20 70m3 298c6 17 17 34 17 52 0 24-20 46-20 70m0-420c0 24 20 46 20 70s-20 46-20 70c0 18 11 35 17 52 M30 760c0 24 20 46 20 70s-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70c0 9-3 17-6 25m1-1355c0 24 20 46 20 70s-20 46-20 70m3 297c5 17 17 34 17 53 0 24-20 46-20 70m0-420c0 24 20 46 20 70s-20 46-20 70c0 11 4 21 9 32m-9 248c0 24 20 46 20 70s-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70-20 46-20 70 20 46 20 70v4M0 115h64 M0 100h49M0 85h35 M0 70h21m119 510c-30 0-40-20-30-60-12 7-12-6-15-15l-19 26c-10 15-36-1-21-21s16-26 20-30c5-5 25-5 45 0s55 50 55 50c-2 40-8 76-15 110-17 6-33 6-49 3 M71 537c7 2 10 5 10 8 0 7-16 13-36 13s-36-6-36-13c0-6 16-12 36-12h10m20 40a36 13 0 0 1-36 12 36 13 0 0 1-36-12 36 13 0 0 1 36-13 36 13 0 0 1 36 13v0m-5 27a33 13 0 0 1-33 13 33 13 0 0 1-32-13 33 13 0 0 1 32-12 33 13 0 0 1 33 12v0m5 25a35 13 0 0 1-35 13 35 13 0 0 1-35-13 35 13 0 0 1 35-12 35 13 0 0 1 35 12v0m100-95c9-7 14-6 20-5 7 54-5 88-15 125-13 3-20 0-20-10m35-115c30-10 58-29 95-20 0 7-2 13-5 18-6 11-17 17-30 22 22 4 34 16 45 30a59 59 0 0 1-49 22c20 8 33 20 44 38-18 7-37 14-50 10 19 28 27 54 22 74-30-18-62-51-87-69m89-147c-20 24-43 43-72 50v2c27 2 53 7 73 19-25 11-49 16-75 13v2c23 10 50 13 65 36-28 4-49-2-71-8l-1 5c24 23 43 51 58 83m164-212l42-6m-111 16l19-3m-71 11l48-20 3 3c3 72 0 143-10 216l-63-17m54-195l2 13c6 65 0 138-11 194m332-573c58 113 31 195 31 298 0 75 85 70 85 5 0-50-60-45-60-5 0 30 45 30 45 10 0-10-5-15-10-20m-66-287c57 113 24 201 31 297m-5-295c48 99 16 183 21 266m5-263c46 96 4 179 15 261m12-258c41 93-4 170 9 252m17-249c37 87-1 161 7 238m19-235c34 82 1 152 5 224m22-220c29 76 3 141 3 208m23-204c25 69 5 130 2 191m25-187c21 63 5 120 1 176M737 480c23 3 48-15 48-50 0-36-31-44-48-30m24 75c22 1 44-17 44-50 0-35-30-43-47-31m31 70c19-3 36-20 36-49 0-39-36-45-52-26m36 65c19-3 36-20 36-49 0-39-37-45-53-26m38 65c18-3 35-20 35-49 0-39-37-45-53-26m34 70c18-4 34-21 34-49 0-35-29-43-46-32m34 71c17-5 32-22 32-49 0-39-37-45-53-26m41 65c17-5 32-22 32-49 0-39-36-45-52-26M393 146l-8 69c0 10 5 30 5 40v70c0 30 67 152 75 160 15 15 63 35 85 30 16-4 96-30 128-63 M383 147c-20 61-17 125-23 188-2 18-26 26-30 0m60-5c-10 50-80 60-80 15 0-43 50-40 50-15m22 21c-15 25 12 83 3 104-10 24-55 30-60 0-3-16 15-20 15-20m43-20c-3 48-28 45-38 45-15-1-15-15-5-25m66-61c4 25 0 70-1 81-5 50-90 50-95 5s59-61 55-25c-4 34-49 28-25 0m140-5c5 10 20 20 40 10m-55-25l15-5c5 0 5 5 15 5s10-5 20-5 5 5 15 5 15-5 15-5M390 220c11-14 56-43 80-10v5c-25-30-66-8-80 5v0m240 10c-5-7-23-31-45-35-25-5-40 0-59 15v5c34-34 95-8 104 15v0m-160-15c19 52 0 75 0 100 0 15-6 35-5 45 2 14 15 15 20 25m45-10c-10-10-55-5-20 0s35-8 35-15c0-5-5-15-15-15m-5-80s15-20 35-20 45 25 80 25c-30 0-50 9-70 10-21 1-35-15-45-15m-135-10c15-10 25-15 40-10s45 20 45 20m0 0c-20 5-40 15-55 15-14 0-30-20-30-20M246 0l124 150c181-37 352-16 520 10L1023 0M907 139l-14-2c-105-16-212-31-324-30-66 0-134 6-204 20l-12 3m-69-84c-67 9-52 101-109 144 93 28 143-35 162-81m-162 81c60 9 94-79 135-113m0 53c4-16-1-31-7-47m-48 2c18-8 33-5 49-1m-64 36c14-9 27-11 41-11m9 46c3-4-3-36-8-47m-57 47c12-8 23-12 34-14m1 34c1-9 1-23-2-35m-48 30c7-1 14-1 20 1m0 14c4-6 4-11 2-16'
            ] // <<< end Jack court BLUE_DETAIL
        ], // <<< end 2,0 court JACK

        [ /* 2,1 = Queen */
            [ /* 2,1,0 = Queen court_GOLD */
                /* paths:2,1,0,0 Queen court_GOLD 0 Spades */
                'M635 0l217 312c43-13 87-22 123-27-50-97-75-191-101-285zM296 27c-50 154-153 309-87 456l-17 14c2 151 30 286 74 398a887 887 0 0 0 73 75h562v-1c15 17 32 35 52 54 77 72 127 127 177 227 53-71 98-110 170-153v-37c-69 39-117 76-165 132-45-78-93-131-160-193a443 443 0 0 1-129-181c-15-48-9-86 8-121 28-57 91-102 139-133l-27-22c-69 46-173 124-160 244l-106 2-132 152H429c149-177 317-346 470-485l-9-11c-29-3-56-10-81-21-2 4-4 8-8 11-136 124-276 231-381 395l-28-17c110-170 253-279 387-402l18 7c-18-9-35-20-51-33a918 918 0 0 1-267 32s-19 15-29 15c-15 0-26-6-31-6s-10 5-25 5-30-25-40-50l-4-6-39 31 10-1c8 139-1 281 43 408l-27 18-3-7c-46-130-39-270-44-402l-70 54 20-17c-53-160 26-275 60-399zM85 80C30 130-15 225 50 225c9 0 15-6 20-16v55c-7-8-15-14-25-14-35 0-40 70-5 70 24 0 23-43 11-45 53 5-16 250-15 296 0 25 6 49 31 56-19 5-32 18-32 33 0 14 12 27 30 32-23 8-30 29-30 48 0 36 13 96 21 126 27-19 50-41 73-66 3-21 6-43 6-60 0-19-7-41-31-48 14-5 25-15 31-32 0-15-13-28-31-33 24-9 30-32 30-56 1-46-68-291-15-296-12 2-13 45 11 45 35 0 30-70-5-70-11 0-19 7-25 15v-56c4 10 10 16 20 16 65 0 20-95-35-145zm641 288c-86 20-151 28-200 29l-46 19c59 5 142-3 267-32l-21-16zm-370 88c30 12 65 22 110 25 51 4 116 1 201-14-99 87-199 177-283 299-25-95-24-201-28-310zm827 18c-25 0-49 17-30 52a45 43 0 0 1 30-11 45 43 0 0 1 29 11c19-35-5-52-29-52zm-55 47c-45 1-38 98 23 66a45 43 0 0 1-13-29 45 43 0 0 1 13-30c-9-5-17-7-23-7zm109 0c-6 0-14 2-23 7a45 43 0 0 1 14 30 45 43 0 0 1-14 29c61 32 68-65 23-66zm-25 68a45 43 0 0 1-29 11 45 43 0 0 1-30-11c-12 23-6 38 7 46-24 35-49 66-75 96-6-55-27-86-80-61 37 16 39 70 76 66l-18 20 15 2 22-25c5 39 35-8 67-6-16-41-32-10-66 5 24-29 48-59 71-92 26 6 61-11 40-51zm43 66c-33 39-64 78-125 110 17 30 27 60 30 90 47 18 83 52 115 90 2-37-4-71-30-100 23-5 40-20 50-45a73 73 0 0 0-60-35c45-32 30-71 20-110zM812 818a364 364 0 0 0 64 122H590l64-1 76-87h93l-11-34zm-434 25c4 0 9 2 14 9 6 7 11 19 11 33s-5 26-11 33c-5 7-10 10-14 10-5 0-10-3-15-10-6-7-10-19-10-33s4-26 10-33c5-7 10-9 15-9z',
                /* 2,1,0,1 Queen court_GOLD 1 Hearts */
                'M798 0l198 317c31-16 61-27 99-12-30-94-66-186 12-305zM495 59c-67 89-137 256-209 474l15-9-18 11c90 62 189 99 292 113 29 83 46 178 53 264l52 19c42 19 67 24 85 24 5-102 15-220 50-316h-2c63-13 126-34 188-64l-19-18a674 674 0 0 1-675-37l116-67c27-78 54-148 81-209-5-37-9-76-9-84zm770 456c-52 8-65 52-55 115 62-14 19-83 55-115zM245 569a207 207 0 0 0-54 95c-5-4-11-10-20-24-7 7-18 25-11 32-7-7-25 3-32 10 19 12 24 20 27 25l-24 5c-27 9-56 27-82 53-23 23-40 48-49 73v38l8-1c11 0 23 4 32 13 18 17 15 46-1 62a46 46 0 0 1-39 13v68a171 171 0 0 0 22-57c5 2 12 8 23 25 7-7 18-25 11-32 7 7 24-3 31-10a76 76 0 0 1-24-22l18-5c27-8 56-26 81-52 26-26 44-54 53-82l5-24c5 3 12 7 25 27 7-7 18-25 11-32 7 7 24-3 31-10-14-9-20-16-24-21l16-4c15-4 30-12 45-22-155 181-124 483-166 612 0 0 17 28 22 13 10-28 16-62 20-99 8-57 13-124 23-193 19-132 56-268 160-356l-4-29 11-9-31-13-20 23c-23 23-49 39-70 45l-10 2c10-9 13-21 60-59-6-7-26-12-40 2 14-14 8-34 1-41-39 49-51 51-60 62l3-12a184 184 0 0 1 47-72zm866 9c-10-1-20 2-31 7 46-4 40 81 115 60-8-30-43-67-84-67zm-79 25c-26 50-30 145-43 251h-2l-10-3c-70-11-139 48-154 133-14 80 25 154 89 172l-2 56 24-45c55-107 72-231 83-337 6-53 10-102 17-141 6-23 8-48 18-69zm-822 72c11 0 21 4 30 13 18 17 15 46-1 62a45 45 0 0 1-63 1 45 45 0 0 1 1-63 46 46 0 0 1 33-13zm-58 63c-8 9-17 22-56 54 7 6 27 12 41-2-14 14-8 34-2 41 32-39 46-48 54-55l-2 11c-7 21-23 47-46 70s-49 39-70 45l-10 2c8-8 14-21 58-57-6-7-26-12-40 2 14-14 8-34 1-41-37 46-49 50-58 59l3-11c7-21 22-47 45-70a184 184 0 0 1 82-48zm1148 51l-199 184-5 30 204-189zM165 930a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zM38 1047a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15z',
                /* 2,1,0,2 Queen court_GOLD 2 Diamons */
                'M217 0c22 34 49 66 53 106l-25 36-4-5c6-11 6-26-9-42-32-32-86 37-142-5 50 50-7 124 30 149 25 18 44 11 53-3l4 3-27 38c-26 4-50 6-70-7-15 26-45 29-70 40 61 0 120 4 154 42L412 0H217zm416 0l9 25c119 162 218 261 235 550l31 26C895 279 784 169 661 0h-28zm50 231l-4 51a529 529 0 0 1 66 184l34 28a568 568 0 0 0-96-263z M280 403l-11 28c91 32 179 53 272 57-22-10-43-21-61-18-24 4-49-10-69-29-43-10-87-23-131-38zm-11 28c-25 57-60 103-103 137 117 45 236 76 364 83h-3l102 211 96-8c-74 13-155 11-249-14l6 32c160 40 288 13 400-33l-11-28c-46 19-94 34-146 43l-97-202h-4c89-4 183-20 284-51L751 471l-30-24c-33 5-64 9-93 11-8 11-17 22-26 31a765 765 0 0 0-1 0c-7 7-15 11-21 11-12 0-25-5-39-11-93-5-181-26-272-58zm869 68c-22 1-48 40-8 51-55 15 15 85 30 30 15 55 85-15 30-30 55-15-15-85-30-30-4-15-13-21-22-21zm136 105c-23-1-39 16-54 36l15 10c24-11 46-23 50-45l-11-1zm-221 25c-17 0-35 7-53 26 40 5 55 44 138 21l2-1c-29-26-58-46-87-46zm-28 68L892 858c20 27 40 50 59 71a270 270 0 0 0 77 377l16 10 54-53-7-54-13 1c-62-4-108-59-108-120 0-29 10-58 29-80l11-10c42 57 75 128 88 262l171-171 15-14v-1l16-16-16 16c-7-37-18-72-39-101-18-24-42-42-75-53-6-5-16-9-30-11a40 40 0 0 1-39 39c11 64 54 39 44 5 14 4 27-1 32-9 22 9 39 24 51 41 15 20 24 44 31 70-17-23-42-2-34 24-19-5-35 5-35 18-19-7-37-16-51-29-25-23-41-58-41-114l1-6a40 40 0 0 1-39-40 40 40 0 0 1 40-40 40 40 0 0 1 40 39c64-11 39-54 5-44 9-32-28-56-42-5-7-31-16-61-33-87l230 189v-38l-275-227zm-4 53a154 154 0 0 1 53 80c-14 0-24 16-19 35-24-7-44 12-30 28-26-7-49-17-66-33-6-5-11-11-15-17l77-93zm213 10l-16 2c14 28 34 51 15 106l12 10c13-33 13-59 7-79-5-16-12-28-18-39zm-219 50a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm-78 56l9 9c25 22 57 35 92 43-34 16-12 45 17 37-6 23 10 41 25 32 5 44 21 76 46 98 27 25 64 37 104 45l36-36-141 141a516 516 0 0 0-79-235c-33-50-71-87-109-134zm-55 5a644 644 0 0 1-397 33v30c143 32 266 14 371-22l26-41zm293 134a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zm-30 130a15 15 0 1 0 0 30 15 15 0 0 0 0-30z',
                /* 2,1,0,3 Queen court_GOLD 3 Clubs */
                'M126 0c-20 116-15 243-96 330 34-8 67-12 100-10L334 0zm669 480H284c-33 51-73 93-125 120l698 1-62-121zm323 58c-17 0-34 21-29 63a43 43 0 0 1 29-11 43 43 0 0 1 28 11c5-42-12-63-28-63zm-261 63a220 220 0 0 0-33 237c-28 46-44 100-44 157a312 312 0 1 0 519 225h-1l2-3v-27L924 911l80-115 296 220v-31L996 759 891 909h-1l11-15a187 187 0 0 1-27-274zm214 2c-69 0-64 68 15 58a43 43 0 0 1-11-28 43 43 0 0 1 11-29l-15-1zm93 0l-15 1a43 43 0 0 1 11 29 43 43 0 0 1-11 28c79 10 84-58 15-58zm-754 27c6 162 152 196 164 310h21c-8-119-149-148-155-310zm130 0c4 162 105 182 110 310h25c-5-128-91-144-95-310zm120 0c3 129 57 162 60 310h20c-2-148-48-181-50-310zm575 10c-13 39-55 75-54 110l-13-56-22-2c7 20 12 42 17 64l22 9c64-19 58-71 50-125zm-89 24a43 43 0 0 1-28 11 43 43 0 0 1-29-11c-4 34 6 54 18 61h-1c-22 2-45 13-71 10 17 28 67 31 130 25-13-21-26-31-39-34h-1c14-5 25-26 21-62z M915 935l280 208c-30 20-65 32-105 32a180 180 0 0 1-175-239zm-260 30H518a331 331 0 0 1 1 70h136v-3c-6 2-16 0-16-6-7 7-22-8-15-15-10 0-10-22 0-22-7-7 8-22 15-15 0-6 10-9 16-6zm326 19l-1 11c0 59 45 105 110 105 14 0 27-2 38-6z'
            ] // <<< end Queen court RED
            ,
            [ /* 2,1,0 = Queen court_RED */
                /* paths:2,1,0,0 Queen court_red 0 Spades */
                'M558 0l248 330 45-18L635 0zm78 0l63 91c11-26 26-26 26-26-8-38 3-48 8-65zm184 265l32 47c26-8 51-14 76-19-20-2-42-8-63-23-10 5-30 10-45-5zm99 216a4502 4502 0 0 0-449 459h55l160-185h120c7-103 98-171 161-213zm-727 16l-60 46-1 1c2 12 4 21 3 27 0 24-6 47-30 56 18 5 31 18 31 33-6 17-17 27-31 32 24 7 31 29 31 48 0 17-3 39-6 60a501 501 0 0 1 41-50c30 61 60 105 97 146-45-113-73-248-75-399zM45 610L0 645v258a605 605 0 0 0 56-37c-8-30-21-90-21-126 0-19 7-40 30-48-18-5-30-18-30-32 0-15 13-28 32-33-10-3-18-9-22-17zm1190 69l-1 1c-21 23-42 46-72 66 27 39 36 80 28 123 25 15 47 34 67 56-10-29-27-68-64-89 37-6 52-16 67-36-29-21-50-16-77-16 39-22 50-64 52-105zM111 819zm-5 5l-3 3 3-3zm-6 5zm-6 6zm284 28a11 23 0 0 0-11 22 11 23 0 0 0 11 23 11 23 0 0 0 11-23 11 23 0 0 0-11-22zm225 127a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-183 0a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm91 0a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z',
                /* 2,1,1,1 Queen court_red 1 Hearts */
                'M746 0l206 341 44-24L798 0zm129 35c-31 8-42 4-54 2l58 92c7-20 14-39 26-59-2-16 2-22 5-30-17 2-27-1-35-5zm165 245c-15 4-45 5-66 0l23 36c26-13 52-23 83-16-15-6-31-11-40-20zm130 20c0 14-11 28-20 38-28-21-68 21-47 48-10 8-24 19-38 19 14 0 28 11 38 19-23 26 19 70 47 47 8 10 20 24 20 39 0-16 14-31 21-42 29 30 77-20 49-46 10-8 22-17 35-17-13 0-25-9-35-17 28-26-20-76-49-47-7-10-21-25-21-41zm0 37a3 3 0 0 1 3 3v23c21 1 38 18 39 39h28a3 3 0 1 1 0 6h-28c-1 21-18 38-39 39v28a3 3 0 1 1-6 0v-28c-21-1-38-18-39-39h-28a3 3 0 1 1 0-6h28c1-21 18-38 39-39v-23a3 3 0 0 1 3-3zm-692 85l-57 32c169 94 327 63 482 16-11-15-22-30-32-47h-1c-135 40-258 61-392-1zm-87 228l-13 8c10 58 15 127 10 186 32 9 57 31 74 61a295 295 0 0 1 68-10c23 0 48 3 74 10-7-67-20-144-39-208-60-8-118-24-174-47zm504 20l-70 17c-24 85-31 173-35 264 14-3 29-9 51-20v-1c14-27 35-49 58-63zm-686 35a14 15 45 0 0-11 5 14 15 45 0 0-1 20 14 15 45 0 0 21-1 14 15 45 0 0 0-20 14 15 45 0 0-9-4zm1047 37l44 23zM9 905a14 15 45 0 0-9 3v24a14 15 45 0 0 18-3 14 15 45 0 0 0-20 14 15 45 0 0-9-4zm531 50a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm110 35a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z',
                /* 2,1,1,2 Queen court_red 2 Diamons */
                'M412 0L0 586v130L503 0zm230 26c18 51 48 140 48 154 0 13-4 35-7 51 47 71 80 144 96 263l98 81C860 286 761 187 642 26zm518 419c-23 0-46 18-28 55 11-3 23 1 28 20 5-19 17-23 28-20 18-37-5-55-28-55zm-74 71c-48 0-40 93 24 62-3-11 1-23 20-28-19-5-23-17-20-28-9-4-17-6-24-6zm148 0c-7 0-15 2-24 6 3 11-1 23-20 28 19 5 23 17 20 28 64 31 72-62 24-62zm-74 18a16 16 0 0 0-16 16 16 16 0 0 0 16 16 16 16 0 0 0 16-16 16 16 0 0 0-16-16zm0 46c-5 19-17 23-28 20-36 73 92 73 56 0-11 3-23-1-28-20zm-278 61c-72 19-141 32-208 38l81 169c40-9 79-22 116-37a230 230 0 0 1 11-170zm-507 20c49 48 85 110 101 179 41 11 81 17 118 20l-86-180c-45-4-90-10-133-19zm725 224a25 25 0 0 0-25 25 25 25 0 0 0 25 25 25 25 0 0 0 25-25 25 25 0 0 0-25-25zm-62 158a71 71 0 0 0-18 47c0 37 27 68 61 70-11-48-26-86-43-117z',
                /* 2,1,1,3 court_red 3 Clubs */
                'M334 0L133 317l15-25c-21 2-41 7-63-2-12 15-27 26-42 37 29-6 58-9 87-6v-1c18 2 35 6 52 13L394 0zm308 0c35 141 47 258 153 480l62 121 17 19C989 462 745 342 643 0z M260 55a45 45 0 0 1-35 10c5 9 7 21 5 35 10 8 16 19 21 30l42-66c-12 0-24-2-33-9zm858 565a13 13 0 0 0-13 13 13 13 0 0 0 13 12 13 13 0 0 0 12-12 13 13 0 0 0-12-13zm-708 10H179l40 70c144 4 264 105 294 240h61c-12-114-158-148-164-310zm426 0H690c2 129 48 162 50 310h45c7-37 20-71 39-102a215 215 0 0 1 12-208zm38 35l-12 25h74l-22-25zm-19 55l-3 25h132l-22-25zm0 55l7 25h104l18-25zm21 55l19 25h34l18-25zm-31 123a13 13 0 0 0-13 11 13 13 0 0 0 12 14 13 13 0 0 0 13-12 13 13 0 0 0-11-13 13 13 0 0 0-1 0zm-195 35a13 13 0 0 0-12 12 13 13 0 0 0 12 13 13 13 0 0 0 13-13 13 13 0 0 0-13-12zm355 14c4 42 36 73 85 73l12-1zm-156 37a13 13 0 0 0-2 0 13 13 0 0 0-10 15 13 13 0 0 0 14 10 13 13 0 0 0 10-15 13 13 0 0 0-12-10zm35 78a13 13 0 0 0-5 1 13 13 0 0 0-7 16 13 13 0 0 0 17 7 13 13 0 0 0 6-16 13 13 0 0 0-11-8zm58 60a13 13 0 0 0-9 4 13 13 0 0 0 0 18 13 13 0 0 0 18-1 13 13 0 0 0-1-18 13 13 0 0 0-8-3zm252 26a13 13 0 0 0-5 1 13 13 0 0 0-7 16 13 13 0 0 0 17 7 13 13 0 0 0 6-16 13 13 0 0 0-11-8zm-177 11a13 13 0 0 0-13 9 13 13 0 0 0 9 16 13 13 0 0 0 15-9 13 13 0 0 0-8-15 13 13 0 0 0-3-1zm91 11a13 13 0 0 0-12 13 13 13 0 0 0 12 12 13 13 0 0 0 12-13 13 13 0 0 0-12-12z'
            ] // <<< end Queen court RED
            ,
            [ /* 2,1,2 = Queen court_BLUE */
                /* paths:2,1,0,0 Queen court_BLUE 0 Spades */
                'M473 150a13 20 0 0 0-13 20 13 20 0 0 0 13 20 13 20 0 0 0 12-20 13 20 0 0 0-12-20zm-140 5a13 20 0 0 0-13 20 13 20 0 0 0 13 20 13 20 0 0 0 12-20 13 20 0 0 0-12-20zm23 301c4 109 3 215 28 310 84-122 184-212 283-299-85 15-150 18-201 14-45-3-80-13-110-25zm43 23c22 0 52 2 83 6 66 9 119 22 117 30-1 8-56 5-122-3-65-8-117-19-116-27 1-4 14-6 38-6zm719 14l5 28v1c7-2 16 0 27 5l-21-21a2 2 0 0 1 1-3 2 2 0 0 1 1 1l21 21c-5-11-7-20-5-27-11-1-21-3-29-6zm130 0l-29 5h-1c2 7 0 16-5 27l21-21a2 2 0 0 1 1-1 2 2 0 0 1 1 3l-21 21c11-5 20-7 27-5l5-29zm-854 15c20 0 47 2 75 6 60 8 107 22 106 30s-50 8-109 0c-60-9-107-22-106-30 1-4 13-6 34-6zm8 34l50 3c52 5 94 15 94 23-1 8-43 11-94 6-52-5-93-16-93-24 0-5 16-7 43-8zm590 22c-26 17-58 39-85 65l156 127 18-20c-37 4-39-50-76-66 53-25 74 6 80 61 18-21 36-43 53-66-50-32-99-65-146-101zm93 167l-4 5 4-1v-4zm-22 25l2 1c28 1 65 8 65 8 33-17 58-37 78-57l-59-36-48 60c34-15 50-46 66-5-32-2-62 45-67 6l-22 25zM400 575l40 3c42 5 75 15 75 24 0 8-34 10-75 5-42-5-75-15-75-24 0-5 13-8 35-8zm815 13l21 21a2 2 0 1 1-2 2l-21-21c5 11 7 20 5 27h1l29 5c-3-8-5-18-6-29-7 2-16 0-27-5zm-65 0c-11 5-20 7-27 5l-5 30c8-3 18-5 29-6-2-7 0-16 5-27l-21 21a2 2 0 1 1-2-2zm-750 20l25 2c31 4 55 17 55 25s-24 12-55 7c-30-4-55-14-55-22 0-6 11-12 30-12zm3 37h12c25 2 45 7 45 15 1 8-19 13-44 11-25-3-46-11-46-19-1-6 13-7 33-7zm-6 30h4c15 2 28 8 29 14 1 7-11 11-26 10-16-1-29-7-29-14-1-5 8-10 22-10zm-3 31h3c9 1 18 6 18 11s-7 9-17 8c-9-1-18-6-18-11s5-8 14-8zm906 0l-34 3c0 20-7 39-31 56 24 2 45 11 60 35a68 68 0 0 1-50 45c20 22 28 47 30 74l25 12zm-167 64zm3 6zm2 5l1 2-1-2zm3 6zm3 6zm2 5zm2 6zm2 5zm2 6zm1 5zm-775 23c-5 0-10 2-15 9-6 7-10 19-10 33s4 26 10 33c5 7 10 10 15 10 4 0 9-3 14-10 6-7 11-19 11-33s-5-26-11-33c-5-7-10-9-14-9zm-1 4c3 0 6 5 6 11 11 0 15 3 6 13 14 4 10 9 3 14 7 5 11 10-3 14 9 10 5 13-6 13 0 10-9 18-11 0-11 0-15-3-6-13-14-4-10-9-3-14-7-5-11-10 3-14-9-10-5-13 6-13 1-8 3-11 5-11zm353 6l-76 86h43l47-54h96l-15-32zm29 65l-19 22h136l-16-22zm-104 52H339l8 7 42 43c1-5 6-12 16-20-30-25-15-35 15-15 30-20 45-10 15 15 30 25 15 35-15 15-11 7-20 11-26 11l4 4h257zm-170 4c6 0 15 4 26 11 30-20 45-10 15 15 30 25 15 35-15 15-30 20-45 10-15-15-19-16-20-25-11-26zm91 0c6 0 15 4 26 11 30-20 45-10 15 15 30 25 15 35-15 15-30 20-45 10-15-15-19-16-20-25-11-26z',
                /* 2,1,2,1 Queen court_BLUE 1 Hearts */
                'M526 167a13 20 0 0 0-12 20 13 20 0 0 0 12 20 13 20 0 0 0 13-20 13 20 0 0 0-13-20zm153 2a13 20 0 0 0-13 20 13 20 0 0 0 13 20 13 20 0 0 0 12-20 13 20 0 0 0-12-20zM479 424l-10 2 1 5 12 46 36-19 15 34 35-20 23 34 33-27 26 31 30-30 31 27 24-31 29 27 25-39 38 23 20-35 38 19 7-16-7-10-5 12-37-19-20 35-37-23-24 37-29-25-24 31-29-27-29 29-26-30-32 26-21-33-35 20-14-34-35 19-8-34zm-58 30l-114 67a672 672 0 0 0 674 36c-28-26-53-55-78-87l-16 5 57 44 7 20c13 38-29 41-38 13l-26-77-4 1 26 82c12 38-30 40-39 12l-25-82 31-10-35 10 18 86c9 39-32 37-39 8l-18-83 34-10-35 9 13 86c6 39-35 36-39 6l-14-84 22-5-23 5 7 85c3 40-38 33-40 3l-6-83-5 1 7 83c3 40-38 33-40 3l-7-83h-2v84c0 40-40 30-40 0v-84l-5-1-8 83c-3 40-42 26-39-4l7-82-5-1-8 80c-4 39-42 26-40-4l9-83-3-1-21 79c-10 39-46 19-39-10l16-60-23 56c-15 37-48 13-37-15l28-67-38 70c-18 35-49 7-35-19l38-71-54 64c-26 30-50-3-31-26l9-10 78-31v-1h1l-13-7zm573 179c-33 15-66 27-99 37l5 197c20-12 42-18 65-17l1-10c9-80 12-152 28-207zm-207 11l-72 9c47 3 63 22 7 27 39 5 44 20-7 25 40 4 54 23-2 33 35 4 44 22 0 27v7c32 7 40 20-1 23v8c31 5 38 16 0 21v5c25 5 30 15-1 20v5c26 5 32 15 0 20v5c26 5 32 15 0 20v1c21 5 24 13-1 18v1c22 6 26 14 0 19v5l31 9c4-97 13-213 46-308zm-185 7c30 87 46 181 52 270l26 10 14 7v-17c-41-3-48-17-1-23l-1-3c-42-3-49-17-1-23v-1c-44-2-52-17-1-23v-3c-45-2-53-18-1-24v-1c-48-2-56-20-2-26v-2c-51-1-61-20-1-26v-3c-50-1-60-20-1-26v-2c-57 0-68-23-2-29v-1c-64 2-78-24-1-29v-1c-57 2-78-13-40-21-13 0-27-1-40-3zm654 91a4683 4683 0 0 0 44 23zm18 9l-2-1-3 3c14 7 2 26-28 29h-1c-3 19-21 43-35 48-19 7-62 14-87-7l-17 150 199-185v-23l-26-14z',
                /* 2,1,2,2 Queen court_BLUE 2 Diamons */
                'M665 218l-18 3c-2 4-3 9-3 15 0 13 6 23 13 23s12-10 12-23c0-7-2-14-4-18zm-152 0a13 24 0 0 0-13 24 13 24 0 0 0 13 23 13 24 0 0 0 12-23 13 24 0 0 0-12-24z M284 393l-4 10c44 15 88 28 131 38l-13-13c-38-9-76-21-114-35zm426 45c-26 5-51 8-76 10l-7 10c30-2 61-6 94-11z M137 589c-23 15-48 27-73 36L0 716v182l264-265c-43-12-85-27-127-44zm771 12a229 229 0 0 0-16 257l133-161zm-346 52l100 208 33-2-100-206h-33zm-187 8c43 9 88 15 133 19zm220 16a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10zm22 47a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10zm23 47a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10zm22 46a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10zm256 74a8 7 0 0 0-7 8 8 7 0 0 0 7 7 8 7 0 0 0 8-7 8 7 0 0 0-8-8zm17 20l-37 9-5 11 12 30-34 18-3 10 18 32-29 24-1 11 25 29-24 34 1 10 32 25-15 37 4 10 36 16-6 41 6 9 39 7 3 40 7 7 47 4-3 26 17-16 2-16-7-8-49-4-3-40-6-7-37-7 5-40-4-7-35-16 15-36-2-8-31-24 23-33v-10l-24-27 29-23 1-10-17-31 33-17 4-9-12-29 33-9 3-1zm-50 37a8 7 0 0 0-7 7 8 7 0 0 0 7 8 8 7 0 0 0 8-8 8 7 0 0 0-8-7zm-19 62a8 7 0 0 0-8 8 8 7 0 0 0 8 7 8 7 0 0 0 7-7 8 7 0 0 0-7-8zm-6 67a8 7 0 0 0-7 8 8 7 0 0 0 7 7 8 7 0 0 0 8-7 8 7 0 0 0-8-8zm10 74a8 7 0 0 0-7 8 8 7 0 0 0 7 7 8 7 0 0 0 8-7 8 7 0 0 0-8-8zm27 70a8 7 0 0 0-7 8 8 7 0 0 0 7 7 8 7 0 0 0 8-7 8 7 0 0 0-8-8zm42 59a8 7 0 0 0-8 8 8 7 0 0 0 8 7 8 7 0 0 0 7-7 8 7 0 0 0-7-8zm58 52a8 7 0 0 0-7 8 8 7 0 0 0 7 7 8 7 0 0 0 8-7 8 7 0 0 0-8-8z',
                /* 2,1,2,3 Queen court_BLUE 3 Clubs */
                'M637 189a13 21 0 0 0-14 21 13 21 0 0 0 14 21 13 21 0 0 0 13-21 13 21 0 0 0-13-21zm-140 1a13 21 0 0 0-14 21 13 21 0 0 0 14 21 13 21 0 0 0 13-21 13 21 0 0 0-13-21z M263 510l-10 13 4-5a160 160 0 0 1 12 0h2l3 1h12a1129 1129 0 0 0 6 1h9a192 192 0 0 0 5 1l-1 1-1 1-1 1v1l-1 1a24 24 0 0 1-5 3l-3 2a69 69 0 0 1-6 3 256 256 0 0 1-38 13c7 4 10 7 12 11l-11 1-32 1 11-13-25 23h636l-5-9h-10c-14-1-28-5-41-14h1-1l-7 1c7 4 10 7 12 11-32 0-64 9-95-12l-7 2c7 4 10 7 12 11-32 0-64 9-95-12l-5 2c6 4 9 7 11 11-28 0-58 7-86-7l4 5c-32 0-64 9-95-12l-6 2c7 3 10 7 12 11-32 0-64 9-95-12l20-8-27 9c7 3 10 7 12 11-32 0-64 9-95-12l39-15 8 2-3-1c30-21 63-12 95-12-3 5-8 10-22 15l12-4 8 2-3-1c30-21 63-12 95-12-2 4-5 7-11 10l8 2-4-1c17-11 34-14 51-14l45 2c-3 5-7 9-17 13l7 2-3-1c31-21 63-12 95-12-2 4-5 7-10 10l7 2-3-1c31-21 63-12 95-12-2 4-5 7-10 10l8 2-3-1a79 79 0 0 1 6-4l3-1 1-1a75 75 0 0 1 5-2h1l3-1 1-1h2l1-1h3l2-1h4v-1h4a107 107 0 0 1 5-1h2a136 136 0 0 1 15 0h1a342 342 0 0 1 6 1h11l-5-10zm262 36l-8 2h1zm530 24c0 11 3 25 6 34h24l-22-22a3 3 0 1 1 4-4l22 22v-24c-9-3-23-6-34-6zm125 0c-11 0-25 3-34 6v24l22-22a3 3 0 1 1 4 4l-22 22h24c3-9 6-23 6-34z M121 619c-38 33-78 50-121 45v109l1 7c46-41 104-69 169-77zm964 42h-24c-3 9-6 23-6 34 11 0 25-3 34-6v-24l-22 22c-3 3-7-1-4-4zm65 0l22 22c3 3-1 7-4 4l-22-22v24c9 3 23 6 34 6 0-11-3-25-6-34h-24zm-146 135l-80 115 376 279v-174z'
            ] // <<< end Queen court BLUE
            ,
            [ /* 2,1,3 = Queen court_BLACK*/
                /* paths:2,1,0,0 Queen court_BLACK 0 Spades */
                'M500 0c99 212 199 424 391 444L558 0zM300 60c-34 123-113 238-60 398l110-85c-28-39-50-91-50-118l5-155-5-40zm600 395a5236 5236 0 0 0-470 484l40 1c126-153 294-319 449-459zm66 87c-29 19-64 44-94 76l25 20c31-30 66-55 96-74-9-7-19-14-27-22zM685 755L525 940h45l130-152h107l-2-33z',
                /* 2,1,3,1 Queen court_BLACK 1 Hearts */
                'M676 0l364 600 50-30L746 0zM504 244c-27 61-54 131-81 209l122-71c-17-29-28-58-30-67l-11-71zM259 548l-24 14a722 722 0 0 0 330 135c19 64 32 141 38 208l25 7c-6-77-20-162-44-238a690 690 0 0 1-325-126zm763 45c-71 35-143 59-216 72-28 91-37 197-41 290h10l16-4c3-91 10-179 34-264 57-11 113-29 169-54-16 55-19 127-28 207l-2 10 13 1 11 2c14-106 18-200 44-250z',
                /* 2,1,3,2 Queen court_BLACK 2 Diamons */
                'M1026 698l-26-21a102 102 0 0 0-19 74zm-92 110a169 169 0 0 1 20-169l-23-19c-25 29-41 72-41 120 0 35 9 67 23 93m-30-193c-73 20-142 33-209 39l82 169-31 6-97-202c88-4 181-20 280-51 M595 860l-87-180c-45-4-90-10-133-19-17-15-35-30-54-42 67 17 135 28 206 32l102 211-34-2zm287 11a644 644 0 0 1-397 33l-3-32c160 40 288 13 400-33l10 19z M-1 941l322-323c-52-13-104-30-155-50l-28 21c41 17 83 32 126 44L0 898m319-765l-9-48 45-5-5-50 44-5 M274 196l-9-46 48-9m-79 112l-9-43 46-9m-72 101l-9-37 42-9m-68 97l-14-43 47-5m464 92l9-27c6-24 8-59 9-86 4 4 7 11 11 17 24 45 43 96 53 164z',
                /* 2,1,3,3 Queen court_BLACK 3 Clubs */
                'M394 0L0 619v45C197 688 347 226 407 0zm252 316c-6 31-14 59-21 64-18 13-61 85-70 90-5 3-12 4-18 4l1 6h174c-28-61-49-115-66-164z M159 600l-33 15-4 4 47 84a259 259 0 0 1 50-3l-40-70h657c6-11 14-20 21-30zm715 20a187 187 0 0 0 27 274l15-20a162 162 0 0 1-25-235z M513 940a305 305 0 0 1 6 95h66v-70h196l4-25z'
            ] // <<< end Queen court BLACK
            ,
            [ /* 2,1,4 = Queen court_BLUE_DETAIL */
                /* paths:2,1,0,0 Queen court_BLUE_DETAIL 0 Spades */
                'M435 885a58 75 0 0 1-57 75 58 75 0 0 1-58-75 58 75 0 0 1 58-75 58 75 0 0 1 57 75v0m-18 55h459m-568 0h29m2 30h562M132 543l219-168M0 645l45-35m1093 55c-60-38-118-78-173-123m244 166l-60-36M558 0l407 543m335 517c-69 39-117 76-165 132-45-78-93-131-160-193a443 443 0 0 1-129-181c-15-48-9-86 8-121 28-57 91-102 139-133M500 0c99 212 199 424 390 444M364 812c-44-127-35-269-43-408 77 40 164 78 458 6-134 123-277 232-387 402m-36-356c30 12 65 22 110 25 51 4 116 1 201-14-99 87-199 177-283 299-25-95-24-201-28-310v0m511-16a4626 4626 0 0 0-431 439M224 473c-1 183 38 343 98 466M191 497c3 151 31 286 76 398m163 44c149-176 317-345 470-484M470 940c126-153 294-319 449-459M525 940l160-185h120M568 940l132-152h107M611 939l104-119h97M654 939l76-86h93m-126 86l47-54h95m-99 55l19-22h101m46-289l158 128M872 618l171 139M460 481c-45 93-54 189-75 284M304 0c-45 163-165 327-95 483m31-25c-53-160 26-275 60-399m506 271l46-17M0 903c72-43 117-82 170-153a727 727 0 0 0 177 227c282 264 94 410-13 481m44-615c4 0 9 2 14 9 6 7 11 19 11 33s-5 26-11 33c-5 7-10 10-14 10-5 0-10-3-15-10-6-7-10-19-10-33s4-26 10-33c5-7 10-9 15-9v0m752-78c17 30 27 60 30 90 47 18 83 52 115 90 2-37-4-71-30-100 23-5 40-20 50-45a73 73 0 0 0-60-35c45-32 30-71 20-110-33 39-64 78-125 110v0m170-59l-34 3m34 222l-26-12m-81-83c37 21 54 60 65 89m-75-140c27-1 48-6 77 15-15 20-30 30-67 35m42-156c-2 41-13 83-53 105m-20-39c27 40 36 81 27 124m-59-104s-82-15-95-5-33 31-40 40c-32 40 4 50 20 30m35-30c-59 25-64 121 20 25m-29 29c-15 32 1 60 59-6m-38 35c-21 38 42 35 98-28m-97-99c34-38 67-77 97-121m-82 123c33-37 65-75 94-118m-87 95c-5-58-25-90-80-65 39 17 39 74 80 65v0m-80-65c38-6 56 41 80 65m15-3c35-15 51-47 67-5-32-2-62 45-67 5v0m0 1c26 8 53-24 67-6m-12-142c-75 45-75-100 0-55-45-75 100-75 55 0 75-45 75 100 0 55 45 75-100 75-55 0v0m88-27c-60 0-60 0-60-60 0 60 0 60-60 60 60 0 60 0 60 60 0-60 0-60 60-60v0m-120-37l-5-28 29 5m0 119c-11 1-21 3-29 6l5-30m119 0c1 11 3 21 6 29l-29-5m0-119c10-1 20-3 28-6l-5 30M358 386l-14-7m404 5a973 973 0 0 1-268 33m-124 39c30 12 65 22 110 25 51 4 116 1 201-14-99 87-199 177-283 299-25-95-24-201-28-310v0M85 135c11 31 5 90 35 90 65 0 20-95-35-145-55 50-100 145-35 145 30 0 24-59 35-90v0M40 285s0-10 10-10c13 0 15 45-10 45-35 0-30-70 5-70 30 0 40 50 40 50s10-50 40-50c35 0 40 70 5 70-25 0-23-45-10-45 10 0 10 10 10 10m-10-10c-55 3 15 250 14 296 0 30-9 59-49 59s-49-29-49-59c-1-46 69-293 14-296m20-10v-57m30 57v-56m3 418c19 5 32 18 32 33 0 19-22 35-50 35s-50-16-50-35c0-15 13-28 32-33m-1 65c-24 8-31 29-31 48 0 36 13 96 20 126m73-65c4-22 7-44 7-61 0-19-7-41-31-48m153 193h6M0 885h29m217-15h11M0 870h51m183-15h18M0 855h53m170-15h24M0 840h49m164-15h30M0 825h46m157-15h35M0 810h44m150-15h39m-104 0h6M0 795h41m145-15h43m-97 0h14M0 780h38m140-15h47m-91 0h24m-148 0h26m99-15h86m-211 0h25m100-15h83m-203 0h20m98-15h72m-190 0h23m117-15h45m125-195c-12-18-24-32-45-47-22-16-32 9-24 23m69 54c-14-16-41-39-62-52-21-12-27 15-10 28m74 57c-14-16-41-40-63-52-33-18-43 14-2 32m68 79c-14-16-41-40-63-52-30-17-37 17-5 36m66-18c-14-14-33-28-51-40-22-15-34 5-23 17m78 84c-14-13-32-26-49-38-24-16-37 12-20 25m72 41c-16-13-39-27-58-37-31-16-36 21-3 37m65 23c-45-39-98-25-54 5m61 29c-50-42-141-42-52 5m65 48c-63-40-142-29-44 11m41 8c-43-18-93 0-44 13m24 5c-37-12-56 9-12 20m0-387c-8-7-16-15-26-22-18-13-27 0-25 12m49-29l-4-3c-19-14-29 4-24 17m58 327c-42-32-88-23-58 3m103 33c97 1 65 26 21 26m-8-45c32-12 61-9 75-2 17 9 14 24-26 30m-28-56c58-11 103 14 55 26m-34-54c67-18 125 10 49 33m-32-55c69-24 136 4 67 28m-39-60c51-8 89 9 56 28m-39-47c77-20 158 17 49 27m-12-66c57-5 100 18 40 35m-22-52c75-20 152 15 51 34m-23-61c55-7 102 12 64 29m-40-51c71-16 140 15 53 34m-13-70c57-5 99 18 36 35m-13-56c74-17 145 16 44 36m-5-70c58-6 102 17 42 35m-17-58c68-12 128 17 44 36M646 274c-6 11-10 23-36 21-14 81-74 98-130 120 0 0-19 16-29 16-15 0-26-6-31-6s-10 5-25 5-30-25-40-50c-30-40-55-96-55-125l5-155-10-72m328 212c-6 11-14 25-8 25 3 0 7-10 10-20m279 250l51 54m-65-41l49 52m-64-39l48 52m-61-38l46 49m-61-36l46 49m-60-36l35 38m-49-24l24 25m-39-13l18 19m-32-5l9 10M483 925h55m-42-15h55m-43-15h56m-43-15h56m-43-15h56m-37-20h32m205-25v33m-25-33v33m-25-33v33m-37-20l23 23m-42-2l23 23m-41-1l23 23m-41-1l23 23m-42-2l21 21m141-629c16-7 32-12 48-17m-63-4c16-6 32-12 49-16m-64-4l50-17m-64-1c16-7 33-13 50-18m-58-5l36-12m-48-9l25-9m-40-11l16-5m172-89c-51 20-103-24-139 0-46 31-6 91 28 71 32-18 1-60-14-50-9 6-15 18-10 25 6 8 10 10 20 5m116-48c-39 38-22 104-58 126-49 28-85-34-53-56 30-21 55 25 39 34-9 6-23 6-27-2-5-9-4-13 5-20m-42 1l90-60m-10 40c-10-10-45-11-55 5 22-11 35-25 25-45m-20 110c25 30 50 20 75 10 24 33 65 39 105 45M725 130c-10-20 15-45 30-55-6-23 3-49 12-75m-67 90c10-25 25-25 25-25-8-38 3-48 8-65M428 0c17 52 55 78 111 84M447 0c16 39 45 62 86 71M461 0c14 27 36 46 65 56M477 0c10 16 24 29 41 38M371 0c-15 40-30 80-66 100M356 0c-13 32-27 62-53 80m37-80c-10 23-22 45-40 60m25-60c-8 15-17 28-29 39m9 81c41-25 62-14 80 0 20 55-15 110-14 152 0 15 11 13 19 13 5 0 15 10 15 10M305 125c30-21 55-18 80-5m45 125c20 0 20 30 5 30-40 5-40-10-5 0m-65 40v10l5-5-5-5v0m90 5l5-5v10l-5-5v0m-85 0s5 5 10 5 5-4 12-4c8-1 8 4 13 4s15-10 20-10 15 5 20 5h10m-65 20c3 28 46 9 45 5-5 5-45 32-45-5v0m40-205c52-37 86-16 120 5-35-26-85-45-120-5v0m110 25c-15 0-36-25-56-24-30 3-39 39-54 44 18-21 34-28 48-28 29 0 37 33 72 23m-120 5c15-10 33 10 45 10 29 0 44-15 55-15m-150 0c-20 0-31-19-47-20-12-1-29 12-29 17 0 7 11 21 23 24 16 3 36-21 53-21v0m-75-10c23-43 65-9 65-5m450 105c15 15 35 10 45 5 21 15 43 21 63 23m-76 19c43-13 87-22 123-27-50-97-75-191-101-285m-22 312c43-13 87-22 123-27-50-97-75-191-101-285m-23 312L635 0m293 293c-20-2-42-8-63-23-10 5-30 10-45-5',
                /* 2,1,4,1 Queen court_BLUE_DETAIL 1 Hearts */
                'M546 382L0 698m210 269L0 1161m912-5c99-195 71-456 120-553M388 844c64 18 103 92 89 172-15 85-84 144-154 133l-10-3m597 66l24-45c55-107 72-231 83-337 6-53 10-102 17-141 6-23 8-48 18-69m67 45c-9 28-15 62-19 99-8 57-13 124-23 193-19 132-56 268-160 356M378 658c10 58 15 127 10 186m-230 478c46-143 4-495 221-664l11-9m866 93l44 23M751 123a798 798 0 0 0 391 555M283 535a701 701 0 0 0 718 40m-742-27c99 71 210 113 325 126m222-8c73-14 145-38 216-73m-40-36a674 674 0 0 1-675-37m794 453l199-184M895 670l4 197m-74-180c57-11 113-29 168-53m-758-72a717 717 0 0 0 330 135m429-65c-16 56-19 128-28 208l-1 10M715 653l-5 291m-29-290l14 284m120-299c-35 96-45 214-50 316M575 648c29 83 46 178 53 264m163 38c3-90 10-178 35-263m-40-43c-32 95-41 211-46 308m-86-31c-6-89-22-183-52-270m-37 47c19 63 32 140 39 207M676 0l364 600 50-30L746 0m206 341c49-25 87-58 143-36-30-94-66-186 12-305M997 317L798 0m191 304l-44 25m34-41l-43 26m33-41l-43 25m34-40l-44 25m34-40l-30 17m21-32l-23 13m122-96c-45 15-84-37-115-15-35 25 6 70 25 60 20-10 15-40-5-40s-10 15-10 15m105-20c-35 32-9 91-44 107-39 19-57-39-40-51 19-12 43 7 33 24-10 18-18 1-18 1m-44-19c27-9 52-25 78-37m-50 25c23-18 26-20 30-35m-30 35c18-4 40-3 50 5m-42 64c27 10 57 6 82-9 10 20 32 34 50 50m-121-25c21 5 51 4 66 0 9 9 25 14 40 20M821 37c12 2 23 6 54-2 8 4 18 7 35 5-3 8-7 14-5 30-12 20-19 39-26 59m19 30c4-23 2-48 32-69 2-29 7-59 14-90M421 454c169 94 327 63 482 16m-33-47c-135 40-258 61-392-2m664 257l18-18c5-5 28 2 39-13 17-23 35-6 18 13-14 15-37 27-37 27 11 35 6 67-10 98m60-140c40-50 60-14 25 20-40 38-64 28-25-20v0m6 35c52-37 61 4 18 26-49 25-69 10-18-26v0m0 35c54-29 58 12 14 29-49 18-67 0-14-29v0m-1 38c55-13 49 25 6 29-48 3-59-17-6-29v0m5 29c-3 19-21 43-35 48-19 7-62 14-87-7M587 978l21 6m-128-5l15-5m346-43c-31 15-49 22-66 24-18 1-44-2-95-24a370 370 0 0 0-169-35c-18 2-34 5-49 10m35 53l-18 4m136 8l-33-10m65 22l-7-3m106 34c-21-3-46-10-77-22m151 13a162 162 0 0 1-47 10m-249-75a190 190 0 0 0-47 8m173 20c-36-15-67-24-95-27m185 57c-16-3-35-8-58-17m140 8c-15 5-28 9-43 11m-259-74a203 203 0 0 0-47 8m353 37c-18 8-33 12-48 14-25 2-57-3-110-26-41-18-76-28-108-32m362 206l-4-1c-48-14-83-74-71-143 13-74 72-122 126-113l8 2 5 1m-31 161c-19 0-35-18-35-40s16-40 35-40c7 0 13 2 18 6m-10 49l-8 2c-8 0-15-8-15-17s7-17 15-17c5 0 10 3 13 8m-27-28l-21-48-33-5 3 40-35 15 15 40-23 30 33 20-10 40h40l5 35m5-215l20-35 35 20-13 61m13-61l10-10m-75 205l29-60m-59 20l46-32m-56-18l50-3m-30-52l36 26m-21-41l28 34m17-59l3 49m-73 21l41 10m-46 40l47-17m-22 57l33-39m-18 99l11-4m9-36l12-51M218 729a14 15 45 0 1-21 1 14 15 45 0 1 1-20 14 15 45 0 1 20-1 14 15 45 0 1 0 20v0m2 16c4 3 7 9 6 20m8-34c3 4 9 6 20 5m-73-29c-3-4-8-7-20-7m34-7c-4-3-6-9-5-21m10 68c-6 6-12 13-15 28m2-41c-5 6-13 12-27 15m68-30c6-7 14-12 28-15m-40 2c6-6 11-14 14-28m-17 82c1 28 7 7 32 46 7-7 18-25 11-32 7 7 24-3 31-10-38-25-18-32-46-32m-67-11c-28 0-7-7-46-32 7-7 25-17 32-10-7-7 4-25 11-32 24 39 31 18 32 46m4 61c-16 41-14 14-72 84-6-7-12-27 2-41-14 14-34 8-41 2 71-57 44-56 85-71m54-3c41-16 14-14 84-71-6-7-26-12-40 2 14-14 8-34 1-41-57 70-55 43-71 84M0 908a14 15 45 0 1 18 1 14 15 45 0 1 0 20 14 15 45 0 1-18 3m20 13c4 3 7 9 6 20m8-34c3 4 9 6 20 5m-54 4s0 0 0 0m28-28c6-7 14-12 28-15m-40 2c6-6 11-14 14-28m-17 82c1 28 7 7 32 46 7-7 18-25 11-32 7 7 24-3 31-10-38-25-18-32-46-32M0 871c2 2 2 6 3 15m4 61l-7 15m35-44c41-16 14-14 84-71-6-7-26-12-40 2 14-14 8-34 1-41-57 70-55 43-71 84m13-24l3-12c7-21 22-47 45-70a184 184 0 0 1 81-48m38 38l-2 11c-7 21-23 47-46 70a184 184 0 0 1-80 48m2 30l18-5c27-8 56-26 81-52 26-26 44-54 53-82l5-24m-65-65l-24 5c-27 9-56 27-82 53-23 23-40 48-49 73m263-102l16-4c15-4 30-12 45-22m-79-141a207 207 0 0 0-54 95m29 6l3-12a184 184 0 0 1 47-72m89 50l-20 23a184 184 0 0 1-80 48M0 1031a171 171 0 0 0 21-57m32 92l27 21m-78-60l29 23m8 27l28 22m-67-52l24 19m-24 3l55 42m-55-21l42 33m-42-11l29 22m-29-1l15 12m1-150l89 69m-95-52l83 64M74 932l95 73m-86-44l73 56m-90-48l78 60m-88-46l75 57m-84-43l71 55m-97-75l20 16m137-132l49 38m-91-70l18 14m-79-61l57 44M0 724l51 39m116 111l55 43M63 794l80 61M0 746l39 30m115 110l64 49m-106-82l18 14m-43-33l8 6m-43-33l18 14M0 767l28 22m113 108l72 56M98 865l18 13m-74-57l16 13M0 789l18 14m161 145l28 22m-80-62l31 24m-72-55l15 11m-67-52l12 10M0 810l9 7m156 142l29 22m-83-63l38 28m-75-57l11 8m-59-45l7 6m61 67l88 68M63 902l3 2m152-120l40 31M61 663l66 51m86 88l38 29m-67-51l4 3m-53-41l8 6m-98-75l64 49m97 96l39 30m-74-57l11 8m-64-48l14 10M29 682l63 49m106 102l40 32m-79-62l15 12m-72-55l17 13M13 691l64 49m112 108l44 34m-85-66l16 13m-40-31l6 5m-42-33l18 14M0 703l64 49m212 13l6 4M109 636l44 34m105 102l16 12M93 645l42 32m117 112l14 10M77 654l70 54m133-26l15 11m-66-51l12 9m-68-52l32 25m100 98l6 4m-42-32l9 7m-55-42l5 3m-71-54l41 32m89 90l14 10M141 617l51 40m75 79l24 18M125 626l36 28m126-32l50 39m-79-61l18 13m-56-42l14 10m72 77l19 14m-78-59l18 13m-60-46l18 15m70 74l17 14m-72-56l15 12m-64-50l25 20m56-22l79 61m-113-86l9 6m389-53v84c0 30 40 40 40 0v-84m-35 0c19 54 15 94 15 94m16-94c-16 36-16 94-16 94m22-94l7 83c2 30 43 37 40-3l-7-83m-35 2c24 53 23 92 23 92m8-94c-13 37-8 94-8 94m17-95l6 83c2 30 43 37 40-3l-7-86m-34 6c24 52 22 91 22 91m10-96c-15 37-10 96-10 96m13-96l14 84c4 30 45 33 39-6l-13-87m-35 8c29 52 30 92 30 92m3-99c-13 38-3 99-3 99m6-98l18 83c7 29 48 31 39-8l-19-86m-33 10c31 50 35 90 35 90m-3-100c-10 39 3 100 3 100m3-100l25 82c9 28 51 26 39-12l-26-82m-33 11c35 46 43 86 43 86m-12-96c-6 39 12 96 12 96m0-100c34 44 42 82 42 82m-48-80l26 77c9 28 51 25 38-13l-7-20m-23-26c4 32 14 62 14 62m-346-44l-7 82c-3 30 36 44 39 4l8-83m-34-2c14 55 5 93 5 93m26-91c-20 34-26 91-26 91m-55-102l-9 83c-2 30 36 43 40 4l8-80m-34-6c14 55 5 94 5 94m24-89c-18 35-24 89-24 89m-52-107l-21 80c-7 29 29 49 39 10l21-79m-33-9c5 56-10 93-10 93m39-85c-25 31-39 85-39 85m-30-109l-31 75c-11 28 22 52 37 15l31-75m-31-12c-3 56-22 89-22 89m49-79c-28 28-49 79-49 79m-20-108l-40 75c-14 26 17 54 35 19l41-77m-31-15c-9 58-32 91-32 91m62-77c-33 23-62 77-62 77m-51-61l-9 10c-19 23 5 56 31 26l57-68m-42 11c-18 34-37 52-37 52m78-63c-37 14-78 63-78 63m-69 8c72-217 142-384 209-473M323 511c59-175 116-315 171-407M385 476c38-111 76-207 113-284m-75 261c27-78 54-148 81-209M294 507l26 6m-20-21l40 10m-35-25l55 13m-50-28l70 16m-65-31l85 20m-80-35l100 23m-94-38l101 24m-96-38l102 23m-96-38l101 23m-83-36l89 20m-69-30l73 17m-43-27l49 11M495 0v160c0 15 15 135 20 155s55 140 110 140 105-55 105-55m89-45c-19 35-49 66-75 98m15-54l-48 59m79-80c-19 27-42 52-63 78m-22-28l-26 32m11-27c44-11 110-61 137-85m6 9c-18 33-46 63-71 93m78-80c-17 27-39 51-60 76m66-63c-14 20-31 40-47 59m54-48l-35 43m41-32l-22 27m-107-15l-36 42m-36-10l-10 12m34-23l-19 23m-53-9l-5 6m18-3l-4 4m20-5l-5 6m-52-28l-16 19m24-11l-11 14m21-7l-8 9m-33-51l-30 37m37-27l-25 30m33-21l-21 25m-33-52l-25 32m51-46c-12 18-26 34-40 50m47-38l-36 43m435-97h1m-134-11c21 12 51 30 83 42m-94-67c19 11 47 28 78 41m-88-65c18 11 44 26 72 38m-80-61c16 9 38 23 63 35m-71-58c14 8 33 20 55 31m-63-53l47 25m-53-47l36 20m-43-42l26 14m44 172c23 13 54 31 86 43m-72-17c24 14 56 32 88 43m-71-15c24 14 55 31 86 40m-68-11c24 13 54 28 84 36m-63-6c24 12 51 25 78 31m-52 1c21 10 44 19 67 24m-38 8c17 8 35 13 53 16m-23 15l38 11m203-144c10-3 28-25 48-25-20 0-38-22-48-25-11-5-27 0-42 10 10-15 15-31 10-42-3-10-25-28-25-48 0 20-22 38-25 48-5 11 0 27 10 42-15-10-31-15-42-10-10 3-28 25-48 25 20 0 38 22 48 25 11 5 27 0 42-10-10 15-15 31-10 42 3 10 25 28 25 48 0-20 22-38 25-48 5-11 0-27-10-42 15 10 31 15 42 10v0m-125-45c-20-26 20-68 48-47m90 50c28-26-20-76-49-47m-88 83c-23 26 19 70 48 47m89-49c28 26-20 76-49 46m-36-78l-35-35m65 35l35-35m-65 65l-35 35m65-35l35 35m-60 31c4 81 36 105 35 162m-19-157c4 71 30 97 34 145m-15 9c-10-37-63-86-115-60 46-4 40 81 115 60v0m0 3c-17-27-38-38-60-48m75 30c-10-63 3-107 55-115-36 32 7 101-55 115v0m0 0c5-32 13-59 25-80M623 0c18 57 55 85 107 89M641 0c16 35 41 56 74 65M664 0c9 15 21 27 34 36m-203 66c70-39 75-70 84-102m-84 78c46-29 57-54 65-78m-65 48c23-17 35-33 42-48m68 330s-5-20-15-20-20-4-20-19c0-10 24-82 15-141-27-19-56-30-90-10h5c30-10 58-10 85 10m35 0c36-43 75-22 115 0-38-16-75-35-109 0h-6v0m10 120c30-1 25 35 10 35-7 0-13-8-19-9-16-1-16 9 4 4m-50 50v10l5-5-5-5v0m95-5v10l-5-5 5-5m-90 10c12 6 14-5 20-5 5 0 11 5 16 5s12-6 17-6c18 10 20 1 32 1m-70 25c13 16 29 11 45 0-14 8-29 5-45 0v0m-95-190c4-9 14-17 25-17 20 0 35 22 50 22m-77 2c3 9 14 13 27 13 21 1 35-10 50-15m55 0c22-1 31-18 45-20 30-5 50 20 65 20m-90-5c-5 15 17 25 30 25 19 0 45-20 60-20M283 535a701 701 0 0 0 718 40M180 945a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m0 0a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0M53 1062a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m1043-59l204-189m-760 191c-37 22-13-14-10-30-16 3-52 27-30-10l-3-6c-15-28 18-7 33-4-3-16-27-52 10-30 37-22 13 14 10 30 16-3 49-25 32 6l-2 4c22 37-14 13-30 10 3 16 27 52-10 30v0m90 30c-43 0-4-19 6-31-15-6-58-3-21-24 0-43 19-4 31 6 6-15 3-58 24-21 43 0 4 19-6 31 15 6 58 3 21 24 0 43-19 4-31-6-6 15-3 58-24 21v0m540-647c9 0 18 8 18 17s-9 18-18 18-17-9-17-18 8-17 17-17v0',
                /* 2,1,4,2 Queen court_BLUE_DETAIL 2 Diamons */
                'M485 934c143 32 266 14 371-22m-371-8c157 36 286 11 397-33 M508 680l87 180m161-12l-82-169m218 179a229 229 0 0 1 16-257m190 662c-24-245-111-278-206-405l133-160m275 226L660 397 M321 619L1 939m320-320a359 359 0 0 1 87 523 M166 568c223 86 456 123 742 33m-234 78c67-6 136-19 209-39m-508 21c43 9 88 15 133 19m-371-91c42 17 84 32 127 45m616-56c-264 79-479 46-689-32m647-3a962 962 0 0 1-615-33m586 10a923 923 0 0 1-568-36m539 12a886 886 0 0 1-524-38m285 31c-93-5-181-26-272-58m482 40c-52 11-102 17-150 18m-74 162l102 211m96-8l-97-202m-67 1l101 208m32-2l-99-206 M476 840c160 43 283 17 395-29m-389 61c160 40 288 13 400-33 M0 716L503 0 M308 278C289 470 187 582 64 625m418 340c59 12 115 17 168 16m-166-37c59 13 114 18 166 17m-167-6c59 12 115 17 167 16m-169 3c59 13 116 18 169 17m0 28c-69 2-132 14-190 32m19-67c60 13 117 18 171 17m0-2c-65 2-126 13-182 28m182 12c-73 2-140 16-200 36m200-46c-71 2-136 15-195 34m195-54c-67 2-129 13-185 30m12-45c17 4 33 7 50 9m0 0l-55 13m509-265l-1-11c0-28 10-50 20-62m-66 130a169 169 0 0 1 20-169m-41 194c-14-26-23-58-23-93 0-48 16-91 41-120m194 615a516 516 0 0 0-79-235c-35-53-75-90-115-142l99-119m0 1l270 222m-235 333l-21-14a238 238 0 0 1-72-328m72 363l-16-10a269 269 0 0 1-77-377m49 431l-5-4a329 329 0 0 1-84-474m170 278a65 70 0 0 1-61-70 65 70 0 0 1 17-48m59-287c3-16 13-62 34-75 26-16 35-12 62-31 32-22 61 1 20 25-34 21-32 16-47 21 15 35 10 60-10 70m75-82c44-16 68 3 10 22-83 28-71 0-10-22v0m2-29c39-13 59 6 5 24-28 10-45 13-53 12m53 16c42-16 65 3 9 22-80 28-68 0-9-22v0m10 24c38-14 57 6 7 23-72 24-60-4-7-23v0m-4 46c9-9 16-18 17-26m-80 75c15-9 35-23 51-38m-13-25c14 28 34 51 15 106m12 10c13-33 13-59 7-79-5-16-12-28-18-39m-74-240c-15-55-85 15-30 30-55 15 15 85 30 30 15 55 85-15 30-30 55-15-15-85-30-30v0m16 30a16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16 16 16 0 0 1 16 16v0m-43-50c-37-73 91-73 54 0m23 23c73-37 73 91 0 54m-23 23c37 73-91 73-54 0m-23-23c-73 37-73-91 0-54m20 27h-45m5 0a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5v0m70-30v-45m0 5a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5v0m30 70h45m-5 0a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5v0m-70 30v45m0-5a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5v0m11-81l14-14m5 0a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5v0m-19 36l14 14m0 5a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5v0m-36-41l-14-14m-5 0a5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5v0m19 36l-14 14m0 5a5 5 0 0 0 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5v0m35 74l4 6m12-15l4 6m-50 24c-32-19-67-27-105-25m105 25c-46-41-92-69-140-20 40 5 55 44 138 21m82-36c17-23 36-41 65-35-4 22-26 34-50 45 M661 0c123 169 234 280 247 601 M642 25c119 162 218 261 235 550 M683 231c47 71 80 144 96 263 M679 282a529 529 0 0 1 66 184 M0 586L412 0m222 0c12 37 56 163 56 180 0 20-10 60-10 70s0 80-10 120-60 130-90 130-70-35-100-30c-71 11-143-127-130-130 0 0-5 11-10 10-18-3-29-32-35-54m-141 57c-34-39-93-43-154-43 25-11 55-14 70-40 20 13 44 11 70 6m-32 47L345 0 M118 323v0m-68-12l5-2c10-4 21-10 30-20 17 7 35 7 53 5 M90 90c50 50-7 124 30 149 50 35 76-28 47-46-26-18-48 19-27 27 14 5 20 0 20-10 M90 90c56 42 110-27 142 5 36 37-12 74-33 53-22-24 11-53 24-32 8 15-1 20-10 17m-23 87c17-29-18-48-40-70 27 11 55 34 80 10m40-54c-4-40-31-72-53-106m65 89c-8-34-29-62-47-89m84 133l-9-48 45-5-5-50 44-5 M274 196l-9-46 48-9m-79 112l-9-43 46-9m-72 101l-9-37 42-9m-68 97l-14-43 47-5m-33 48v0m250-226c81-20 122-72 158-127m-54 0c-17 23-34 43-56 58m74-58c-25 37-51 67-93 86 M554 0c-31 47-65 87-127 108m244 2c-43-27-70-67-95-110m52 0l11 16 M611 0c13 21 26 40 42 56 M593 0c20 33 41 63 70 86 M340 265c10 55-15 45 0 25m85-90c33-22 65-43 130 0-2-1 2 5 0 4-35-24-79-36-130-4v0m180-5c31-37 60-20 85-10-25-5-60-20-85 15v-5 0m0 0c-10 90 21 96 20 150 0 10-30 5-30 20m-35-45c-21 0-52 34-10 35 7 0 17-10 22-10 39 3-1 5-12 5m-35 40v10l5-5-5-5v0m105 0v10l-5-5 5-5v0m-5 5l-30-5c-5 0-10 5-15 5s-15-5-20-5c0 0 5 0 0 0s-20 5-30 5m30 20c5 15 40 15 40 0 M435 245c29 10 49-25 75-25 30 0 45 33 50 30m-95-10c22 55 85 0 95 10m125-25c-33-23-65 15-80 20 15 0 65 35 78-14 M349 342v-1m2 11l-9-2m69 91c-43-10-87-23-131-38m39-71l-16-6m29 20l-32-11m56 29c-20-5-39-12-59-19m65 32l-67-22m74 34l-77-24m86 37c-29-8-59-17-88-28m97 41c-33-9-66-19-100-31m111 44c-38-9-76-21-114-35m437 54c-33 5-64 9-94 11m42-54l-12 2m23 7l-29 3m39 5l-44 6m54 3c-20 3-40 6-60 7m70 1c-26 5-51 8-76 10 M211 553l15-47m70-66l-45 127m81-116l-38 129m78-118l-33 130m69-121l-20 132m44 8c4-44 6-90 11-134m33 140l3-134m41 138l-4-134m48 136l-16-132m58 132l-27-123m73 121l-45-132m83 128l-50-130m96 124l-60-127m106 118l-74-123m128 111l-98-116 M246 366c2 37-2 78-7 121m22-143c1 37-2 77-7 118m22-139c1 33-1 68-5 104m-41-38c1 38-2 78-7 120m-8-99c1 37-2 77-7 118m-8-96c1 34-2 72-6 111m-9-90c1 32-2 67-5 103m-10-82c1 30-1 62-5 95m-10-73c1 26-1 54-3 83m-13-62c2 23 1 47-1 72m-13-50l-1 58m-18-32v42m-15-21v28m200-312c1 24 0 50-2 76m809 885c-24-245-111-278-206-405l133-160m9 435l-58 43a20 20 0 1 0 28 29l48-55m-35-141l-31-22a20 20 0 1 0-24 32l65 40m0 0l-60-28a20 20 0 1 0-11 39l64 14m0 0l-61-4a20 20 0 1 0 3 40l60-11m0 0l-61 16a20 20 0 1 0 16 37l57-29m18 17l-47 74a20 20 0 1 0 37 17l29-83m0 0l-25 105a20 20 0 1 0 39 5l7-54m53-259c10 35-35 60-45-10-10 70-55 45-45 10-35 10-60-35 10-45-70-10-45-55-10-45-10-35 35-60 45 10 10-70 55-45 45-10 35-10 60 35-10 45 70 10 45 55 10 45v0m125 136c-10-70-55-45-45-10-35-10-60 35 10 45m-45-27c-19-7-37-16-51-29-25-23-41-58-41-115m-18 32c5 44 21 76 46 98 27 25 64 37 104 45m54-53c-7-38-18-73-39-102-18-24-42-42-76-53m8 24c22 9 39 24 51 41 15 20 24 44 31 71 M936 865l10 10c25 22 57 35 92 42m-13-24c-26-7-49-17-66-33-6-5-11-11-15-17m77-94a154 154 0 0 1 53 81m29 32c-7-33-16-63-33-89m-40 52a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m160 195a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m-30 130a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m71-24l-3 3m40-46l-37 43m51-58l-14 15m32-36l-18 21m-71 58l-88 99m177-201l-22 26m-83 71l-74 85m136-156l-2 3m45-52l-27 31m-135 131l-21 24m62-71l-22 25m67-76l-13 15m41-46l-12 13m60-68l-33 37m-137 134l-16 18m51-58l-22 25m103-117l-67 76m118-134l-37 41m-109 102l-41 47m129-147l-75 85m121-138l-32 37m-115 108l-33 37m125-142l-79 90m123-139l-30 33m-118 111l-26 30m71-81l-31 36m81-92l-32 36m73-83l-28 32m-118 112l-21 24m66-75l-32 36m81-93l-33 38m73-83l-26 30m-117 111l-18 20m110-125l-79 89m119-135l-27 31m-114 106l-15 18m103-117l-74 83m115-131l-28 33m-108 99l-15 18m55-63l-25 28m54-61l-15 17m71-80l-31 35m-99 90l-17 20m47-54l-14 16m68-78h0m34-39l-34 39m-88 78l-21 23m46-52l-8 9m94-106l-37 41m-85 74l-18 21m45-51l-1 1m5-6l-4 5m44-50l-2 2m41-47l-6 7m-117 110l-14 16m125-142l-8 9m-107 100l-18 20m122-139l-12 13m-106 98l-14 16m120-136l-4 4m-116 110l-9 10m45-51l-2 2m42-48l-3 4m36-41l-4 5m-109 101l-15 16m24-27l-9 11m13-15l-4 4m92-104l-24 27m-80 69l-21 24m113-130l-17 20m-91 81l-15 17m33-38l-3 4m36-41l-12 14m31-36l-2 3m29-33l-11 12m-101 92l-10 12m89-102l-65 74m86-98l-6 7 M974 895l-6 7m93-105l-73 82m89-101l-2 3 M961 887l-3 4m48-54l-31 35m78-89l-28 31m-76 64l-1 1m53-60l-38 44m44-51l-6 7m43-48l-37 41m-68 56h-1m95-108l-81 92 M264 633L0 898',
                /* 2,1,4,3 Queen court_BLUE_DETAIL 3 Clubs */
                'M1300 985L996 759 M1 780a312 312 0 0 1 519 225c0 57-16 111-44 157 M2 780l411 305m100-145h271m516 250L924 911m72-153L887 915m117-119l-80 115m-67-310l139 158 M887 914a213 213 0 0 1-30-313m44 293a187 187 0 0 1-27-274m130 176l296 220 M916 874a162 162 0 0 1-25-235m104 121H853m96-55h-92m100 110h-89m-11-215H159m682-30H205m605-60H263m532-30H284 M642 0c35 142 47 258 153 480l62 121m-21 29H179m511 0c2 129 48 162 50 310m-80-310c3 129 57 162 60 310 M580 630c4 166 90 182 95 310 M540 630c4 162 105 182 110 310 M440 630c6 162 147 191 155 310 M410 630c6 162 152 196 164 310m-56 25h263m-272-40h63m-67-15h62m-68-15h62m-61-15h53m-52-15h42m-41-15h30m-29-15h16m220 90h49m-49-15h53m-54-15h59m-61-15h59m-61-15h54m-56-15h50m-53-15h46m-49-15h43m-265 0h1m773 385a287 287 0 0 1-473-210c0-48 12-92 33-131m378 295c-35 26-78 41-126 41a206 206 0 0 1-196-280m208 154l-12 1c-49 0-81-31-85-73m123 92c-11 4-24 6-38 6-65 0-110-46-110-105l1-11m214 159c-30 20-65 32-105 32a180 180 0 0 1-175-239m-257 46c3-25 35 7 10 11 20-15 20 30 0 15 25 3-7 35-11 10 15 20-29 20-14 0-4 25-36-7-11-11-20 16-20-29 0-14-25-4 7-36 11-11-15-20 30-20 15 0v0m5 18a13 13 0 0 1-13 13 13 13 0 0 1-12-13 13 13 0 0 1 12-12 13 13 0 0 1 13 12v0m-78-35v70 M219 700l-40-70m-9 73l-48-84 M394 0L0 619m182-287c-50-18-101-14-152-2 81-87 76-214 96-330m208 0L130 320 M408 0C348 226 197 688 0 664 M438 0c-48 224-99 536-312 615m14-311l49 17m-40-31l49 17m-39-32l49 17m-40-32l49 17m-25-28l35 13m-10-22l19 7 M42 327c16-11 31-22 43-37 22 9 42 4 63 2m-75-26c28 6 58 5 88 4m-56-116c26 22-3 72 35 91 36 18 59-38 35-50-20-10-45 25-20 35 14 6 20-29 10-20m-60-57c34 12 60-41 97-19 35 21 0 70-23 56-20-11-3-51 18-35 13 8-13 32-11 19m47-16c-4-20-9-40-28-48 4-28 1-52-15-70 17-2 34-2 55-20 28 10 53 3 77-2m-71 112c-5-11-11-22-21-30 2-14 0-26-5-35 8 1 22 1 35-10 9 7 21 9 33 9m101-17c14-5 27-13 39-22m-45 46c14-4 27-13 40-23m-47 46c16-6 29-16 43-27m-51 53c17-4 31-13 45-24m-52 47c18-5 33-16 47-28m-55 53c18-2 34-13 49-24m-58 49c20-5 38-20 54-33m-62 58c20-5 40-20 57-33m-66 56c22-5 43-23 61-37m-69 60c22-9 48-26 63-38m-72 63c22-8 49-25 66-38m-76 63c22-6 50-24 68-38m-78 62c23-7 53-27 72-40m-83 65c23-4 54-24 74-39m-84 63c23-4 56-26 76-41m-85 60c24-6 56-21 75-33m-87 57c24-6 58-21 77-34m-90 60c21-4 54-18 76-30m-89 53c22-4 56-19 77-32m-92 57c23-5 57-19 78-32m-91 53c26-7 63-24 80-37m-96 61c24-6 57-21 76-34m-95 59c19-5 46-15 66-26m432-353c20 78 50 167 105 285m-99-367l-8 112c0 15-18 143-35 155-18 13-61 85-70 90-26 15-69-15-75-20-41 11-132-97-100-115l-23-10m299-60c19 62 45 131 84 215m-94-164c17 49 38 103 66 164m23-10h-27m21-15h-28m21-15h-27m20-15h-27m21-15h-27m21-15h-27m21-15h-27m21-15h-27m21-15h-27m22-15h-27m21-15h-26m21-15h-20m15-15h-13 M403 404c-18-19-36-39-52-62m149 138c-19-12-38-25-56-40m31 40c-48-32-92-70-130-122m106 122c-41-29-79-63-112-107m88 107c-34-26-66-55-94-92m71 92c-28-22-54-47-78-77m56 77c-22-18-43-39-62-63m40 63c-16-15-32-31-47-49m27 49c-12-11-23-23-34-36m14 36l-22-23m2 23l-9-10m82-121l-16-23m168 154l-33-22m-92 92c-12 0-23-3-34-9m-21 7c31 21 63 12 95 12-4-9-16-15-56-27m60-1c-12 0-23 3-34 9m-21-7c30-21 63-12 95-12-5 9-16 15-56 27m61 0c-12 0-23-3-34-9m-21 7c30 21 63 12 95 12-5-9-16-15-56-27m60-1c-12 0-23 3-34 9m-22-7c31-21 64-12 96-12-5 9-16 15-56 27m54 3c-11 0-22-3-33-9m-22 7c31 21 63 12 95 12-4-9-16-15-55-27m59-1c-11 0-23 3-34 9m-21-7c31-21 63-12 95-12-4 9-16 15-56 27m61 0c-11 0-23-3-34-9m-21 7c31 21 63 12 95 12-4-9-16-15-56-27m60-1c-12 0-23 3-34 9m-21-7c31-21 63-12 95-12-4 9-16 15-56 27m62 0c-11 0-23-3-34-9m-21 7c31 21 63 12 95 12-4-9-16-15-56-27m60-1c-12 0-23 3-34 9m-21-7c24-17 50-14 76-13m7 12c-9 5-22 9-44 16m-468 2c-12 0-23-3-34-9m-21 7c31 21 63 12 95 12-4-9-16-15-56-27m60-1c-12 0-23 3-34 9m-21-7c30-21 63-12 95-12-5 9-16 15-56 27m-81-31l49 2c-4 9-16 15-56 27m16-17c-8 0-16 1-23 4m-24 26l43-2c-3-6-9-11-25-17m593 7c-8-1-16-4-24-8m-21 7c17 11 34 14 51 14m145 451l-51 8c-2 13 2 18 5 25l50-16m5 12l-46 21c1 13 6 17 11 23l43-30m9 10l-39 35c6 12 13 14 19 17l32-40m15 10l-23 44c10 8 17 8 24 9l15-46m15 4l-10 52c11 6 18 3 25 2l3-52m20-1l5 55c13 3 19-2 25-5l-12-53 M978 982l-50-7c-6 11-4 18-3 25h55m-123-34a13 13 0 0 1-13 12 13 13 0 0 1-12-14 13 13 0 0 1 14-11 13 13 0 0 1 11 13v0m-26 11c-26 13-22-42 2-25-13-26 42-22 25 2 26-13 22 42-2 25 13 26-42 21-25-2v0m30 72a13 13 0 0 1-10 15 13 13 0 0 1-14-10 13 13 0 0 1 10-15 13 13 0 0 1 14 10v0m-22 17c-22 19-32-35-5-25-19-22 35-31 25-4 22-19 32 35 4 24 20 22-35 32-24 5v0m56 59a13 13 0 0 1-6 16 13 13 0 0 1-17-7 13 13 0 0 1 7-16 13 13 0 0 1 16 7v0m-18 21c-17 24-39-27-10-23-23-17 27-39 23-10 17-24 39 27 10 23 24 17-27 39-23 10v0m73 34a13 13 0 0 1 1 18 13 13 0 0 1-18 1 13 13 0 0 1 0-18 13 13 0 0 1 17-1v0m-7 27c-6 29-47-9-19-17-28-6 9-46 17-18 6-29 47 9 19 17 28 6-9 46-17 18v0m77 8a13 13 0 0 1 8 15 13 13 0 0 1-15 9 13 13 0 0 1-9-16 13 13 0 0 1 16-8v0m5 27c7 28-46 13-24-7-28 7-13-45 7-24-7-28 45-12 24 7 28-7 13 46-7 24v0m83-17a13 13 0 0 1 12 12 13 13 0 0 1-12 13 13 13 0 0 1-12-12 13 13 0 0 1 12-13v0m13 24c16 25-39 27-25 1-25 16-26-39-1-25-16-24 39-26 25-1 25-16 26 39 1 25v0m68-45a13 13 0 0 1 16 7 13 13 0 0 1-6 16 13 13 0 0 1-17-7 13 13 0 0 1 7-16v0m21 18c24 17-27 39-23 10-17 23-38-27-10-23-23-17 28-39 24-10 17-23 38 27 9 23v0m-69-118l19 36c9-2 14-6 17-10 M643 0c102 342 346 462 231 620m216-15c-15-90 70-90 55 0 90-15 90 70 0 55 15 90-70 90-55 0-90 15-90-70 0-55v0m28-37c0 60 5 65 65 65-60 0-65 5-65 65 0-60-5-65-65-65 60 0 65-5 65-65v0m12 65a13 13 0 0 1-12 12 13 13 0 0 1-13-12 13 13 0 0 1 13-13 13 13 0 0 1 12 13v0m-69-29c-3-9-6-23-6-34 11 0 25 3 34 6m57 0c9-3 23-6 34-6 0 11-3 25-6 34m-113 57c-3 9-6 23-6 34 11 0 25-3 34-6m57 0c9 3 23 6 34 6 0-11-3-25-6-34m-93 161c1-7 3-16 9-22 10-10 70-40 80-40s20 15 30 15 15 25-5 25-35-10-35-10c2 22-13 27-25 35m18-13c5 23 1 42-6 58m53-65c75-25 82 12 10 25-55 10-60-8-10-25v0m-2 27c71-19 78 15 9 25-53 8-57-12-9-25v0m1 28c72-9 75 25 6 27-53 0-55-20-6-27v0m1-85l13-10c45-26 52 14 8 31-9 4-16 5-21 3m-15-34c-18-39 35-80 50-125 8 54 14 106-50 125v0m0 0c18-26 30-57 45-85m-104 46c13 3 26 13 39 34-63 6-113 3-130-25 26 3 49-8 71-10m59 35c-24-10-52-17-85-17 M667 134c-19-6-36-16-51-31-19-21-34-52-41-103m92 124c-16-6-31-15-43-28-18-19-32-47-39-96m83 114c-14-6-26-14-37-25-15-16-29-43-36-89m68 89c-7-4-12-8-17-13-12-13-24-34-30-76m49 102c-10-5-19-11-27-20-13-14-26-38-33-82m54 75l-6-6c-10-11-21-30-27-69 M512 0c-9 53-28 94-55 123-16 18-35 30-54 39 M502 0c-9 51-27 89-52 117-14 14-29 25-44 33 M492 0c-9 49-26 84-50 110-10 11-21 20-33 27 M481 0c-8 46-24 79-46 103-7 8-15 14-23 20m11-53c12-17 22-39 28-70m20 0c-8 44-23 75-43 96l-13 12 M461 0c-8 43-23 71-42 91m236-35c-7-10-14-26-19-56 M402 22c13-5 24-13 36-22m-18 180c38-23 75-48 120-15v5c-60-35-70-10-120 10v0m170-10v5c20-20 45-16 70-10-37-19-54-8-70 5v0m0 0s-5 15-5 45c0 25 20 85 20 95 0 13-12 22-20 20-5-1-20 20-20 20m-30-55c-10 0-30 35-5 35 40-15 60-5 0 0m-25 35l-5 10 10-5-5-5v0m95 0l-5 10-5-5 10-5v0m-90 5c10 0 20-5 30-5s15 5 20 5 10-5 15-5 10 5 15 5m-60 25c14 4 22 21 45 0m-45-200c-52-18-74 29-100 30 40 0 35 9 50 10 38 3 51-26 43-42m137 7c-35-30-55 20-75 15 29 7 50 30 75-5m503 546c-5-22-10-44-17-64m39 73c-6-24-10-48-17-71m38 193c-6 4-18 6-27 7 M582 665h57m-51 35h56m-47 35h55m-40 35h51m-33 35h44m-25 35h35m-20 35h27m-19 35h23 M585 683h54a18 18 0 1 0 0-35h-57m10 69l52 1a18 18 0 1 0 0-35h-56m16 70l48-1a18 18 0 1 0 0-34h-55m24 70l42-1a18 18 0 1 0 0-34h-51m28 70h34a18 18 0 1 0 0-35h-44m27 69l27 1a18 18 0 1 0 0-35h-35m20 69l22 1a18 18 0 1 0 0-35h-27m10 70l21-1a18 18 0 1 0 0-34h-23 M468 665h75m-65 35h71m-54 35h66m-40 35h57m-27 35h48m-19 35h41m-20 35h36m-23 35h33 M541 648h-73a18 18 0 1 0 0 35h75m2 0h-67a18 18 0 1 0 0 35h71m6-1l-60 1a18 18 0 1 0 0 35h66m8 0l-48-1a18 18 0 1 0 0 36h57m10 0h-37a18 18 0 1 0 0 35h48m11 0l-30-1a18 18 0 1 0 0 36h41m9-1l-29 1a18 18 0 1 0 0 35h36m6 0l-29-1a18 18 0 1 0 0 36h33'
            ] // <<< end Queen court BLUE_DETAIL
        ], // <<< end 2,1 court Queen

        [ /* 2,2 = King */
            [ /* 2,2,0 = King court_GOLD */
                /* 2,2,0,0 King court_GOLD 0 Spades */
                'M332 0c89 120 128 183 161 259 186-27 339-28 491-12 18-62 37-114 129-247zm268 516l-81 8c29 103 54 209 65 318 46 13 91 11 145-2 18-90 51-182 100-273l-4-12-5 10c-6 3-13 3-20 6l-29 10c-12 3-24 9-34 5-3-1-6 5-9 6-31 66-54 133-70 199-12-96-34-187-58-275zm464 16a802 802 0 0 0-174 480c-4 151 32 304 78 461l30-5c-47-157-82-308-78-455 4-153 46-303 173-470zm41 23c-6 12-13 24-2 35l-1 1c-8-3-16-4-24-5l15 19c-14-3-25-1-32 16 37-9 78 42 94 14 19-26-44-43-50-80zm-182 28c-53 90-86 178-104 265l1-4c-73 25-131 39-188 36-47-2-92-17-139-44l6 70c42 20 85 32 129 34 60 3 117-9 180-29v-2c-26 187 11 369 61 547l30-5c-41-146-73-292-69-440 4-137 37-276 123-420zm136 48c-6 12-12 25-1 35l1 1-26-4 15 19c-14-3-25-1-30 17 36-11 79 39 94 10 18-26-46-41-53-78zm-46 78c-3 13-7 26 5 35l-1 1h-24l19 16c-15 0-25 4-28 22 34-17 84 25 95-6 13-29-53-33-66-68zm-33 81c-3 13-7 26 6 34l-1 1-24 1 21 16h-1c-14 1-25 4-27 23 33-18 85 21 94-10 12-30-53-31-68-65zm170 83c-25 0-40 29-40 50 0 45 61 40 63 17 2-12-18-37-18-37 30-1 55 25 85 25 17 0 45-15 45-15 0-11 8-19 0-35-25 10-93-5-135-5zm-74 63c-15 145 90 322 170 450 21-10 39-21 54-31v-101c-20-34-47-80-62-111l7-4c8-4 11-14 6-21-4-8-14-11-22-6-5 3-6 1-7 0-1-2-2-4 3-7 7-4 10-12 8-18-1-6-7-12-15-12l-9 2c-10 6-16 16-19 26 2-8 6-15 12-20-65-9-89-51-71-127-20-6-38-13-55-20zm-427 5c-23 0-47 10-42 29h-2c-75-75-75 135 0 60h2c-10 38 95 38 86 0h2c75 75 75-135 0-60l-2-1c4-19-20-28-44-28zm316 108l-12 2c-19 8-27 30-20 49 3 9 13 13 21 10 8-4 12-13 9-21-2-6 0-7 1-8 2 0 4-1 6 5 3 7 10 10 17 10 6-1 13-6 14-13 1-3 0-6-1-9a39 39 0 0 0-35-25zm0 12h1c10 1 19 7 23 17v3c0 2-1 3-3 3s-4 0-4-3c-4-10-14-14-22-11s-12 13-8 23c1 2 0 5-2 5-2 1-5 0-6-2-5-14 1-29 13-33 3-2 5-2 8-2zm253 26c2 0 3 1 4 3 0 2 0 3-2 4-10 6-13 16-9 24 5 7 15 10 25 4 2-1 4 0 5 2s1 4-1 5c-13 7-29 4-35-7-7-12-2-27 11-35h2zm-187 21l-12 3c-19 7-27 29-19 49 3 8 12 12 20 9 9-4 13-13 9-21-2-6 0-7 2-8 1 0 4-1 6 5 3 7 10 11 16 10 7-1 13-5 15-13l-1-9a39 39 0 0 0-36-25zm1 12h1c9 1 18 7 22 18l1 2c-1 2-2 3-4 3s-3 0-4-2a6 6 0 0 0 0-1c-4-10-14-14-22-11-7 3-12 13-8 23 1 2 0 5-2 6-2 0-4-1-5-3-6-14 0-29 12-33l9-2zm39 64l-13 2c-19 8-27 30-19 49 3 9 12 13 21 10 8-4 12-13 8-21h1c-3-6 0-7 1-8 1 0 4-1 6 5 3 7 10 11 16 10 7-1 13-6 15-13l-1-9a39 39 0 0 0-35-25zm0 12h1c9 1 18 7 23 17v3c-1 2-2 3-4 3s-3 0-4-3c-4-10-14-14-22-11-7 3-12 13-8 23 1 2 0 5-2 5-2 1-4 0-5-2-6-14 0-29 12-33l9-2zm17 76c-5 0-9 0-13 2-18 7-27 30-19 49 3 8 12 13 21 9 8-3 12-13 9-21-3-5 0-7 1-7 1-1 4-1 6 4 3 8 10 11 16 11 7-1 13-6 15-13l-1-9a39 39 0 0 0-35-25zm0 12h1c9 0 19 7 23 17v2c-1 3-2 4-4 4l-4-3c-4-10-14-14-21-11-8 3-13 13-9 23 1 2 0 4-2 5s-4 0-5-2c-5-14 1-29 13-34l8-1zm-11 70l-13 2c-18 8-27 30-19 49 3 9 13 13 21 10 8-4 12-13 9-21-2-6 0-7 1-8 1 0 4-1 6 5 3 7 10 11 17 10 6-1 12-6 14-13l-1-9a39 39 0 0 0-35-25zm0 12h1c9 1 19 7 23 17v3c0 2-2 3-4 3-1 0-3 0-4-3-4-10-14-14-21-11-8 3-12 13-8 23 0 2-1 5-3 5-2 1-4 0-5-2-5-14 1-29 13-33l8-2zm-36 63c-4 0-9 1-13 3-13 5-21 18-22 33v2l12-2c1-10 6-19 15-22 10-4 23 0 30 11l11-3-1-3c-7-12-19-19-32-19z',
                /* 2,2,0,1 King court_GOLD 1 Hearts */
                'M320 0c61 95 92 153 116 220 187-17 340-9 491 15 21-60 42-111 139-235zm770 79c-15 0-30 9-30 31 0 20 15 81-5 95 26 40 26 70 4 91 5-7 3-21-12-23-25-2-22 47 13 47 65 0 25-130 25-215 5 20 35 20 35-5 0-13-15-21-30-21zm140 106h-2c0 17-4 33-13 49 4 7 9 11 15 11 11 0 20-13 20-30s-9-30-20-30zm20 30a23 25 0 0 0 23 25 23 25 0 0 0 22-25 23 25 0 0 0-22-25 23 25 0 0 0-23 25zm-50 120a25 25 0 0 0-11 3c-36 17-52 17-88 0a25 25 0 1 0-22 44c28 15 56 20 84 16l-12 57c-4 16-10 32-18 48-9-14-15-28-18-43l-12-58-34 49c-18 26-35 40-50 48-4 5-20 22-29 29h-4l1 2h-1 1c58 131 191 271 313 374v-40c-111-98-228-225-281-339 24-8 48-26 71-60 7 33 26 59 45 85 20-30 33-60 40-90 28 55 77 71 125 87v-3c-16-10-29-22-39-38-27-12-48-27-64-57l-26-52c13-3 27-8 40-15a25 25 0 0 0-11-47zM721 538l-25 25c-3 6-9 12-17 17L511 744l22 81c16-17 16-43 0-59l-4-4 4 4a42 42 0 0 0 61-60l-4-4 4 4a42 42 0 1 0 61-59l-5-4 5 4a42 42 0 1 0 61-59l-5-5 5 5c10 10 24 14 38 12l10-48c-15-3-30-8-43-14zm-6 110a42 42 0 0 0-1 60l3 3-3-3a42 42 0 1 0-61 59l4 4-4-4a42 42 0 1 0-61 60l4 3-4-3a43 43 0 0 0-59-2c7 27 13 55 18 84l183-179c3-31 7-63 13-94-12-1-24 4-32 12zm242-70l-13 23a318 318 0 0 1 88 223c1 71-21 138-61 192-24 31-56 59-93 76l45 4c26-18 50-41 68-65 44-58 67-131 67-207a344 344 0 0 0-101-246zm-205 30zm151 83a630 630 0 0 0-44 309c15-10 29-23 40-38 27-36 44-85 44-138 0-51-15-98-40-133zm227 50v289h105l15-18v-67l-44-54 34-38-43-41-37 41v-79zM571 925l-15 14 4 31 10-10 20 20 20-20 20 20 20-20 20 20 20-20 20 20 20-20 2 2-2-37zm589 4l40 49-40 40zm-70 81c-21 28-41 58-74 77a15 15 0 0 0-8-3 15 15 0 0 0-15 19c9 39 9 54 0 82a15 15 0 0 0 26 14l71 71c4-21 5-45-20-90 29-10 53-26 70-50-17-7-40-13-70-20 23-37 25-69 20-100zm-31 72l-8 16-17 27 31 7 34 8c-10 8-22 14-36 19l-26 8 13 24 8 16-23-24-9-6c5-21 4-42-2-69l3-2c12-7 23-15 32-24zm241 206c-63 54-136 97-214 136l22 22c69-34 133-73 192-120z',
                /* 2,2,0,2 King court_GOLD 2 Diamons */
                'M426 0c37 62 69 123 84 190 220-50 290 135 490 75-6-108 56-198 112-265H426zm874 80l-80 80v444c30 15 57 33 80 50V80z M730 560l-18 16c-74 66-116 80-205 103l19 129c95-24 169-49 253-118h83c-37 79-60 153-74 225H528l-1 25h257c-28 175 0 332 27 486 48-4 95-6 84 44l122-49c-89-265-179-449 9-763l59-98H730zm331 89l-16 25a466 466 0 0 1 210 263l27-12a501 501 0 0 0-221-276zm-23 39l-12 20c5 14-28 35-9 47 20 14 35-3 53-20-15 20-31 39-10 55 19 17 37-2 55-19-16 20-30 39-18 56 13 18 39 0 61-12-20 15-46 28-33 50s39 11 63 2c-22 12-44 26-33 48 10 21 33 11 58 6-24 8-52 19-30 52l24-14c-21 4-17-11-4-13 40-6 26-28 34-34-12-1-14-26-50-7-19 8-18-8-5-12 38-12 21-31 28-39-12 1-18-23-49 0-17 9-18-7-6-13 37-17 18-33 23-42-11 3-20-20-49 7-16 15-20 0-10-9 31-25 9-37 12-47-11 6-25-14-46 20-15 15-20 0-10-9 30-26 7-37 10-47-10 6-25-14-45 21-13 16-20 2-11-8 20-21 13-31 9-39zm262 337a421 421 0 0 0-251 247l-3 10-44 18 38 111c79-34 161-79 260-144v-242z',
                /* 2,2,0,3 King court_GOLD 3 Clubs */
                'M316 799c-13 0-25 2-36 6l-1 82c-30 4-59 10-87 19a121 121 0 0 0 11 72c86-22 148-22 228-6a121 121 0 0 0 7-75c-29-6-56-10-82-12l-5-81c-11-3-23-5-35-5zm-1 66a15 15 0 0 1 15 15 15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15zm-50 45a15 15 0 0 1 15 15 15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15zm100 0a15 15 0 0 1 15 15 15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15zm-80-107a31 28 0 0 1 0-1 31 28 0 0 1 31-27 31 28 0 0 1 31 28m-44-25c-3-14-14-52-38-48s-42 59-20 70c17 9 16-47 35-45 9 1 14 21 15 28m31-6c1-27 6-52 14-77l-25-30-25 30c8 25 13 51 14 77m32 5c1-8 5-26 14-27 19-2 18 54 35 45 22-11 4-66-20-70s-35 32-38 47m365 189c17-40-12-60-42-61-30 1-59 21-42 61-45-35-65 2-66 34 1 32 21 69 66 34-17 40 12 60 42 61 30-1 59-21 42-61 45 35 65-2 66-34-1-32-21-69-66-34zm-67-55zm125 49h56c1-110 18-217 78-319l-163 79-155-70c-10-29-20-58-33-85l-34-2c41 84 67 186 88 299-31-83-77-146-136-190-58-42-125-66-199-77l-50 26c182 11 321 96 373 308 60-39 136-35 175 31zM610 823v0zm3 18l1 3-1-3zm3 14l1 6-1-6zm2 10zm597 190a25 25 0 0 1 10 20 25 25 0 0 1-25 25 25 25 0 0 1-25-25 25 25 0 0 1 14-23m71-17a48 20 0 0 1-47 20 48 20 0 0 1-48-20 48 20 0 0 1 48-20 48 20 0 0 1 47 20zm-155-175c0-20 40-33 40 0 0 7-10 8-10 0 0-5-10-5-10 5 0 35 65-10 75-20 10 10 75 55 75 20 0-10-10-10-10-5 0 8-10 7-10 0 0-33 40-20 40 0 0 50-85 28-95 15-10 13-95 35-95-15zM962 539l-38-1-204 99-167-75-18 3 9 26 176 79 219-105 23-26zM331 0c45 68 75 116 97 160 187-24 341-19 491 1 18-39 46-86 101-161zm475 960h-58l6 15h51zm-254 0h-59l-1 15h53z'
            ] // <<< end King court RED
            ,
            [ /* 2,2,0 = King court_RED */
                /* 2,2,0,0 King court_red 0 Spades */
                'M1064 74c-17 9-39 18-68 25-2 27-10 49-24 67l-3 4c-66-6-135-9-206-8-10-16-17-34-21-55-10-5-20-12-27-20-7 8-17 15-27 20-4 23-12 42-24 59-57 3-117 9-180 18-7-6-13-13-18-21-8-15-13-28-17-40-15-2-29-9-42-17 40 59 65 103 86 153 186-27 339-28 491-12 14-49 29-92 80-173z M623 518c13 46 25 94 35 143l31-74c-5 5-10 8-17 8-35 0-35-55-5-55h3v-4c-3 0-7-1-11-5-7 2-17 0-30-11l-6-2zm-112 7l-10 1-18 3c-7 3-15 4-21 5-6 4-14 5-21 5l-15 3-3 1c23 84 44 169 57 255 34 22 65 36 96 44-11-109-36-215-65-317zm364 15l1 5-1-5zm1 5c1 23-40 49-55 22-49 91-82 183-100 273 30-7 62-17 99-30 19-75 50-150 95-227l-3-3c-4 0-8-2-11-4-16 13-21-9-25-31zm54 318c-10 44-15 87-17 131 61 17 114 52 155 100-17-54-25-108-20-160l1-6c-51-23-91-44-119-65zm-438 77c1 39 0 77-4 116 21-7 43-12 64-17-15-18-15-62 1-79-21-5-41-12-61-20zm619 13l3 36c-20 17-35 41-17 93 15-14 23-28 25-43l7 27c-18 21-30 47-2 97 12-16 17-31 17-45l12 31c-15 22-23 48 6 93 11-15 15-30 15-43l13 28c-12 23-18 51 17 93 9-16 11-31 10-44l14 24c-10 21-13 46 14 81l13-6c3-11 3-20 2-30l14 20 11-5-31-47c13 11 26 15 38 16v-32a71 71 0 0 0-55-11c-8-14-17-28-24-43 25 24 48 23 70 17-21-25-45-47-83-41-8-16-16-32-22-49 27 30 52 29 75 22-21-25-45-47-84-41l-23-67c12 13 24 21 35 24l5-15 8-11c-19-2-35-8-48-17l-5 1-1-6c-23-21-28-56-16-104l-13-3zm-469 27a25 20 0 0 0-25 20 25 20 0 0 0 25 20 25 20 0 0 0 25-20 25 20 0 0 0-25-20zm315 75l-10 2c-16 6-23 25-16 41a10 10 0 1 0 18-7c-3-8 1-14 5-15 5-2 11 0 14 7a10 10 0 0 0 19-1 10 10 0 0 0 0-6c-6-13-18-21-30-21zm253 26a10 10 0 0 0-5 1c-16 9-22 28-14 43 9 14 28 18 44 9a10 10 0 1 0-10-17c-8 4-14 2-16-2-3-5-2-11 6-15a10 10 0 0 0-5-19zm-187 33l-10 2c-15 6-22 25-16 41a10 10 0 1 0 19-7c-3-8 0-14 5-15 4-2 10 0 13 8a10 10 0 0 0 20-2 10 10 0 0 0-1-6c-5-13-17-21-30-21zm-105 27c10 91 31 185 59 282 22-31 35-70 35-113 0-73-38-137-94-169zm145 49l-11 2c-15 6-22 25-16 41a10 10 0 1 0 19-7c-3-8 0-14 5-15 4-2 10 0 14 8a10 10 0 0 0 19-2 10 10 0 0 0-1-6c-5-13-17-21-29-21zm81 78a329 329 0 0 1-20 164c34-11 67-24 96-36-24-38-50-82-76-128zm-64 10c-4 0-7 0-11 2-15 6-22 24-16 41a10 10 0 1 0 19-7c-3-8 0-14 5-16 4-1 11 0 14 8a10 10 0 0 0 19-2 10 10 0 0 0-1-5c-5-13-17-21-29-21zm-11 82l-11 2c-15 6-22 25-16 41a10 10 0 1 0 19-7c-3-8 0-14 5-15 4-2 11 0 14 8a10 10 0 0 0 19-2 10 10 0 0 0-1-6c-5-13-17-21-29-21zm-36 75l-10 2c-12 5-18 16-19 28l56-14c-6-10-17-16-27-16z',
                /* 2,2,1,1 King court_red 1 Hearts */
                'M667 61c-8 7-17 14-28 18-5 22-15 42-27 57-58 1-118 3-182 9-6-7-11-14-15-22-8-15-12-29-15-40-15-4-29-12-41-21 29 49 49 88 65 128 196-17 356-9 514 16 15-38 35-78 79-140-18 9-41 17-70 22a111 111 0 0 1-32 69l-204-14 203 14c-66-10-133-16-203-19-9-16-16-35-18-56-10-6-19-13-26-21zm423 284a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zm110 0a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zm-55 15a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zM747 548l-17 17 4 5c7 8 17 8 24 1l2-3 4-16zm-200 5c-13 11-29 19-46 24-16 5-32 8-49 10 19 43 36 86 50 131l112-109c-24-8-47-27-67-56zm-45 165h1-1zm191-117l-24 23 4 6c7 7 17 7 24 0 8-7 8-18 1-25l-5-4zm50 60c-4 0-8 2-11 5-7 7-7 17 0 25l4 2zm-111 0l-24 23 4 5c7 7 17 7 24 0 8-7 8-17 1-25l-5-3zm668 29h-171c52 62 112 122 171 174zm-616 30c-5 0-9 2-13 5-7 7-7 18 0 25l4 3 24-24-3-4c-3-3-8-5-12-5zm-113 0l-24 23 4 5c7 7 17 7 25 0 7-6 7-17 0-24l-5-4zm331 16c-12 4-20 15-20 28 0 17 13 30 29 30h7l-2 1c-16 0-29 13-29 30s13 30 29 30l2 1-8 1c-16 0-29 13-29 30 0 10 6 20 14 25l-10-1c-16 0-29 13-29 30 0 9 4 18 12 23 33-33 52-85 52-140 0-31-6-61-18-88zm-171 32L571 925h159c-3-52-3-104 1-157zm429 5v79l37-41c-12-14-25-26-37-38zm-537 6c-5 0-9 2-13 5-7 7-7 18 0 25l4 3 24-23-3-4c-3-4-8-6-12-6zm-61 59c-5 0-9 2-13 6-7 7-7 17 0 24l5 4 23-24a19 19 0 0 0-15-10zm678 15l-34 38 44 54v-83zm30 26v151h30V904l-30-25zm-110 50v89l40-40zm90 84l-18 17h18zm50 17h-208c1 25-4 51-22 80 30 7 53 13 70 20l-14 17c68-15 130-71 174-109zm-2 165l-48 35 33 44-28 19-14-16 3-2 8 10 23-15-30-36-48 35 31 43-30 18-13-16 3-2 8 10 24-14-28-38-49 33 28 46-30 16-12-17 3-2 7 11 25-13-26-39-51 30 28 46-30 16-12-17 3-2 7 11 25-13-26-39-49 28 8 9 37-21 12 19-3 1-7-11-25 14 26 37 52-28-30-46 31-18 12 19-3 1-7-11-25 14 26 37 52-28-30-46 30-20 13 18-3 1-7-10-24 15 28 35 49-30-31-45 29-21 14 17-3 2-8-10-23 16 30 34 47-32v-1l-33-43 29-22 4 5v-19zm1 25l-23 16 24 28v-18l-6-8 3-2 3 4v-19z',
                /* 2,2,1,2 King court_red 2 Diamons */
                'M750 71c-8 7-18 13-29 17-5 18-12 33-23 46-57-9-118-14-183-8l-1-4c-9-14-14-28-18-39-10-2-20-7-29-10 19 38 34 77 43 117 220-50 290 135 490 75-3-54 11-104 33-149l-23 4c-3 16-8 30-15 42-63 13-131 1-208-13-8-16-12-34-13-54-10-7-18-15-24-24zm550 66l-40 40 1 450c15 9 27 18 39 27zm-187 426l-7 10-59 98zm-88 26c-9 0-24 5-26 1a19 19 0 0 0 15 29c-2-4 19-23 17-28-1-2-3-2-6-2zm-279 1a19 19 0 1 0 24 0zm80 0a19 19 0 1 0 34 0zm88 0a19 19 0 1 0 33 0zm-226 46h-2l-15 10a20 20 0 1 0 17-10zm283 20a20 20 0 1 0 0 38l16-29c-3-6-10-9-16-9zm-355 20l-18 7a20 20 0 1 0 18-7zm163 14c-84 69-158 94-255 119l291 1c12-39 28-79 47-120zm-240 11l-20 6a19 19 0 1 0 20-6zm392 30a20 20 0 1 0 5 38l12-28c-3-6-10-10-17-10zm-30 80a20 20 0 1 0 7 37l9-29c-4-5-10-8-16-8zm73 13c-30 84-38 159-31 232 4 47 14 94 28 143 35-73 82-130 138-175l-6-20c-26-90-51-130-129-180zm324 122l-10 3 12 29v-27zm-98 46l-9 5 37 64 9-5zm100 62l-21 9 10 22 11-5zm-192 3l-7 6 49 55 8-7zm128 28l-32 21 14 20 30-20zm-67 50l-27 26 19 16 24-25zm-134 3l-5 8 61 42 6-8zm78 62l-18 30 22 12 17-28zm-129 33l-4 9 69 29 4-10z',
                /* 2,2,1,3 court_red 3 Clubs */
                'M330 835a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15zm0 90a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15zm-95 10a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15zm190-5a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15zm-285 15c7 4 16 9 23 15h33a125 125 0 0 1 89-157c0-8 4-15 10-20-1-7-6-27-15-28-19-2-18 54-35 45-22-11-4-66 20-70s35 34 38 48l1-1c-1-26-6-52-14-77l25-30 25 30c-8 25-13 50-14 77h1c3-15 14-51 38-47s42 59 20 70c-17 9-16-47-35-45-9 1-13 19-15 26 7 5 12 13 12 21v1a125 125 0 0 1 89 157h24V719c-67-62-156-92-258-98l-62 38v281zm460 55a20 20 0 0 1-20 20 20 20 0 0 1-20-20 20 20 0 0 1 20-20 20 20 0 0 1 20 20zm70-56a20 20 0 0 1-20 20 20 20 0 0 1-20-20 20 20 0 0 1 20-20 20 20 0 0 1 20 20zm-178 30l1 51h54a71 71 0 0 1 0-50m402-19c-40 11-72 43-85 84h-38c-10-175 7-342 153-495l96 35a487 487 0 0 0-126 376zm-80-420l55 2-204 99-168-75c5-2 9-4 12-7 21 25 51 5 51-20 10 30 15 40 40 44 28-1 56-3 77-14 16 7 34 5 43-4 29 4 64-12 69-24 9 1 18 1 25-1z M385 84c11 7 23 14 36 17 4 11 7 23 15 37l14 19c56-6 110-10 161-12 11-14 19-32 23-53 10-4 18-10 25-17 6 7 14 14 24 19 2 19 8 36 17 50 62 1 123 6 182 13l3-3c14-16 21-37 23-61 27-5 46-13 61-20-37 57-54 93-66 127-141-18-283-22-457-2-16-36-34-71-61-114z'
            ] // <<< end King court RED
            ,
            [ /* 2,2,2 = King court_BLUE */
                /* 2,2,0,0 King court_BLUE 0 Spades */
                'M799 294a11 19 0 0 0-11 19 11 19 0 0 0 11 19 11 19 0 0 0 12-19 11 19 0 0 0-12-19zm142 4a11 19 0 0 0-12 19 11 19 0 0 0 12 19 11 19 0 0 0 11-19 11 19 0 0 0-11-19zm15 125h-1c-10 0-15 12-15 12s7-8 15-8c16 0-1 33-15 33-10 0-30-25-50-25v10c20 0 36 20 50 20 23 0 41-41 16-42zm-206 0c-25 1-25 53 6 52 27-1 59-30 104-30v-10c-55 3-61 25-100 32-26 5-27-35-10-37 10-1 10 17 10 17s10-24-10-24zm-171 92l-40 7 5 18 19-5a15 15 0 1 1 8 29l-19 5 1 4 19-5a15 15 0 1 1 8 29l-20 5 1 4 20-5a15 15 0 1 1 7 29l-20 5 1 3 20-4a15 15 0 1 1 6 29l-19 5v3l20-4a15 15 0 1 1 6 29l-19 4v4l20-4a15 15 0 1 1 6 30l-20 4 1 5 20-3a15 15 0 1 1 5 30l-20 3v5l20-3a15 15 0 1 1 5 30l-20 3v4l20-3a15 15 0 1 1 4 30l-20 3 1 9 40 3c-11-117-36-228-66-335zm228 51c-3 1-6 0-10 2-5 4-10 9-12 5-6 11-14 9-17 6-7 5-7 5-14 3-43 89-72 179-88 268l28-4-6-1a15 15 0 1 1 6-30l19 4v-1l-19-5a15 15 0 1 1 7-29l19 4 1-3-19-5a15 15 0 1 1 8-29l19 5 1-3-19-6a15 15 0 1 1 9-29l19 6 1-3-18-6a15 15 0 1 1 10-29l18 7 2-4-19-7a15 15 0 1 1 11-28l19 7 1-3-18-8a15 15 0 1 1 12-28l18 8 1-3-18-8a15 15 0 1 1 13-27l18 8 17-34zm473 69v245l5-2c8 16 0 24 0 35 0 0-16 9-32 13l-13 2c-30 0-55-26-85-25l11 16c26 4 37 19 59 19l7 2 20-8v1c52-13 60 15 13 30l-8 3c45 0 44 24-6 32l-13 2v3c60-2 63 26 8 33l-3 2c49 0 50 27 2 33l-4 5c14 5 24 17 24 32 0 16-11 29-27 34 14 31 41 77 62 112V648l-20-13zm-100 44c-64 93-92 174-104 257l54 20c-12-7-20-17-20-33 0-21 15-50 40-50l29 2z M504 856l-10 19 14 6-4 8-5-3c-3-2-6 4-3 6l11 5 9-19-14-6 4-8a377 377 0 0 0 23 10l-4 11-7 17 3 1a369 369 0 0 0 37 13l2 1 6-21h-3l-15-5 3-8a275 275 0 0 0 29 8l-3 11-4 18 3 1a288 288 0 0 0 40 6h3l2-21h-3l-16-2 1-9a250 250 0 0 0 28 3h2v12l-1 18h3l19 1 20-1h3l-2-22-3 1h-15v-9a334 334 0 0 0 32-2l1 12 3 18 3-1a412 412 0 0 0 38-6l3-1-4-20h-3l-15 3-2-9a379 379 0 0 0 29-6l3 12 5 17h2a564 564 0 0 0 36-10l3-1-6-20-3 1-14 4-2-9a610 610 0 0 0 29-9l9 31 6-2-2-6-9-30-3 1a963 963 0 0 1-35 10l-2 1 5 20 3-1 14-4 3 9a689 689 0 0 1-30 8l-3-12-4-17-3 1a511 511 0 0 1-35 7h-3l4 21h3l15-3 2 9a464 464 0 0 1-32 5l-2-12-2-18-3 1a304 304 0 0 1-37 2l-3 1v21l3-1h16l1 9-17 1-15-1v-12l1-18h-9a280 280 0 0 1-30-3l-3-1-3 21 3 1 17 2-1 9a286 286 0 0 1-34-6l3-11 4-18h-3a242 242 0 0 1-34-10l-2-1-7 20 3 1 15 4-3 9a317 317 0 0 1-30-11l4-11 5-13 1-2-3-3a373 373 0 0 1-27-12zm311 4l-9 3 5 13zm105 166c-1 26 0 53 2 80 76 33 128 113 128 204 0 57-21 110-55 149l2 9a894 894 0 0 0 97-24c20-40 31-86 31-134 0-132-85-249-205-284zm45 24a35 35 0 0 1 35 35 35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35zm67 59a35 35 0 0 1 35 35 35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35zm-83 67c-5 0-11 2-15 6l-3 3 4 16 9-8 6-2c3 0 5 2 6 5s1 6-2 8l-16 14 6 30 29-12a8 8 0 0 0 1 0 7 7 0 1 1 5 13l-31 14 5 24 35-4a7 7 0 0 1 1 0c4 0 7 3 8 7 0 4-3 7-7 7a8 8 0 0 0 0 1l-34 3 5 28 27 5c5 1 7 5 7 9-1 4-5 7-9 6l-21-4 3 16 15 3c12 2 24-6 26-18 3-12-6-24-18-26l-24-5 24-3c12-1 21-11 21-23-1-11-10-21-22-21h-4l-16 2 15-7c10-4 16-15 14-25a23 23 0 0 0-31-16l-21 8 17-14c7-7 9-17 7-25a23 23 0 0 0-22-15zm16 169l-4-16h-1l4 16zm-9-44l-3-14h-3l4 15zm-8-38l-4-15-2 1 3 15zm-10-45l-3-17-1 1 3 17zm133-33a35 35 0 0 1 35 35 35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35zm17 88a35 35 0 0 1 35 35 35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35zm-11 82a35 35 0 0 1 35 35 35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35zm-35 75a35 35 0 0 1 31 20l-66 16a35 35 0 0 1 0-1 35 35 0 0 1 35-35z',
                /* 2,2,2,1 King court_BLUE 1 Hearts */
                'M603 277a10 17 0 0 0-10 17 10 17 0 0 0 10 16 10 17 0 0 0 10-16 10 17 0 0 0-10-17zm-123 1a10 17 0 0 0-10 17 10 17 0 0 0 10 17 10 17 0 0 0 10-17 10 17 0 0 0-10-17zm720 22c-16 12-38 20-55 20-16 0-33-9-44-17l1 35c35 17 51 17 87 0 3-2 7-3 11-3zM530 420c-10 10-25 13-26 14l-4 6c9-11 58-5 89-8l-9-2c-10 0-20-10-20-10s-7 10-17 10c-13 0-13-10-13-10zm59 12l16 3-5-5-11 2zm586 28c-7 30-20 60-40 90-19-26-38-52-45-85-23 34-47 52-71 60 25 54 64 110 110 165h171V547c-48-16-97-32-125-87zm-189 68l-16 28a369 369 0 0 1 113 268 369 369 0 0 1-82 235h8l4 1c22-16 38-39 57-65l20 15 2 20h38l1-289a878 878 0 0 1-145-213zm-71 27a5 5 0 0 0-4 3 5 5 0 0 0 2 6 5 5 0 0 0 7-2 5 5 0 0 0-2-7 5 5 0 0 0-3 0zm-118 8a5 5 0 0 0-5 5 5 5 0 0 0 4 5 5 5 0 0 0 6-4 5 5 0 0 0-4-5 5 5 0 0 0-1-1zm96 4a5 5 0 0 0-4 2 5 5 0 0 0 2 7 5 5 0 0 0 7-2 5 5 0 0 0-2-7 5 5 0 0 0-3 0zm-67 2a5 5 0 0 0-5 4 5 5 0 0 0 4 6 5 5 0 0 0 6-4 5 5 0 0 0-4-6 5 5 0 0 0-1 0zm-15 7l-21 57 13-13 1 21 6-20 10 18zm109 3a5 5 0 0 0-4 3 5 5 0 0 0 2 7 5 5 0 0 0 7-3 5 5 0 0 0-2-6 5 5 0 0 0-3-1zm-15 3l-35 51 16-10-4 20 11-17 5 19zm-168 28v16h12l3-16h-15zm93 51a5 5 0 0 0-5 4 5 5 0 0 0 4 6 5 5 0 0 0 6-4 5 5 0 0 0-4-6 5 5 0 0 0-1 0zm-154 8v17h17v-17h-17zm135 8a5 5 0 0 0-5 4 5 5 0 0 0 4 6 5 5 0 0 0 6-4 5 5 0 0 0-4-6 5 5 0 0 0-1 0zm29 7a5 5 0 0 0-5 4 5 5 0 0 0 4 6 5 5 0 0 0 6-4 5 5 0 0 0-4-6 5 5 0 0 0-1 0zm-16 7l-24 55 13-12 1 21 7-20 8 19zm-209 37v17h17v-16l-17-1zm148 52a5 5 0 0 0-5 5 5 5 0 0 0 4 5 5 5 0 0 0 6-4 5 5 0 0 0-4-6 5 5 0 0 0-1 0zm111 2c-11 45-17 87-19 128l1 1c4-5 9-8 15-10a43 43 0 0 1 14-48 43 43 0 0 1 0-56c-5-4-9-9-11-15zm-320 6v16h17v-16h-17zm276 2a5 5 0 0 0-5 5 5 5 0 0 0 4 5 5 5 0 0 0 6-4 5 5 0 0 0-4-6 5 5 0 0 0-1 0zm-85 8a5 5 0 0 0-4 5 5 5 0 0 0 4 5 5 5 0 0 0 6-4 5 5 0 0 0-5-6 5 5 0 0 0-1 0zm31 4a5 5 0 0 0-1 0 5 5 0 0 0-4 4 5 5 0 0 0 4 6 5 5 0 0 0 5-5 5 5 0 0 0-4-5zm37 6a5 5 0 0 0-5 5 5 5 0 0 0 4 5 5 5 0 0 0 6-4 5 5 0 0 0-5-6zm-53 2l-17 58 12-13 2 20 5-20 11 17zm83 2a5 5 0 0 0-1 0 5 5 0 0 0-4 4 5 5 0 0 0 4 6 5 5 0 0 0 6-4 5 5 0 0 0-5-6zm-16 8l-17 59 12-14 2 20 5-20 11 17zm-37 85a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5zm-15 20a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5zm30 0a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5zm-15 10l-10 60 10-15 5 20 3-21 12 16zm41 85a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5zm-70 3a5 5 0 0 0-1 0 5 5 0 0 0-4 6 5 5 0 0 0 5 4 5 5 0 0 0 4-6 5 5 0 0 0-4-4zm539 16c-44 38-106 93-175 108-14 15-33 26-55 33 25 45 24 69 20 90l-71-71a15 15 0 0 1-27-6l-63 21c21 40 47 78 76 116 109-58 212-118 295-193zm-308 154l1-1h-1v1zm-145-154a5 5 0 0 0-5 6 5 5 0 0 0 5 4 5 5 0 0 0 5-5 5 5 0 0 0-5-5zm-68 1a5 5 0 0 0-1 0 5 5 0 0 0-4 6 5 5 0 0 0 6 4 5 5 0 0 0 4-6 5 5 0 0 0-5-4zm38 1a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5zm-68 4a5 5 0 0 0-1 0 5 5 0 0 0-4 6 5 5 0 0 0 6 4 5 5 0 0 0 4-5 5 5 0 0 0-5-5zm83 5l-4 44 21-2zm-67 3v61l8-17 8 19-1-21 15 13zm153 174l-3 18-13-16 6 20-17-10 42 47zm-87 20l-4 18-11-18 4 21-17-11 39 50zm118 33a5 5 0 0 0-2 0 5 5 0 0 0-3 7 5 5 0 0 0 7 2 5 5 0 0 0 2-6 5 5 0 0 0-4-3zm-28 12a5 5 0 0 0-2 0 5 5 0 0 0-2 7 5 5 0 0 0 6 2 5 5 0 0 0 3-6 5 5 0 0 0-5-3zm-63 10a5 5 0 0 0-1 0 5 5 0 0 0-1 0 5 5 0 0 0-3 6 5 5 0 0 0 6 3 5 5 0 0 0 3-6 5 5 0 0 0-4-3zm85 2a5 5 0 0 0-2 1 5 5 0 0 0-3 6 5 5 0 0 0 7 3 5 5 0 0 0 3-7 5 5 0 0 0-5-3zm-114 8a5 5 0 0 0-1 0 5 5 0 0 0-3 6 5 5 0 0 0 6 3 5 5 0 0 0 3-6 5 5 0 0 0-5-3zm83 0l-2 18-14-15 8 19-19-8 46 44zm-62 14a5 5 0 0 0-2 0 5 5 0 0 0-3 6 5 5 0 0 0 7 3 5 5 0 0 0 3-6 5 5 0 0 0-5-3zm97 36a5 5 0 0 0-3 1 5 5 0 0 0-2 7 5 5 0 0 0 7 2 5 5 0 0 0 2-7 5 5 0 0 0-4-3zm-27 14a5 5 0 0 0-2 1 5 5 0 0 0-2 7 5 5 0 0 0 6 2 5 5 0 0 0 2-7 5 5 0 0 0-4-3zm83 7l-2 18-13-16 7 20-18-8 45 44zm-60 4a5 5 0 0 0-3 1 5 5 0 0 0-2 6 5 5 0 0 0 7 2 5 5 0 0 0 2-6 5 5 0 0 0-4-3zm-29 15l-4 18-12-17 5 20-17-10 19 24 17 5zm124 31a5 5 0 0 0-2 1 5 5 0 0 0-3 6 5 5 0 0 0 7 3 5 5 0 0 0 2-7 5 5 0 0 0-4-3zm-27 14a5 5 0 0 0-2 1 5 5 0 0 0-2 6 5 5 0 0 0 7 3 5 5 0 0 0 2-7 5 5 0 0 0-5-3zm-70 10a5 5 0 0 0-1 0 5 5 0 0 0-3 2l2 7a5 5 0 0 0 4 0 5 5 0 0 0 3-6 5 5 0 0 0-4-3 5 5 0 0 0-1 0zm93 1a5 5 0 0 0-2 0 5 5 0 0 0-3 7 5 5 0 0 0 7 2 5 5 0 0 0 2-7 5 5 0 0 0-4-2z',
                /* 2,2,2,2 King court_BLUE 2 Diamons */
                'M600 445c-40 0-85-35-85-35v-15c40 15 30 45 85 50m-75-235l-5 15 55-5c30 0 60 45 95 45-35 0-65-55-95-56-10-1-14 9-34 9-5 0-16-8-16-8zm50 73a11 20 0 0 1-12 20 11 20 0 0 1-11-20 11 20 0 0 1 11-20 11 20 0 0 1 12 20zm-86 290l134 4c20 0 52-6 73-39 8 12 22 17 36 17l-2 5-18 16c-74 66-116 80-205 102l-18-105zm311 32c0 23-19 42-42 42-30 1-35-40-49-29a42 42 0 1 1-63 43l-5 3a42 42 0 1 1-67 46 42 42 0 0 1-56 49l2 20c96-25 164-48 248-119h142c-156 297-108 529-68 765 30 1 51 10 52 41l95-33c-74-197-139-358-88-561a42 42 0 1 1 24-76l2-4a42 42 0 1 1 32-73l1-3a42 42 0 1 1 39-72l1-1 2-3a42 42 0 0 1-27-50h-4a42 42 0 1 1-81 0h-6a42 42 0 1 1-82 0c-9-1-2 7-2 15zm175-15l56 2 1-2zm24 173c94 60 137 121 166 221l18-11c-22-33 6-44 30-52-25 5-48 15-58-6-11-22 11-36 33-48-24 9-50 20-63-2s13-35 33-50c-22 12-48 30-61 12-12-17 2-36 18-56-18 17-36 36-55 19-21-16-5-35 10-55-18 17-33 34-53 20-19-12 14-33 9-47m229 229a466 466 0 0 0-210-263l-7 14c4 8 11 18-9 39-9 10-2 24 11 8 20-35 35-15 45-21-3 10 20 21-10 47-10 9-5 24 10 9 21-34 35-14 46-20-3 10 19 22-12 47-10 9-6 24 10 9 29-27 38-4 49-7-5 9 14 25-23 42-12 6-11 22 6 13 31-23 37 1 49 0-7 8 10 27-28 39-13 4-14 20 5 12 36-19 38 6 50 7-8 6 6 28-34 34-13 2-17 17 4 13zm-112 62l-2-6c-28-97-63-150-152-207l-15 38c78 50 103 90 129 180l5 21',
                /* 2,2,2,3 King court_BLUE 3 Clubs */
                'M1200 135l2 49c0 15-15 62-15 77s10 45 10 65-16 64-16 84 15 57 15 77-10 45-10 65 14 48 14 73-19 56-19 76 10 29 10 54c0 24-10 81-11 105l20-14c2-28 8-72 8-91-1-25-11-34-12-54 0-20 18-52 17-77 0-25-15-53-16-73 0-20 10-45 9-65 0-20-17-56-18-76 0-20 15-64 14-84 0-20-11-50-12-65 0-15 14-63 13-78l-3-48z M652 294a10 18 0 0 0-10 18 10 18 0 0 0 10 17 10 18 0 0 0 10-17 10 18 0 0 0-10-18zm-150 5a10 18 0 0 0-10 18 10 18 0 0 0 10 17 10 18 0 0 0 10-17 10 18 0 0 0-10-18zm48 121c-30 10-25 25-45 30l-1 1c15 0 31-19 46-21zm50 0v10c32 0 46 21 67 21v-1c-30-5-15-25-67-30zm526 179a426 426 0 0 0-127 353c50 5 91 41 105 88h33a87 87 0 0 1-32-70c0-65 45-75 55-75 11 0 20 8 26 18 3-5 14-11 32-15 67-14 61 23 21 29 37-3 39 16 19 26 22 6 14 24-10 30 31 4 17 31-17 33 17 4 29 11 29 19l-2 5h42V663l-55-20v230c16 7 30 8 30-8 0-10-10-10-10-5 0 8-10 7-10 0 0-33 40-20 40 0 0 50-85 28-95 15-4 5-22 12-41 15a122 122 0 0 1-4 0c-24 3-50-3-50-30 0-20 40-33 40 0 0 7-10 8-10 0 0-5-10-5-10 5 0 16 14 15 30 9V609zm113 328z M460 719v241h91l24-31c-22-93-62-162-115-210zm362 5a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-202 11a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm48 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm110 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-77 15a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm45 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z M53 773a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm430 10a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm144 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm155 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-112 1a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-632 0a8 8 0 0 0-8 8 8 8 0 0 0 8 7 8 8 0 0 0 7-7 8 8 0 0 0-7-8zm35 3a8 8 0 0 0-8 7 8 8 0 0 0 8 8 8 8 0 0 0 7-8 8 8 0 0 0-7-7zm-18 12l-25 75 15-15 10 30 5-30 10 15zm648 1a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm48 0a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-374 9l2 47 49 7c-11-23-29-42-51-54zm-122 0c-25 14-44 36-55 62l54-11 1-51zm268 13a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm110 13a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm43 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm109 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-76 14a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm44 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-438 2a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zm168 3a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm-171 2a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm478 23a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-112 6a10 10 0 0 0-9 6l19 5a10 10 0 0 0 0-1 10 10 0 0 0-10-10zm-140 6a12 12 0 1 1 0 25 12 12 0 0 1 0-25zm220 5a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10zm-493 0a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zm100 0a15 15 0 0 0-15 15 15 15 0 0 0 15 15 15 15 0 0 0 15-15 15 15 0 0 0-15-15zm-3 5a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm-101 0a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm450 1a10 10 0 0 0-5 1l15 10a10 10 0 0 0 0-1 10 10 0 0 0-10-10zm-385 69c-34 1-68 5-109 15a124 124 0 0 0 202-5c-34-7-64-10-93-10z'
            ] // <<< end King court BLUE
            ,
            [ /* 2,2,3 = King court_BLACK*/
                /* 2,2,0,0 King court_BLACK 0 Spades */
                'M781 207c-93 0-192 7-301 23l13 29c186-27 339-28 491-12l9-30c-69-7-139-11-212-10zm238 309l1 7c7 47-6 67-22 67l-45 1a844 844 0 0 0-123 420c-4 148 28 294 69 440 14 2 23 11 25 27 14-1 29-2 44-5-46-157-82-310-78-461 4-156 48-311 174-480l-45-16zm161 112a641 641 0 0 0-132 295l28 13c12-83 40-164 104-257z M488 798l5 38c47 27 92 42 139 44 57 3 115-11 188-36l8-34c-150 52-227 60-340-12zm569 130l-1 6c-5 52 3 106 20 160l51 76c10 33 21 67 25 98 25 45 51 87 74 125 1 1 20-6 20-6-40-64-85-140-119-217-35-79-58-161-51-234zm-57 64a3 3 0 1 0 0 6h46v-6zm-5 12a6 6 0 0 0-6 7l9 5h50l-1-12zm12 17l26 18h19l-3-18zm33 24l16 14-3-14zm235 64l-2 12h27v-12zm-9 25c-3 5-8 9-13 12h47v-12zm-8 25l6 12h36v-12zm13 25l7 12h22v-12zm14 25l7 12h8v-12z',
                /* 2,2,3,1 King court_BLACK 1 Hearts */
                'M632 181c-66 0-134 3-207 10l11 29c187-17 340-9 491 15l11-29c-99-16-198-25-306-25zm441 226l-9 18c50 23 105 24 155 3l-8-18c-45 19-93 18-138-3zm-523 98c-12 40-59 53-110 57l12 24c17-1 33-4 49-9 17-5 33-13 46-24 20 29 43 48 67 56L502 717l9 27 168-164c-31 19-90 17-129-75zm420 51l-13 22a344 344 0 0 1 101 245c0 77-23 150-67 208-18 24-42 47-68 65l69 3c0-8 7-15 16-15 3 0 6 2 8 3 33-19 53-49 74-77l-20-15c-19 26-35 49-57 65l-4-1h-8l10-13c47-63 71-141 71-222a369 369 0 0 0-112-268zm77 21l4 6h249v-6zm13 20l4 6h236v-6zm12 19l6 9h222v-9zm17 23l9 12h202v-12zm18 24l12 15h181v-15zm-373 67L551 909l5 30 175-171zm516 132v168h20V880zm-680 98l-10 10 5 35h171l-4-43-2-2-20 20-20-20-20 20-20-20-20 20-20-20-20 20zm521 89l-1 12h184l14-12zm-3 22l-3 9h166l11-9zm-6 16l-3 6h155l7-6zm218 50c-83 75-186 135-295 193l19 24c99-53 195-108 276-177z',
                /* 2,2,3,2 King court_BLACK 2 Diamons */
                'M1085 560l-59 98c-188 314-98 498-9 763l23-10-58-175a521 521 0 0 1 318-292v-26a560 560 0 0 0-329 282l1 3-2-5a615 615 0 0 1 77-527l59-98-30 50a540 540 0 0 1 224 263V654c-52-39-131-81-188-91zm-865 65c-38 17-51 40-50 66-13 0-28 5-44 20 3-9 4-20 4-31-38 17-51 40-50 66-9 1-19 4-29 12 3-10 4-22 4-33-39 17-51 40-50 66l-5 1v14l22-1-22 6v14c15 0 32-6 51-21-11-6-23-11-35-13 13-5 22-11 28-19 22 12 48 12 80-13-11-6-21-11-33-13 20-7 29-18 34-31 23 14 50 15 84-11-10-5-19-10-30-12 18-6 28-15 33-26 23 13 49 13 82-12-24-12-48-24-78 3 3-10 4-21 4-32zm-15 25c-9 19-14 24-31 41h-2c14-21 19-27 33-41zm52 5h8c-19 6-27 8-52 9l1-2c20-5 28-7 43-7zm-85 50h8c-20 6-27 8-55 9l1-1c22-6 30-8 46-8zm-57 0c-9 18-14 24-31 41h-1c13-21 18-27 32-41zm-75 45c-9 19-14 24-31 41H7c13-21 19-27 33-41zm47 10h8c-19 5-26 7-49 9l1-2c18-5 26-7 40-7zm436 50l5 105h260l27-105zm468 72l-3 9a491 491 0 0 0-7 197l2 14 8-11c22-29 45-54 70-77l3-2-1-4c-17-59-30-90-65-120zm7 22c26 25 38 52 53 104-22 19-42 41-60 64a523 523 0 0 1 7-168z',
                /* 2,2,3,3 King court_BLACK 3 Clubs */
                'M673 185c-71 0-145 4-227 14l11 26c166-19 302-15 437 3l9-27c-75-10-150-16-230-16z M401 543c-52 12-101 29-149 52 74 11 141 35 199 77 59 44 105 107 136 190-21-113-47-215-88-299l-74-8zm538 22L720 670l-176-79 22 59 155 70 164-79zm162 25a454 454 0 0 0-127 361l25 1c-7-130 17-240 127-353zm144 52v188l55-18V663z M140 659l-40 29v212c14 0 25 11 25 25 0 5-1 10-4 13 5 1 12 4 19 8v-6zm910 128c-4 0-4 6 0 6h75c4 0 4-6 0-6zm-27 25l-2 6h119v-6zm-5 24l-1 9h77l8-9zm-3 25v9h76l-1-9zm-1 25l-1 18h99l-14-18zm-1 31v6h87l3-6zm0 20l15 6h65l1-6zm45 20l9 6h23l1-6zm25 20l6 6h2l-1-6zm-725 7a3 3 0 0 0-2 0c-11 8-25 12-40 12-14 0-26-3-37-10a3 3 0 1 0-3 6 84 84 0 0 0 84-3 3 3 0 0 0-2-5zm33 3a3 3 0 0 0-2 1 97 97 0 0 1-73 33c-28 0-52-11-70-29a3 3 0 1 0-4 4 103 103 0 0 0 151-4 3 3 0 0 0-2-5z'
            ] // <<< end King court BLACK
            ,
            [ /* 2,2,4 = King court_BLUE_DETAIL */
                /* 2,2,0,0 King court_BLUE_DETAIL 0 Spades */
                'M1112 709c-15 29-58-21-94-10m41-68c7 37 71 52 53 78-34 4-57-19-79-46 35 4 67 12 79 46m-53-78c-6 12-12 25-1 35m-40 33c5-18 16-20 30-17m107-47c-16 28-57-23-94-14m44-66c6 37 69 54 50 80-34 3-56-21-77-49 35 5 66 15 77 49m-50-80c-6 12-13 24-2 35m-42 31c7-17 18-19 32-16m-14 172c-11 31-61-11-95 6m29-74c13 35 79 39 66 68-33 10-60-9-86-32 35-2 68 1 86 32m-66-68c-3 13-7 26 5 35m-34 39c3-18 13-22 28-22m36 94c-9 31-61-8-94 10m26-75c15 34 80 35 68 65-32 11-60-6-87-29 35-3 68-2 87 29m-68-65c-3 13-7 26 6 34m-32 41c2-19 13-22 27-23m129-136l5-7m-7 11l2-4m-6 11l4-7m-28 56c7-16 15-33 24-49m-28 57l4-8m-6 13l2-5m-6 13l4-8m-25 68l21-60m-23 67l2-7m-2 8v-1m-1 6l1-5m-13 62l12-57m-61 1l-7 28m32-110l-11 32m46-111l-14 30m60-106l-19 30m65-94l-8 10-9 12m-14 102l27-42m-64 112l19-37m-49 115l15-44m-34 122l9-43m-67-39l-11 44m12-46l-1 2m117-240c-57 82-94 161-116 238m117-240l-1 2m29-39l-3 3-25 34m63 16l10-13 12-17m-70 102c7-12 15-25 24-37m-63 109l17-35m-48 114l14-40m-33 119l8-38m-45-5l-4 20m10-44l-1 6m7-24l-2 6m15-45l-7 20m17-46l-3 8m10-26l-3 8m22-46l-11 21m23-44l-3 6m13-24l-4 8m27-45l-13 21m27-41l-3 4m13-19l-2 4m26-35l-6 7-6 9m20 22l10-13 10-13m-68 99l22-35m-62 108l17-33m-48 113l13-36m-33 114l7-33 M458 188c210-32 382-32 552-14m-517 85c186-27 339-28 491-12m-504-17c194-29 355-29 513-13 M333 0c88 120 127 183 160 259 M1113 1a739 739 0 0 0-129 246m-182-85c-19-18-31-42-32-77-40-7-49-42-55-80-6 38-15 73-55 80-1 40-17 66-41 84m45-3c12-17 20-36 24-59 10-5 20-12 27-20 7 8 17 15 27 20 4 21 11 39 22 55m-236 16c-43-18-43-52-58-83-41 3-92-52-135-95m72 105c13 9 27 16 42 18 4 12 9 25 17 40 5 8 11 15 18 21m438-18c31-13 48-41 43-91 97-17 106-49 147-75 M968 170l4-4c14-18 22-40 24-67 29-7 51-16 68-25 M875 0c-10 75-79 70-83 120-3 45 67 50 70 5 2-31-38-33-40-3-1 15 24 17 25 2 M875 0c0 75 70 80 67 130-3 45-73 40-70-5 2-30 42-27 40 3-1 15-26 13-25-2 M560 13c4 75-58 82-52 132 4 45 66 38 61-7-3-30-38-26-35 4 2 15 24 12 22-2m4-127c12 74 74 68 79 117 6 45-56 52-61 7-3-30 32-34 35-4 2 15-20 18-22 3m237 674c-150 52-227 60-340-12m11 108c42 20 85 32 129 34 60 3 117-9 180-29m-315-75c47 27 92 42 139 44 57 3 115-11 188-36m-81 117c22-5 43-10 65-17m-304-4c20 8 40 15 61 20m84-110c-11-116-36-227-66-333m149 75c-31 66-54 133-70 199m94-205c-42 88-70 177-86 264m141-284c-49 94-81 187-99 278m121-277c-49 91-82 183-100 273m-70-50c-13-95-35-186-59-274m5 331c-11-113-37-221-66-325m45 320c-11-109-36-215-65-318m479 944c-47-157-82-308-78-455 4-153 46-303 173-470m-125 930c-46-157-82-310-78-461 4-156 48-311 174-480m-141 51c-178 304-133 592-54 873m30-5c-41-146-73-292-69-440 4-137 37-276 123-420m-15 273c41 29 104 60 193 93m-16-258c17-30 38-60 62-92l3-4m-27 10l12-15 14-19m-103 357c12-83 40-164 104-257m-132 244c14-94 51-187 132-295m-160-112c55 19 109 40 160 63 M0 645c78-53 250-114 377-124m549 620c56 32 94 96 94 169 0 43-13 82-35 114m10 35a229 229 0 0 0-73-353m210 326c15-38 23-79 23-122 0-147-97-279-234-315m173 449c20-40 31-86 31-134 0-132-85-249-205-284m156-90c5 166 90 322 169 450m-7-245c15 32 43 81 64 117m-627-258a25 20 0 0 0-25-20 25 20 0 0 0-25 20 25 20 0 0 0 25 20 25 20 0 0 0 25-20v0m20 30c75 75 75-135 0-60m30 60s5-5 5-10-5-10-5-20 5-15 5-20-5-10-5-10m-120 60c-75 75-75-135 0-60m-30 60s-5-5-5-10 5-10 5-20-5-15-5-20 5-10 5-10m45 20c-65-65 125-65 60 0m-60-30s5-5 10-5 10 5 20 5 15-5 20-5 10 5 10 5m-60 50c-65 65 125 65 60 0m-60 30s5 5 10 5 10-5 20-5 15 5 20 5 10-5 10-5m-87-80h14m-14 80h14m-107-80h61m-61 20h51m-51 20h49m-50 20h52m-54 20h64m579-107c-5-5-12-28 15-30 30-1 55 25 85 25 17 0 45-15 45-15 0-11 8-19 0-35-25 10-93-5-135-5-25 0-40 29-40 50 0 45 61 40 63 17 2-12-18-37-18-37m-23 52c-19 77 5 119 70 127m8-109c-29-1-25-10-25-10 2 30-9 47-25 60m6-104c26 4 37 19 59 19l7 2m-6 29c-20-4-13-25 17-34v0c60-18 72 12 22 28l-9 3m-25 2c70-11 79 21 20 30-71 12-71-23-20-30v0m-4 36c71-6 78 25 19 32-72 8-70-27-19-32v0m1 35c63-6 69 25 17 32-64 8-63-27-17-32v0m37 69a38 35 0 0 1-37 35 38 35 0 0 1-38-35 38 35 0 0 1 38-35 38 35 0 0 1 37 35v0m-85-233V183l50-50 50 50v697m-280 205a35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35 35 35 0 0 1 35 35v0m67 59a35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35 35 35 0 0 1 35 35v0m39 76a35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35 35 35 0 0 1 35 35v0m17 88a35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35 35 35 0 0 1 35 35v0m-11 82a35 35 0 0 1-35 35 35 35 0 0 1-35-35 35 35 0 0 1 35-35 35 35 0 0 1 35 35v0m-105 76a35 35 0 0 1 0-1 35 35 0 0 1 35-35 35 35 0 0 1 31 20m171-569l-6-37c0-15 14-36 14-46-1-10-22-39-23-54 0-15 13-71 12-86s-17-54-18-69c0-15 18-56 17-76s-18-74-18-89c-1-15 18-46 17-66s-17-49-18-64c0-15 4-35 4-45-1-10-7-35-7-45-1-10 12-71 12-71m9 747c-1-6-5-25-5-37-1-15 13-35 13-45s-21-40-22-55c0-14 13-70 12-85 0-15-16-54-17-69 0-15 18-56 18-76-1-20-18-74-18-89-1-15 18-46 17-66 0-20-16-50-17-65 0-15 4-35 4-45s-6-35-7-45c0-10 13-70 13-70m50 502l20 13m-86 230c-1-8-4-24-4-35 0-15 15-35 15-45s-20-40-20-55 15-70 15-85-15-55-15-70 20-55 20-75-15-75-15-90 20-45 20-65-15-50-15-65 5-35 5-45-5-35-5-45 15-70 15-70m4 747c-1-6-5-25-5-37 0-15 14-35 14-45-1-10-21-39-22-54 0-15 13-71 13-86s-16-54-17-69c0-15 19-56 18-76 0-20-17-75-17-90-1-15 19-45 18-65s-16-50-17-65c0-15 4-35 4-45s-6-35-6-45 13-70 13-70m-78 1135c25 45 51 88 75 127m-151-301c-17-54-25-108-20-160l1-6 M499 258c-82 153-26 165-59 242-15 35-50 20-41-4 13-35 36-21 31-1-2 8-15 13-20 10m105-249c-84 155-30 165-60 244-25 65-65 20-56-4m133-242c-87 157-32 167-62 246-25 65-111 67-90 0 25-80 72-58 67-23m101-225c-88 159-33 169-63 248-11 28-32 41-51 42m130-292c-89 161-33 170-64 250-11 28-32 40-51 39m131-291c-91 163-34 172-65 252-9 24-28 34-46 33m127-286c-92 164-35 173-66 253-8 22-23 30-39 29m120-284c-93 165-35 175-66 255-8 22-22 28-37 25m119-281c-94 166-36 175-67 256-7 19-20 26-33 23m116-281c-95 168-37 177-68 258-7 18-19 24-31 21m115-280c-96 169-38 178-69 259-7 17-18 21-30 17m114-277c-97 170-38 179-69 260-6 15-15 19-26 16m111-277c-98 171-39 180-70 261-6 15-15 18-26 14m111-275c-98 171-39 180-70 261-5 12-12 15-22 12m107-2s-5 85-40 85-35-55-5-55 20 35 0 35c-10 0-6-15 5-15m53-44c-5 45-12 97-41 76m54-71c-3 42-5 80-28 68m41-62c-5 35-1 70-22 59m36-53c-5 35 1 59-20 47m33-42c-4 27 3 52-18 40m31-34c-4 21 1 36-16 30m29-25c-8 23-2 18-16 19m29-13c-5 6-3 12-19 12 M660 467c1 18-6 54-38 46m50-37c6 22-1 65-50 37m62-29c4 24-7 69-47 36m59-27c-1 12-4 58-29 38m41-30c0 18-12 72-24 72m141-18c10 47 67 11 58-15m67-23c3 78 85 112 70 6-11-74-63-44-52 6 6 28 42 50 37 6-4-48-21-35-21-21 1 16 5 20 12 25m-59-17c9 50 22 80 58 68m-72-64c9 56 20 69 46 65m-59-60c5 36 0 58 34 56m-48-52c4 26 6 43 24 45m-37-40c5 23 8 50 26 36m71-331s10 30 10 40-5 23-5 28 4 62 3 72c-3 25-19 100-22 125m19-265c0 20 60 43 62 80 2 65-43 38-61 18m1-73s41 35 43 55c3 33-31 18-44 9m4-41s23 11 25 27c3 25-19 15-29 9m2-26c7 2 12 17 12 17 1 11-8 5-15 2m2 22c1 36 68 61 68 106 0 65-46 42-48 38m-19-108c2 13 52 45 52 75 0 40-32 36-35 30m-19-84c0 10 39 34 39 54 0 27-27 24-32 24m-10-59c2 10 27 20 27 38 0 27-35 8-35 7m5-30c4 7 13 10 13 20 0 19-16 6-17 1 M715 295s45-35 65-35 55 10 60 10c10 0 10-10 10-10l5 5s-8 10-15 10-45-10-60-10c-13 0-65 30-65 30v0m265-20s-25-15-35-15-30 13-35 12c-6 0-10-2-15-12l-5 5s10 10 20 10 30-10 35-10 35 10 35 10v0m-90-10v20c0 5-5 10-5 15s30 100 30 105-15 20-20 20c-10 0-16-14-23-14-8 0-22 9-27 9-16 0-16-25 0-25 5 0 10 5 10 5m5 35c-55 3-61 25-100 32-26 5-27-35-10-37 10-1 10 17 10 17s10-24-10-24c-25 1-25 53 6 52 27-1 59-30 104-30v-10 0m30 0v10c20 0 36 20 50 20 23 0 42-42 15-42-10 0-15 12-15 12s7-8 15-8c16 0-1 33-15 33-10 0-30-25-50-25v0m-80 50v7l5-4-5-3v0m110-5v8l-5-3 5-5v0m-105 8c10 2 22-13 35-13 12 0 9 5 19 5s10-8 20-8 16 13 26 13m-75 30c30 16 50-10 50-20 M725 325c25 0 42-28 67-28 30 0 38 23 48 23-10 0-37 12-50 12-15-1-50-7-65-7v0m166-8c25 0 22-17 48-18 25 0 32 18 42 18-10 0-28 16-42 15-15 0-33-15-48-15v0',
                /* 2,2,4,1 King court_BLUE_DETAIL 1 Hearts */
                'M521 0c16 53 66 55 68 100 3 45-59 48-61 3-2-30 33-32 35-2 1 15-21 16-22 1M514 0c-10 55-59 62-57 107s64 42 62-3c-2-31-37-28-36 2 1 15 23 13 22-2M832 0c7 59 65 70 59 116-5 44-74 36-69-9 3-30 43-25 40 5-2 15-27 12-25-3M827 0c-21 55-79 53-85 98-5 45 65 53 70 8 4-30-36-34-40-5-1 15 23 18 25 3m118 53l4-4c16-16 25-39 28-65 29-5 52-13 70-22m-148 85c32-12 51-38 48-89 92-11 108-39 144-62M359 62c12 9 26 17 41 21 3 11 7 25 15 40 4 8 9 15 16 22m45-4c-42-20-41-54-54-86-27 1-58-24-87-55m277 136c12-15 22-34 27-57 11-4 20-11 28-18 7 8 16 15 26 21 2 21 9 40 19 56M666 0c-8 29-21 52-54 56-3 40-20 65-45 81m183 3c-18-18-29-43-28-78-32-8-43-32-48-62m391 1a728 728 0 0 0-138 234M321 0c60 95 91 153 115 220m-11-29c195-18 355-10 513 15m-502 14c187-17 340-9 491 15m-522-88c211-20 383-11 552 16m-78 930c-49-165-27-351 107-565 58 132 192 272 314 376m-193 542a993 993 0 0 1-178-233M0 674c108-87 238-145 369-202m395 80c-77 322-24 630 95 886M511 744l168-164m-66 29L502 718m17 53l228-223M558 950h173m-180-41l183-179m5-39L545 880m11 59l175-171m-1 157H571M385 505c-10 0-19 29 5 30 19 1 40-45 0-45-45 0-40 74 10 74 65 0 135-9 150-59 55 130 150 80 150 45 0-28-35-30-40-15-7 21 10 30 25 15M560 970l10-10 20 20 20-20 20 20 20-20 20 20 20-20 20 20 20-20 2 2M589 702a43 43 0 0 1 5 4 43 43 0 0 1-1 60 43 43 0 0 1-60 0 43 43 0 0 1-4-5m182-177a43 43 0 0 1 5 4 43 43 0 0 1-1 60 43 43 0 0 1-60-1 43 43 0 0 1-4-5m-1 1a43 43 0 0 1 5 4 43 43 0 0 1-1 60 43 43 0 0 1-60-1 43 43 0 0 1-4-4m-61 60a43 43 0 0 1 4 4 43 43 0 0 1 0 59m0 0a43 43 0 0 1 59 2 43 43 0 0 1 4 4m0-1a43 43 0 0 1-4-3 43 43 0 0 1 1-61 43 43 0 0 1 60 1 43 43 0 0 1 3 4m98-171a43 43 0 0 1-38-12 43 43 0 0 1-4-5m6 128a43 43 0 0 1-4-3 43 43 0 0 1 1-60 43 43 0 0 1 32-12m-90 135a43 43 0 0 1-4-4 43 43 0 0 1 1-60 43 43 0 0 1 60 1 43 43 0 0 1 3 4m-21-149l25-25m-269 49c17-2 33-5 49-10 17-5 33-13 46-24 20 29 43 48 67 56m335-86c49 16 96 7 141-58 7 33 26 59 45 85 20-30 33-60 40-90 28 55 77 71 125 87m0 317c-111-99-228-226-281-339M893 717a133 176 0 0 1 27 107v0a133 176 0 0 1-64 151m3 25c15-10 29-23 40-38 27-36 44-85 44-138 0-51-15-98-40-133m-25 401c37-17 69-45 93-76 40-54 62-121 62-192a318 318 0 0 0-89-223m-21 495c26-18 50-41 68-65 44-58 67-131 67-207a344 344 0 0 0-101-246m44 481l10-13c47-63 72-141 72-222a369 369 0 0 0-113-268m193-158l-12 57c-4 16-10 32-18 48-9-14-15-28-18-43l-12-58-34 49c-18 26-35 40-50 48m242 7c-27-12-48-27-64-57l-26-52M986 530c52-40 73-94 97-146m117-49a25 25 0 0 0-11 3c-36 17-52 17-88 0a25 25 0 1 0-22 44c44 23 88 23 132 0a25 25 0 0 0-11-47v0m2 51c26 73 57 131 98 158m0 744c-63 54-136 97-214 136m214-247c-81 69-177 124-276 177m276-217c-83 75-186 135-295 193m87-300h208m-140-101l40 49-40 40m0-89v0m90 16l-44-54 34-38m-43-41l-37 41m72 177l18-18m-120-271v289m30-256v256m58-197l-51 57 73 90-50 50m60-168v168m20-150v150m-141-340h171m-292 394a15 15 0 0 0-15 19c9 39 9 54 0 82a15 15 0 1 0 28 9c11-32 11-57 1-98a15 15 0 0 0-14-12v0m11 115l71 71c4-21 5-45-20-90 29-10 53-26 70-50-17-7-40-13-70-20 23-37 25-69 20-100-21 28-41 58-74 77m285-49c-45 38-107 94-176 109m-133-47c-28-2-117-8-142-8-55 0-79 28-10 28m250-110l-20-15c-19 26-35 49-57 65l-4-1h-8m-101 116c-40 0-60 5-80 5-30 0-40 25-10 25h83m-3-60c-5 0-60 5-80 5s-45 25 0 30m75-60h-45c-40 0-75 25-35 30m188 42l-83 28c-15 5-25 10-36 16-27 15-34-11-19-21s25-10 25-10m144-97l3-2c12-7 23-15 32-24l-8 16-17 27 31 7 34 8c-10 8-22 14-36 19l-26 8 13 24 8 16-23-24-9-6m75-874l3 36m96-39v35m-115-230c0 85 40 215-25 215-35 0-38-49-13-47 18 2 18 22 8 27 26-21 28-52 0-95 20-14 5-75 5-95 0-45 60-35 60-10s-30 25-35 5v0m7 191c10 9 32 24 53 24 30 0 75-25 75-50 0-12-4-24-9-33m-122-73c3-2 8-4 16-4 25 0 35 15 40 15 18 0 24 24-5 25-20 0-30-20-30-20 6 14 17 29 5 40 35 7 45 30 45 60m-40-118v-12m29 49c-6 38-23 36-28-6m-21-33c2-12 8-19 20-25 21-11 29 21 30 41m-10-36c40-34 38 72 35 80-8 20-26 27-30-6m22-71c24-21 40 17 36 51-7 44-28 62-31 31m24-77c22-14 37 22 31 54-8 46-31 49-27 7m28-24h2c11 0 20 13 20 30v0c0 17-9 30-20 30-6 0-11-4-15-11m80-19a23 25 0 0 1-22 25 23 25 0 0 1-23-25 23 25 0 0 1 23-25 23 25 0 0 1 22 25v0m-342-45h112m-151 85h161m75-20c14 8 26 18 30 35M918 855a29 30 0 0 1-2 0 29 30 0 0 1-29-30 29 30 0 0 1 29-30 29 30 0 0 1 2 0m0-2a29 30 0 0 1-7 1 29 30 0 0 1-29-30 29 30 0 0 1 20-28m-1 179a29 30 0 0 1-20-28 29 30 0 0 1 29-30 29 30 0 0 1 7 1m-50 106a29 30 0 0 1-11-23 29 30 0 0 1 29-30 29 30 0 0 1 16 4m-44 56l1 2m16-191c2 6 6 11 11 15a43 43 0 0 0 0 56 43 43 0 0 0-14 48c-6 2-11 5-15 10m41-187l-8 4M735 485c0-35-35-35-35 5s55 20 55-15c0-50-75-40-75 10 0 64 114 78 179 73s130-48 130-113c1-91-65-128-81-213M707 530c49 2 68-20 68-66 1-75-65-84-59-251m5 325s0 0 0 0m217-7c23-21 36-55 36-86 1-92-65-129-80-215m34 307c21-22 31-62 31-92 1-92-65-129-79-217m30 318c23-22 34-70 34-101 1-93-65-130-78-219m28 326c23-23 34-75 35-107 0-94-64-130-77-220m29 330c22-24 32-79 33-110 0-94-64-131-76-222m25 335c24-22 35-81 35-113 1-95-63-131-74-224m22 338c26-21 37-81 37-114 1-95-62-131-72-225m20 339c25-21 37-81 37-114 1-95-61-132-71-226m20 340c25-21 36-81 36-114 1-96-61-132-70-227m20 340c24-22 35-81 35-113 1-96-60-132-69-228m20 339c23-23 37-80 34-111-8-95-63-120-68-230m14 338c27-21 42-72 39-108-8-85-63-90-66-230m5 333c34-16 49-62 47-92-4-91-64-81-66-242m26 270c3-19 5-22 4-33-5-67-67-44-58-238m-15 337c-25 35-75 8-100-45m75 46c-22-7-43-25-55-51m116 38c-5 8-13 13-21 16m-38-22c-17-7-32-21-42-42m87 40c-27 1-56-16-72-50m51 29c-14-7-27-20-36-39m30 12c-7-6-13-14-18-24m24 5c-4-5-8-11-11-18m26 3c-4-5-8-11-11-18m30 13c-6-7-11-14-15-23M385 535c49 8 64-29 64-70 0-43-24-85-14-125m-42 223c48 8 69-55 69-97s-27-66-27-126m5 222c23-15 34-52 36-81m-15 79c18-17 27-49 29-75m-6 71c13-18 20-44 21-66m2 58c8-16 12-36 13-53m8 41c4-12 6-25 7-36M435 340s6 80 5 105c-2 39-75 78-75 0 0-50 60-45 60-5s-45 30-45 5 35-20 35 0m10-97c-2 18-9 27-8 40 1 8 8 27 8 52m23-223c-5 14-13 42-13 53 0 15 5 25 5 50 0 40-70 55-70 0 0-45 60-55 60-15s-40 30-40 10 25-20 25-5m22-91c-6 11-12 26-12 38 0 20 5 48 5 48m5-40s15-20 35-20 30 10 40 10c5 0 15-10 15-10v10c-5 0-10 5-15 5s-30-15-35-15m195 15s-35-20-45-20c-15 0-35 10-45 10s-25-5-25-5v5c8 0 20 5 25 5s30-15 45-15m-100 15s10 25 10 30-20 50-20 60-10 35-10 40 15 15 20 15 20-10 30-15c4-2 10 10-30 15m40-35c25 0 29 24 11 31-6 2-16-2-18-9m-53 38l-10 20 10-10v-10 0m100 0l5 20-10-15 5-5v0m-105 15l4-6c1-1 16-4 26-14 0 0 0 10 13 10 10 0 17-10 17-10s10 10 20 10l25 5-5-5c-28 7-90-3-100 10v0m30 10c17 17 30 15 45 0M440 295c20 0 30-16 40-16 20 1 25 16 35 16-5 0-15 15-40 15-15 0-15-15-35-15v0m205 0c-20 0-30-16-40-16-20 1-25 16-35 16 5 0 15 15 40 15 15 0 15-15 35-15v0m375-110l-25 30 30 25m-49-25h19m-35 25l35-55v55',
                /* 2,2,4,2 King court_BLUE_DETAIL 2 Diamons */
                'M1205 261v98m-15-107v116m-15-18v30m0-90v40m0-90v30m-15 98v28m0-98v24m0-98v28m-15 54v8 M520 779c96-25 164-48 248-119h142c-156 297-108 529-68 765 M526 808c95-24 169-49 253-118h83c-132 282-90 513-51 736m178 7c-100-265-182-466 11-790l32-53H742l-10 9c-79 69-128 86-220 109m505 713c-89-265-179-449 9-763l59-98H730l-18 16c-74 66-116 80-205 103 M426 0c37 62 69 123 84 190 220-50 290 135 490 75-6-108 56-198 112-265 M615 0c16 41 56 50 55 90 0 45-61 44-60-1 0-30 35-29 34 1 0 15-21 14-21-1 M599 0c-18 41-57 48-58 88-1 45 60 46 60 1 1-30-34-30-34 0 0 15 21 15 21 0 M910 3c-4 75 64 84 58 134-5 44-73 36-68-9 4-30 42-25 39 5-2 15-26 12-24-3 M910 3c-14 74-81 66-87 115-6 45 62 54 67 9 4-30-35-35-38-5-2 15 22 18 24 3m-384 4c218-29 388 71 524 28m-21 5c7-12 12-26 15-42l23-3m-82 50c20-13 31-37 32-75 31-1 53-5 70-11 M467 71c9 5 19 10 29 12 4 11 9 25 18 39l2 4m37-2c-22-19-25-45-36-70-25 2-55-19-84-46m266 126c10-13 17-28 22-46 11-4 21-10 29-17 6 9 14 17 24 24 1 20 5 38 13 54 M757 0c-10 33-24 61-60 63-5 30-16 51-33 66m161 26a99 99 0 0 1-21-79c-35-11-42-41-44-76 M0 733c161-106 274-156 406-201m679 28c58 0 155 48 215 94m-239-5a501 501 0 0 1 221 276m-237-251a466 466 0 0 1 210 263m45-51a539 539 0 0 0-224-263m-77 140c94 60 137 121 166 221 M989 786c89 57 124 110 152 207l2 6 M974 824c78 50 103 90 129 180l5 21m-63 257l4-10a421 421 0 0 1 251-246m-146 202c36-56 82-91 146-121m-187 142c43-84 102-131 187-169m-222 187a386 386 0 0 1 222-214m-329 147a560 560 0 0 1 329-282m-318 319a521 521 0 0 1 318-293m-298 356c108-44 210-98 298-168m-330 66a615 615 0 0 1 77-527l59-98 7-10m-73 848l-59-174 M523 810h292 M528 915h260m-261 25h257m329 260l21 14m8-53l19 16m8-42l16 17m19-46l14 20m18-41l12 21m31-43l10 22m-194 145l22 12m103-638V160l80-80m-40 547V177l40-40m-80 216c-41 13-73 53-100 107-1-40-8-82 20-115-16-9-31-9-50-35 19-26 34-26 50-35-28-33-21-75-20-115 27 54 59 94 100 107m-72 144l1-9c1-16 4-27 14-37l24-29-33-18-19-8 19-8 33-18-24-29c-10-10-13-21-14-37l-1-9m-28-49c-80 117-52 211 0 300 M709 618a42 42 0 0 1 21 37v0a42 42 0 0 1-42 42 42 42 0 0 1-42-36m40-25a20 20 0 0 1 2 0 20 20 0 0 1 20 19 20 20 0 0 1-20 20 20 20 0 0 1-19-20 20 20 0 0 1 2-9m126-56a42 42 0 0 1 3 15 42 42 0 0 1-42 42 42 42 0 0 1-41-35m53-22a20 20 0 0 1 8 15 20 20 0 0 1-20 20 20 20 0 0 1-19-20 20 20 0 0 1 7-15m138 0a42 42 0 0 1 1 10 42 42 0 0 1-42 42 42 42 0 0 1-42-42 42 42 0 0 1 1-10m58 0a20 20 0 0 1 3 10 20 20 0 0 1-20 20 20 20 0 0 1-19-20 20 20 0 0 1 2-10m145 0a42 42 0 0 1 2 10 42 42 0 0 1-42 42 42 42 0 0 1-42-42 42 42 0 0 1 1-10m57 0a20 20 0 0 1 3 10 20 20 0 0 1-19 20 20 20 0 0 1-20-20 20 20 0 0 1 3-10m88 50a42 42 0 0 1-28-40 42 42 0 0 1 1-10m39 29a20 20 0 0 1-18-19 20 20 0 0 1 3-10m-39 126a42 42 0 0 1-31-41 42 42 0 0 1 42-42 42 42 0 0 1 28 11m-28 50a20 20 0 0 1 0 1 20 20 0 0 1-20-20 20 20 0 0 1 20-19 20 20 0 0 1 16 9m-60 127a42 42 0 0 1-38-42 42 42 0 0 1 42-42 42 42 0 0 1 28 11m-23 50a20 20 0 0 1-5 1 20 20 0 0 1-20-20 20 20 0 0 1 20-19 20 20 0 0 1 17 10m-47 131a42 42 0 0 1 0 0 42 42 0 0 1-42-42 42 42 0 0 1 42-42 42 42 0 0 1 24 8m-17 52a20 20 0 0 1-7 2 20 20 0 0 1-20-20 20 20 0 0 1 20-19 20 20 0 0 1 16 8 M641 664a42 42 0 0 1 14 31 42 42 0 0 1-42 42 42 42 0 0 1-42-42 42 42 0 0 1 0-3m45-16a20 20 0 0 1 17 19 20 20 0 0 1-20 20 20 20 0 0 1-19-20 20 20 0 0 1 4-12m-32 11a42 42 0 0 1 9 26 42 42 0 0 1-42 42 42 42 0 0 1-15-3m21-58a20 20 0 0 1 14 19 20 20 0 0 1-20 20 20 20 0 0 1-19-20 20 20 0 0 1 5-13m276-461c-53 132 5 176 5 254 0 55-115 90-115 0 0-55 75-55 75-10 0 35-63 45-60 10 3-39 47-19 35-5m48-254c-58 135-3 172-3 251 0 55-85 58-80 8m70-265c-62 140-10 175-10 255m48-238c-50 127 7 171 7 248 0 31-36 55-68 55m74-298c-46 123 9 167 9 243 0 31-36 55-68 55m72-293c-43 119 11 163 11 238 0 31-36 55-68 55m71-289c-41 116 12 160 12 234 0 31-36 55-68 55m69-285c-37 113 14 157 14 230 0 31-36 55-68 55m68-282c-35 111 15 155 15 227 0 31-36 55-68 55m68-280c-35 110 15 153 15 225 0 31-36 55-68 55m67-278c-33 108 16 151 16 223 0 31-36 55-68 55m67-278c-33 108 16 152 16 223 0 31-36 55-68 55m67-278c-33 108 16 152 16 223 0 31-36 55-68 55m68-279c-35 109 15 152 15 224 0 31-36 55-68 55m68-282c-35 111 15 155 15 227 0 31-36 55-68 55m69-285c-37 114 14 157 14 230 0 31-36 55-68 55m71-289c-41 116 12 160 12 234 0 31-36 55-68 55m-422-22c-54 66-115 47-115 7s65-45 65-5c0 30-45 25-45 5 0-10 0-10 5-15m70 9c-25 27-49 32-67 19m107-21a82 82 0 0 1-79 45m99-43c-20 40-56 43-77 43m97-42c-20 40-56 42-77 42m97-44c-20 40-56 44-77 44m97-45a80 80 0 0 1-77 45m97-46a81 81 0 0 1-77 46m97-46a80 80 0 0 1-77 46m97-47a81 81 0 0 1-77 47m93-39a81 81 0 0 1-73 39 M518 189l-8 36c0 5 15 20 15 25s-25 30-35 45-25 60-25 70-5 20 10 20 20 15 20 15l-10 15 10 25s-2 14-5 20c-5 10 20 15 20 20s-20 15-20 20c4 45-24 56-25 50m70-200c15 0 10 40-10 30-30-15-45 5-15-5m105 35c2-6 7-10 15-10 25 0 10 45-30 45s-85-35-85-35v-15c40 15 30 45 85 50m-105-5c20 0 40 5 60 20-23-17-40-35-70-45m40-205l-5 15 55-5c30 0 60 45 95 45-35 0-65-55-95-56-10-1-14 9-34 9-5 0-16-8-16-8v0m105 80c-30 0-45-25-65-25-10 0-30 5-30 5m61 10c15 20-39 29-51 15 M240 597c-6-15-17-39-30-62-20-35-45-15-35 5s20 35 20 35m-20-35c-1-1-21-28-50-40-35-15-33 7-10 25 11 9 50 65 50 65m-60-75c-20-20-45-15-25 15s55 75 55 75m-55-75c-15-20-30 0-15 20 19 25 40 80 40 80m-33-69c-27-31-28 1-18 21 5 10 21 63 26 73l11 21m947 12c4 8 11 18-9 39-9 10-2 24 11 8 20-35 35-15 45-21-3 10 20 21-10 47-10 9-5 24 10 9 21-34 35-14 46-20-3 10 19 22-12 47-10 9-6 24 10 9 29-27 38-4 49-7-5 9 14 25-23 42-12 6-11 22 6 13 31-23 37 1 49 0-7 8 10 27-28 39-13 4-14 20 5 12 36-19 38 6 50 7-8 6 6 28-34 34-13 2-17 17 4 13m-181-251c5 14-28 35-9 47 20 14 35-3 53-20-15 20-31 39-10 55 19 17 37-2 55-19-16 20-30 39-18 56 13 18 39 0 61-12-20 15-46 28-33 50s39 11 63 2c-22 12-44 26-33 48 10 21 33 11 58 6-24 8-52 19-30 52',
                /* 2,2,4,3 King court_BLUE_DETAIL 3 Clubs */
                'M523 3c9 68 64 64 68 109 3 41-52 46-55 5-2-28 29-30 31-3 1 14-18 16-19 2 M523 3c1 69-53 74-50 119 3 41 58 36 55-4-2-28-34-25-31 2 1 14 20 12 19-2 M804 0c-2 68 60 74 56 120-4 41-66 35-62-6 2-28 38-24 35 3-1 14-23 12-22-2 M803 0c-10 68-72 62-76 107-4 41 58 47 62 6 2-28-33-31-36-3-1 13 21 15 23 2m106 45l3-3c14-16 21-37 23-61 27-5 46-13 62-21m-129 81c28-12 44-37 41-82 88-14 96-43 134-66 M385 83c11 8 23 15 36 18 4 11 7 23 15 37 4 7 9 13 15 19m40-4c-38-18-38-49-50-77-32 1-71-39-105-76m275 145c11-14 19-32 23-53 10-4 18-10 25-17 6 7 14 14 24 19 2 19 8 36 17 50 M661 0c-6 35-15 66-51 72-2 36-16 59-38 75m162-2a94 94 0 0 1-26-71c-36-7-43-39-47-74 0 0 0 0 0 0m358 0a695 695 0 0 0-125 228 M331 1c69 101 100 158 126 225m-11-27c174-21 316-17 457 2m-446 24c166-19 302-15 437 3m-466-68c187-24 341-19 491 2 M0 771a891 891 0 0 1 401-228m754 67l-196-72m341 125l-55-20 M924 538l-204 99-168-75m-8 29l176 79 219-105m-373 85l155 70 164-79m-307 47l143 65 140-68m-214 72l79 49 76-48m-153 51l82 50 74-48m-154 60l84 41 72-45m-6-153l7 190 M626 710l-37 20m58 27l-46 26m48 26l-38 24m40 38l-30 14m181-127l29 8m-24 101l4 2m-6-58l14 6 M606 960h-7m102 0h-7m-234 0V718m-19 206a125 125 0 0 1-125 125 125 125 0 0 1-125-125 125 125 0 0 1 125-125 125 125 0 0 1 125 125v0m521-385c-146 155-163 326-154 501m18 0c-10-175 7-342 153-495m-29 411c-6-134 18-258 125-376m-76 372c-7-130 17-240 127-353 M974 951c-6-130 19-247 127-361m-423 410a28 28 0 0 1-28 28 28 28 0 0 1-27-28 28 28 0 0 1 27-27 28 28 0 0 1 28 27v0m14-34c17-40-12-60-42-61-30 1-59 21-42 61-45-35-65 2-66 34 1 32 21 69 66 34-17 40 12 60 42 61 30-1 59-21 42-61 45 35 65-2 66-34-1-32-21-69-66-34v0 M499 563c41 84 67 186 88 299-31-83-77-146-136-190-58-42-125-66-200-76m-55 364h-33m-23-301v281m-40-252v212m1115 155a25 25 0 0 1 10 20v0a25 25 0 0 1-25 25 25 25 0 0 1-25-25 25 25 0 0 1 14-23m-10 10c-23-7-74-30-74-92 0-65 45-75 55-75 20 0 34 27 34 47 0 40-39 33-39 3 0-20 10-30 10-30l-30 20m125 100a48 20 0 0 1-47 20 48 20 0 0 1-48-20 48 20 0 0 1 48-20 48 20 0 0 1 47 20v0m-66-96c5-3 14-6 26-9v0c70-15 60 26 15 30-22 2-36 0-43-4m66-3c25 7 10 31-24 32-50 1-60-16-33-26m47 24c31 4 17 31-18 32-56 2-59-22-13-31m-31-71c3-5 14-11 32-15v0c70-15 60 27 15 30-21 2-35 0-42-3m-34 32c5 20-12 68-12 68m10-152V180l45-45 45 45v693m-140-13c0-20 40-33 40 0 0 7-10 8-10 0 0-5-10-5-10 5 0 35 65-10 75-20 10 10 75 55 75 20 0-10-10-10-10-5 0 8-10 7-10 0 0-33 40-20 40 0 0 50-85 28-95 15-10 13-95 35-95-15v0m95-14c2-28 8-72 8-91-1-25-11-34-12-54 0-20 18-52 17-77 0-25-15-53-16-73 0-20 10-45 9-65 0-20-17-56-18-76 0-20 15-64 14-84 0-20-11-50-12-65 0-15 14-63 13-78l-3-48 2 49c0 15-15 62-15 77s10 45 10 65-16 64-16 84 15 57 15 77-10 45-10 65 14 48 14 73-19 56-19 76 10 29 10 54c0 24-10 81-11 105 M203 978c86-22 148-22 228-6 M280 805l-1 82c-30 4-59 10-87 19m159-102l5 81c26 2 53 6 82 12m-221 103c76-18 130-19 202-5 M255 815l-1 51-54 12m228-8c-16-4-33-6-49-8l-2-47m-47 65a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m0-45a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m0 90a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m-50 0a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m-45 10a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m145-10a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0m45 5a15 15 0 0 1-15 15 15 15 0 0 1-15-15 15 15 0 0 1 15-15 15 15 0 0 1 15 15v0 M285 803a31 28 0 0 1 0-1 31 28 0 0 1 31-27 31 28 0 0 1 31 28v0a31 28 0 0 1 0 0m-44-25c-3-14-14-52-38-48s-42 59-20 70c17 9 16-47 35-45 9 1 14 21 15 28m9-6s0 0 0 0m22 0c1-27 6-52 14-77l-25-30-25 30c8 25 13 51 14 77m22 0s0 0 0 0m10 5c1-8 5-26 14-27 19-2 18 54 35 45 22-11 4-66-20-70s-35 32-38 47 M178 945h-39m37-15h-36m36-15h-36m38-15h-38m42-15h-42m47-15h-47m55-15h-55m65-15h-65m78-15h-78m93-15h-93m83-15h-83m80-15h-80m82-15h-82m86-15h-86m320 195h-6m6-15h-4m4-15h-4m4-15h-6m6-15h-10m10-15h-15m15-15h-23m23-15h-33m33-15h-46m46-15h-63m63-15h-53m53-15h-50m50-15h-52m52-15h-56m896 290h-42m-13-210l55-18 M866 537c25 4 49-7 49-33-1-24-24-34-38-27m9 61c25 4 49-7 49-33 0-23-22-33-36-28m7 61c25 4 49-7 49-33 0-24-23-33-38-27m4 60c25 4 49-7 49-33 0-23-21-33-36-28m7 61c25 4 49-7 49-33 0-24-23-33-38-27m9 60c25 4 49-7 49-33 0-24-23-33-38-27m9 60c25 4 49-7 49-33 0-24-23-33-38-27 M755 215c58 120 27 213 28 252 2 78 112 93 112 37-1-35-50-39-50-9-1 17 31 21 25 0m-97-279c58 120 37 213 38 252 1 32 24 43 50 41m-70-292c58 119 39 212 40 251 1 16 7 27 16 34m-36-283c47 82 34 176 42 260m-23-259c48 80 38 171 50 255m-32-253c46 80 40 178 60 253m-41-251c45 81 39 182 68 251m-49-248c45 81 39 189 77 250m-65-260c51 83 54 215 92 258m-215 86c29 4 64-12 70-24m-90-322c91 219-34 228-31 301 1 20 11 29 24 34m32-2c22 6 49-2 66-11m-56-155c-9 48-51 73-48 123 0 11 7 16 11 23m37-132c-11 32-34 51-31 93 3 54 45 54 77 46m-48-123c-9 19-20 35-18 68 3 45 32 55 60 53m-130-28c-5 71 80 80 80 40 0-30-50-20-30 5m-67-39c0 30 25 78 51 55m-68-49c0 35 23 71 49 56m-66-50c0 30 16 62 46 53m-63-47c5 30 13 56 45 49m-62-43c10 30 15 40 40 44m-80-44c-10 24-15 27-40 30m23-35c-5 24-16 36-48 30m31-35c0 24-31 42-61 35m27-44c0 24-28 59-54 40m37-45c10 56-95 59-96 14-1-40 56-35 56-5 0 24-41 30-40 5 0-8 10-15 20-10m135 40c20 25 50 5 50-20m-91-14c0 20-21 38-45 38m-16-334c-12 40 7 47 7 100 0 55-65 45-65 5 0-30 40-25 40 0 0 18-30 20-30 5s15-10 15-10m27-100c-15 44-7 72-12 107m-15 79s-15-5-15 10 30 13 30-5c0-25-44-31-44-1 0 40 64 45 65-5 0-25-6-30 1-67-17 27 0 63-23 77m21-15c19 89 3 125-30 135m30-265s20-20 40-20 28 6 33 6c5 1 12-6 17-11v10s-12 5-17 5-26-6-34-7c-4 0-32 8-39 17m275 10s-33-33-53-33-49 8-54 8c-6 1-18 0-23-10v10l22 4 56-9c16 1 45 21 52 30m-185-25s15 15 15 20c0 20-12 30-12 50s-13 60-13 69c1 5 15 11 20 11s5 20 5 20m35-55c25 5 29 36 10 30-45-15-45 10-13-2m-72 57v10l5-5-5-5v0m115 0v10l-5-5 5-5v0m-110 5c10 0 15-10 25-10s15 5 20 5 17-7 22-7 23 12 38 12m-75 20c6 12 30 15 35 0 M470 310c10-5 20-10 36-9s29 24 44 24c-25 0-30 10-45 10s-25-5-35-10m150-10s20-20 35-20 50 20 60 20c-22 0-45 15-60 15-20 0-35-15-35-15 M495 430c6 1 15-13 0-12-23 0-14 33 9 33 15 0 31-19 46-21v-10c-30 10-25 25-45 30m185-15c-12-5-20-21 2-23 23-2 18 38-25 39-21 0-35-21-67-21v-10c52 5 37 25 67 30m91 550a108 97 0 0 1-108 97 108 97 0 0 1-108-97 108 97 0 0 1 108-97 108 97 0 0 1 108 97v0 M533 565c45 98 71 214 92 341m96-153l17 192m-92-226l7 185m-101 56H436m370 0h-58m0 0l59-37 M202 621c183 11 322 96 374 309m178 45h51m-313 0h53'
            ] // <<< end King court BLUE_DETAIL
        ] // <<< end 2,1 court King
    ] // <<< end COURT
]; // <<< end paths
//﻿////@ts-check
//this.compareDocumentPosition() Node.DOCUMENT_POSITION_FOLLOWING);//todo learn this
((
    window,
    document,
    Object,
    String,
    ___APPNAME___ = "CARDTS",
    license = "License:CC-BY-SA - Danny Engelman - ___VERSION"
) => {
    class HTML_E_lement extends HTMLElement {
        $CSS(___CSSProp_INDEX___, $Element_index) {
            throw new Error("Method not implemented.");
        }
        // static get observedAttributes() {//!! never called because we only use Elements derived from this base class
        // }
        //================================================================================================================================
        constructor(config) {//***** constructor BaseElement ============================================// start constructor Base Element
            //todo add 'global' area,zone,slot vars here?
            super();
            //!! this is a javascript scope fo each created Element
            //!! So... (it is JavaScript!) variables declared here are available to functions declared in the Object_assign statement below
            //!! Note: those function are NOT the same as global Methods declared in this class.. Those can NOT access variables within this scope!
            //!! BUT this pattern eats more memory for each element as each element gets its own methods
            console["log"](...(() => __initConsole(this))());//prevent from being deleted by first Uglify pass

            //in NON minified Code I can get my name:
            //console.warn('Element name:', String(this.constructor).split('extends')[0].split('class')[1].replace('Element', '').trim());

            // temp declarations to quite TS checking
            // this.warn = undefined;
            // this.$query = undefined;
            // this.log = undefined;
            // this.on = undefined;
            // this.say = undefined;
            // this.$Element_done = undefined;
            // this.$get_$Elements = undefined;
            // this.cardt= undefined;
            // this.$append = undefined;
            // this.$Element_addEventListener = undefined;
            // this.error = undefined;
            // this.hear = undefined;
            // this.show = undefined;
            // this.___CEattr = undefined;

            let el = this;
            let templ;
            let $Element_index;
            let $Element_ListenersArray     /**/ = [];
            let $Element_MutationObserver   /**/;
            let $Element_InitialHTML        /**/;
            let $Element_RootNodeHost       /**/;

            let ___translateYX              /**/ = (y, x) => `translateY(${y}px) translateX(${x}px)`;

            if (___APP_LOGELEMENTS___)      /**/ console.logCE(this);

            // @ts-ignore
            if (el[ISCONNECTED])            /**/ el.error('?? isconnected in constructor', el.nodeName);
            // @ts-ignore
            if (el.$Element_done)        /**/ el.error('?? connectedDONE in constructor', el.nodeName);

            // el.getRootNode({composed: false}));//todo check this return document-fragment for shadowDOM
            // el.getRootNode({composed: true}));// and document here

            // Question: any drawbacks (besides taking up extra memory) in declaring these as Class methods ?
            // Question: is attr a reserved keyword or something ?
            Object.defineProperties(el, {
                'E': {
                    value: () => {
                        console.log('E', Object.keys(el));
                    },
                    writable: false,
                    enumerable: false
                }
            });
            Object.assign(el, {
                $Element_done                    /**/: 0,
                $Element_init_inConstructorScope() {
                    // if (!el.__proto__["BOO"]) el.__proto__["BOO"] = () => console.error(666, el); // todo refactor on __proto__
                    // @ts-ignore
                    $Element_RootNodeHost = el.getRootNode().host;
                    // @ts-ignore
                    if (el.$Element_done) {
                        el.warn('connectedCallback runs again!');
                    } else {//todo force DOM Mutation added into Zone/Slot shadowDOM? Zone ensures this by overruling .appendChild()
                        //$Elements_Set.add(el);
                        $Element_InitialHTML = el.$query('*') ? false : el.innerHTML;//todo There is no DOM here! //store text if there is text but no Elements
                    }
                    if ($Element_RootNodeHost) {
                        $Element_index = $Element_RootNodeHost.$get_$Elements(___CE_SLOT___).indexOf(el) + 1;
                        if (!el.id) el.id = ($Element_RootNodeHost.id || 'noid') + '_' + $Element_index;    // todo overrule with attribute forceid="true" ?
                        el.$CSS(___CSSProp_INDEX___, $Element_index);                               // --index:x as style so CSS can stack cards // todo set rule in constructable stylesheet
                    } else {
                        //element is NOT in a shadowDOM
                        if (el.nodeName == ___CE_CARDT___) {
                            //todo Area has no appendChild method yet, add one which puts CARDT in first Zone?
                            if (el.parentNode.nodeName == ___CE_ZONE___) {
                                // @ts-ignore
                                el.parentNode.$zone_appendChild(el);  // custom zone.$zone_appendChild
                            }
                        }
                    }
                    // @ts-ignore
                    if (el.$connectedCallback) el.$connectedCallback();
                    else if (___APP_LOGELEMENTS___) el.log('Child element has no connectedCallback in:', String(el.constructor).split('extends')[0]);//todo maybe get its name

                    el.on(___DISCONNECT___, evt => {
                        //el.error('el mute', evt.type, evt.detail);
                    });
                    el.say(___CONNECT___);

                    /** disable all STYLE definitions with a disabled attribute */
                    el.$query(`STYLE[disabled]`).map(sht => sht.disabled = 1);

                    el.$Element_done = 1;
                },// <<< $Element_init_inConstructorScope

                get: el.$get_$Elements = str => [...el[___EL_ROOT___].children].filter(x => x.nodeName.includes(str || ___PREFIX___)),// can do a partial which $query can not

                //===== quering DOM =============================================================================================================
                find: (//!! find .closest() element UP in the DOM; same as .closest() BUT crossing shadowDOM boundaries
                    selector,
                    // todo add logging for debugging and playing the DOM
                    // eg: Table.free()[0].find('CARDTS-AREA')
                    // Uglify declare as parameter to avoind extra let
                    _recursive_closest = (el, found = el && el.closest(selector)) =>
                        // @ts-ignore
                        !el || el === window || el === document ? null : found ? found : _recursive_closest(el.getRootNode().host)
                ) => _recursive_closest(el),
                //__indexInNodeList = (nodeList, el) => Array.prototype.indexOf.call(nodeList, el),// children is nodeList without indexOf method! no longer used

                //double assignment so it has public name but a minified 'internal' name
                query: el.$query = (
                    selector,
                    levels = 0          // nr of levels deep to query shadowRoots
                ) =>
                    [...el[___EL_ROOT___].querySelectorAll(selector)]
                // [...el[___EL_ROOT___].querySelectorAll(selector)].reduce((result, element) => {
                //     if (levels) {
                //         return result.concat(element.$query(selector, --levels));               // recursivly dive into shadowRoots
                //     } else {
                //         console.error(result, element);
                //         return [element];
                //     }
                // }, [])
                ,
                free: id => el.$get_$Elements().filter(x => x.children.length == 0 && (id ? x.id == id : true)),

                cardt: idx => el.$query(___CE_CARDT___)[idx || 0],
                //slot: idx => el.$query(___CE_SLOT___)[idx || 0],//!! can't name it slot.. gives an error

                //todo needs get()
                //first                           /**/: () => el[___METHOD_ELEMENTS___]()[0],
                //last                            /**/: () => el[___METHOD_ELEMENTS___]().pop(),

                //empty slots are free

                //===== methods affecting DOM =============================================================================================================
                show: (yes = 1) => el.style.visibility = yes ? 'visible' : 'hidden',
                flip: newSTATE => el[___ATTR_STATE___] = newSTATE
                    ? newSTATE : el[___ATTR_STATE___] == ___STATE_back___
                        ? ___STATE_face___ : ___STATE_back___,

                css: el.$CSS = (name, val) => {
                    // Chrome 73 https://stackoverflow.com/questions/53244494/correct-way-to-apply-global-styles-into-shadow-dom
                    if (___APP_LOGPROPS___ && val) el.log('setProperty', name, val);
                    return val
                        ? el.style.setProperty('--' + name, String(val))  // todo maybe drop String()
                        : getComputedStyle(el).getPropertyValue('--' + name);
                },
                /** Move elements to another Zone (with free slots) */
                //to       /* return filled slots */: (dest, cardt) => dest.free().filter(slot => (cardt= el.cardt(), cardt? cardt.move(slot) : 0, cardt)),
                to: destZone => destZone.free().map(slot => {
                    //console.error(destZone.free().length, 'free slots in ', dest.id);
                    let cardt = el.cardt();
                    if (cardt) cardt.toid(slot.id);
                }),

                fill:
                    cards =>
                        cards.map(cardt =>
                            Array.isArray(cardt)
                                ? cardt.map(content => el.$append(cardt[0], content, 1))// 1 single card!
                                : el.$append(cardt)),

                //!! EventListners 
                //!! READ: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
                //!! READ: https://www.quirksmode.org/js/events_order.html
                //todo :-) Dynamic creation [(() => 'event')]: (x) => x,
                //!! event listners are stored in array _listener IN the element that created the element
                //!! so card(area,name,func) tracks only in card
                $Element_addEventListener(
                    name,
                    func,
                    options = {}
                ) {
                    let BigBrotherFunc = evt => {                                           // wrap every Listener function
                        //if (___APP_LOGEVENTS___) el.hear(`(${evt.timeStamp}) phase:${evt.eventPhase} isTrusted:${evt.isTrusted} type:${evt.type}`, evt.detail, evt.currentTarget);
                        // catch function here?
                        if (___isFunction(evt.detail) && evt.type !== 'FINDSLOT') {
                            //todo2 el.error(`can catch Event function: '${evt.type}' here`, evt);
                        }
                        func(evt);
                    }
                    el.addEventListener(name, BigBrotherFunc, options);
                    return [name, () => el.removeEventListener(name, BigBrotherFunc)];
                },
                on(
                    //!! no parameter defintions, because function uses ...arguments
                    // element,
                    // eventNR,
                    // func,
                    // options = {},
                    //options:
                    //capture   // TF: event will be dispatched to the registered listened BEFORE being dispatched to any EventTarget beneath it in the DOM tree.
                    //once      // TF: if true, the listener is automatically removed when invoked
                    //passive   // TF: if true, indicates that the function specified by listener will never call preventDefault()
                ) {
                    let args = [...arguments];                                  // get arguments array
                    let target = el;                                            // default target is current element
                    if (args[0] instanceof HTMLElement) target = args.shift();  // if first element is another element, take it out the args array
                    args[0] = ___eventName(args[0]) || args[0];                 // proces eventNR
                    // args[1]
                    $Element_ListenersArray.push(target.$Element_addEventListener(...args));
                    if (___APP_LOGLISTENERS___) el.log(`Listener: ${args[0]} ${target.id === el.id ? '' : 'ON ►►► ' + target.id} ${$Element_ListenersArray.length} ears:`, $Element_ListenersArray.map(lst => lst[0]));
                },
                mute(name, func) {
                    let eventName = ___eventName(name) || name;
                    $Element_ListenersArray = $Element_ListenersArray.reduce((ears, ear) => {//rewrite to filter
                        let [earEventName, earFunc] = ears;
                        console.error(earEventName, eventName, earFunc === func);
                        if (
                            !name                                           // empty name deletes all listeners
                            || (ear[0] === eventName && !func)              // no func specified then all matching names are removed
                            || (ear[0] === eventName && ear[1] === func)    // or if name && func ar correct 
                        ) {
                            if (___APP_LOGLISTENERS___) el.log('Remove Listener', el.id, ear[0], ear[1]);
                            ear[1]();
                        } else {
                            ears.push(ear);
                        }
                        return ears;
                    }, [])
                },
                say(// Custom Event
                    eventNR,            //!! eventNR is idx OR a custom eventName string value
                    detail,             //todo some default something here ??
                    options = {
                        detail,
                        bubbles: true,    // event bubbles UP the DOM
                        composed: true,   // !!! required so Event bubbles through the shadowDOM boundaries
                    }
                ) {
                    //? https://www.i-programmer.info/programming/javascript/8830-javascript-async-events.html?start=2
                    if (___APP_LOGEVENTS___) el.hear(': ' + (___eventName(eventNR) || eventNR), detail || 'no detail');
                    if (!___eventName(eventNR)) el.warn('no ___eventName:', eventNR, detail);
                    //README: composed events (readonly property) pierce the shadowDOM Read: https://developer.mozilla.org/en-US/docs/Web/API/Event/composed
                    //README: https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
                    el.dispatchEvent(new CustomEvent(___eventName(eventNR) || eventNR, options));
                },
                do(eventNR, func, options) {
                    el.say(eventNR, func, options);
                },
                //** EventListners https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener */

                /**
                 * Add a MutationObserver on el[EL_ROOT]                    https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
                 * only when either of the Callback functions is defined
                 * @param {*} addFuncCallback 
                 * @param {*} removeFuncCallback 
                 */
                watch(addFuncCallback, removeFuncCallback) {
                    if ($Element_MutationObserver) {
                        el.warn('Removing existing MutationObserver');
                        if ($Element_MutationObserver.takeRecords()) {
                            el.warn('unprocessed Mutation Records!');
                        }
                        $Element_MutationObserver.disconnect();
                    }
                    if (addFuncCallback || removeFuncCallback) {
                        $Element_MutationObserver = new MutationObserver(list => [...list].map(record => {//todo, is the MO removed on animatio??
                            let { type, addedNodes, removedNodes } = record;//also includes target
                            if (type === 'childList') { // todo optional: collect all callback functions, execute later
                                [...(addedNodes || removedNodes)]
                                    .filter(node => !['#text', '#comment'].includes(node.nodeName))
                                    .map(node => {
                                        if (___APP_LOGDOMEVENTS___) el.log(`DOM Mutation ${addedNodes ? 'Add' : 'Remove'} ${node.nodeName}: ${node.id}`);
                                        //call function with node parameter:
                                        (addedNodes ? addFuncCallback : removeFuncCallback)(node);
                                    });
                            }
                        })).observe(el[___EL_ROOT___],
                            {
                                //attributeFilter:[],       // array of attribute names to be monitored. If not included, changes to all attributes cause mutation notifications
                                //attributeOldValue: 1,     // record the previous value of any attribute that changes when monitoring the node or nodes for attribute changes
                                //attributes: 1,            // default false. TRUE watches all attribute changes
                                //characterData: 1,         // 
                                childList: true,               // default false. TRUE monitors all descendant node addition or removals
                                subtree: true                  // default false. TRUE monitor enire subtree
                            });
                    }
                },// <<< watch() Mutation Observer

                /* Move element to slot */
                toslot(slot) {
                    let animEl, sourcePos, targetPos;
                    console.logCE('moveElementTo' + slot.nodeName);
                    //todo el.todo('move, check if I can really move');
                    animEl                      /**/ = ___cloneNode(el);                // clone the element; the animated element is a New Custom Element
                    animEl[___ATTR_STATE___]    /**/ = el[___ATTR_STATE___];            // same as the state (back/face) of the original cardt//?because cardtforces it to Zone state?
                    animEl.id                   /**/ = el.id + ___ATTR_ANIMATION___;    // indicate in a new id this Element is now a clone being animated
                    sourcePos                   /**/ = ___elementPosition(el);          // store current location
                    el.show(0);                                                         //!! the surrounding CARDTS-SLOT is NOT hidden (if it is forced into one)
                    slot.appendChild(el);                                               // append to SLOT //!! triggers a disconnectedCallback AND connectedCallback
                    targetPos                   /**/ = ___elementPosition(el);          //!! el is now HIDDEN in destination position
                    animEl.style.position       /**/ = 'absolute';                      //?Question: Does this also prevent a DOM reflow?
                    document.body.appendChild(animEl);                                  // append the clone to the DOM //todo force the state here, because cardtset the default state (BODY is not a zone)
                    // animEl.animate(
                    //     [
                    //         { [LEFT]: /* animEl.style[LEFT] = */sourcePos[LEFT] + 'px', [TOP]:  /* animEl.style[TOP] = */sourcePos[TOP] + 'px' },
                    //         { [LEFT]: targetPos[LEFT] + 'px', [TOP]: targetPos[TOP] + 'px' } //
                    //     ],
                    //     0
                    //     // {
                    //     //     [DURATION]: 400
                    //     // }
                    // ).onfinish = () => {
                    el.show();
                    animEl.bye()    // triggers a disconnectedCallback
                    // }
                },// <<< BaseElement Method: move

                bye() {
                    el.parentNode.removeChild(el);  // triggers a disconnectedCallback
                }

            });// <<< Object_assign(BaseElement) ========================================================================================================================
            Object.assign(el, config);

            /***** append GETTERS and SETTERS **********************************************************
                * no need for a shitload of get() set() declarations for every Attribute!
                * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
                * **/
            el.constructor.observedAttributes                                                           // all attributes declared in observedAttributes
                // .concat(config[___CONFIG_GETTER_SETTERS___] ? config[___CONFIG_GETTER_SETTERS___] : []) //todo add extra attributes (no attributeChanged fired)
                .map(attr => {
                    if (el[attr]) el.error('Overwriting: ' + attr, el[attr]);
                    Object.defineProperty(el, attr, {                                          // loop all attr
                        get() {
                            return el.getAttribute(attr);                                                   // GETTER
                        },
                        set(val) {
                            val ? el.setAttribute(attr, val) : el.removeAttribute(attr);                    // SETTER if value defined, else Delete attribute
                        },
                        //enumerable: 1,                                                                    // default:false
                        //configurable: 1                                                                   // default:false   
                        //writable: 1                                                                       // not valid, since there is a set method!
                    })
                });
            /***** append TEMPLATE from main Document, if one is defined *******************************/
            templ = document.getElementById(el.nodeName);                                               // get template from main document
            if (templ) {
                if (___APP_LOGELEMENTS___) el.log('attaching TEMPLATE: ' + templ.id + ' in shadowRoot', this);
                el[___EL_ROOT___] = el.attachShadow({ mode: 'open' });//todo analyse lit-html , handle light DOM SET el[EL_ROOT] //todo, this is erased when moving element
                el[___EL_ROOT___].appendChild(___cloneNode(templ.content));
            } else {
                /** If no template is defined there will be no shadowDOM **/
                el[___EL_ROOT___] = el;
                el.warn('no template', $Element_InitialHTML);
                //el[___EL_ROOT___].innerHTML = $Element_InitialHTML;
            }
            /***** Add slotchange event ****************************************************************/
            console['assert'](                                                                                     // prevent Uglify in first pass, but delete from .min.js version
                (() => {                                                                                         // execute as IIFE
                    if (el.shadowRoot) {                                                                        // only if elements have a shadowRoot
                        el.$query(___TAGSLOT___)                                                    // find all SLOT in current el(ement)
                            .map(slot => {//!! HTML SLOT! not CARDTS-SLOT
                                if (___APP_LOGDOMEVENTS___) {
                                    //el.$Element_addEventListener('slotchange', evt => {//!! HTML SLOT! not CARDTS-SLOT
                                    slot.addEventListener('slotchange', evt => {
                                        if (___APP_LOGSLOTS___) el.hear('Classic Event:' + evt.type, slot.outerHTML, slot.assignedNodes());
                                    });
                                }
                            });
                    }
                    return true;//'add slotchange handlers';                                                           // return value is first parameter for console.log
                })()
            );
        }//***** constructor BaseElement========================================================================// end constuctore Base Element
        //================================================================================================================================

        // Angular Inspiration:
        // @HostBinding('style.display') display: string; <TypeScript declaration!>
        // @HostBinding('style.width.%') width: number;
        //
        // ngOnInit() {
        //     this.display = 'block';
        //     this.width = 50;
        // }

        // shuffle() {//todo shuffle memory-cards only, not slot, maybe swap event on slot? So ready for Teamstijl?
        //     // let idx = cards && cards.length;
        //     // while (idx--) table.insertBefore(___rand(cards), ___rand(cards));//swap 2 random DOM __nonSTYLErootelements

        //     //https://bost.ocks.org/mike/shuffle/
        //     //while (idx--) Area.insertBefore(cards[idx], _rand(cards));//Fisher Yates shuffle
        // }

        //todo set/get property for slot[_state]
        attributeChangedCallback(name, oldValue, newValue) {//--------------******************-------------- BaseElement
            let el = this;
            //!! executed before connectedCallback for initial attribute values, so oldValue===null
            if (___APP_LOGATTRINIT___ || (oldValue !== null && ___APP_LOGATTR___)) this.log(`attribute ${oldValue ? 'Changed' : '**init'}: ` + name, 'from: ' + oldValue, 'to: ' + newValue);

            if (el.___CEattr) el.___CEattr(name, oldValue, newValue);//execute callback function on child if one exists

            if (___CSSPropertiesAttributes___.includes(name)) el.$CSS(name, newValue);
        }

        // adoptedCallback() {//--------------******************-------------- BaseElement
        //     if (___APP_LOGELEMENTS___) console.logCE(this);
        // }

        connectedCallback() {//--------------******************-------------- BaseElement
            if (___APP_LOGELEMENTS___) console.logCE(this);
            this.$Element_init_inConstructorScope();
        }// <<< connectedCallback

        disconnectedCallback() {//--------------******************-------------- BaseElement
            let el = this;
            if (___APP_LOGELEMENTS___) console.logCE(el);
            //this.todo('disconnect, DO NOT destroy my $Elements_Set data', $Elements_Set.has(this) ? "I EXIST!" : "");
            //$Elements_Set.delete(this);
            if (___APP_LOGELEMENTS___) el.log('Hasta La Vista! Baby!');
            el.mute();                      // also remove the listeners I attached elsewhere
            el.watch();                     // clean MutationObserver (of I have one)
            el.say(___DISCONNECT___);       // let the world know I am going, //!!BUT I am still in the DOM, so don't count as free slot 666
        }
    }//Base Element class extends HTMLElement
    // --------------------------------------------------------------------------------------------------- BaseElement
    // ***************************************************************************************************************
    // --------------------------------------------------------------------------------------------------- AreaElement
    class AreaElement extends HTML_E_lement {
        //todo make generic CARDTS-AREA
        //todo add areatype attribute
        static get observedAttributes() {
            if (___APP_LOGELEMENTS___) console.logCE(this);
            return [___CARDTS___, ___ATTR_CARDTSIZE___];//, ___MATCHCOUNT___];
        }

        constructor(area) {
            super({
                $connectedCallback() {
                    if (___APP_LOGELEMENTS___) console.logCE(this);
                    area = this;
                    //area[___MATCHCOUNT___] = area.getAttribute(___MATCHCOUNT___);       // when matchcount is NOT an observed Attribute
                    area.todo('Listen for cards added to Table, THEN say what events to listen for');
                    area.on(___SELECTCARDT___, evt => {
                        //evt.preventDefault();//stop further bubbling up the DOM
                        let selectedCardtId = evt.path[0][___ATTR_CARDTID___];
                        // !! CARDTS-AREA                      * 'sees' CARDTS-ZONE
                        // !!   CARDTS-ZONE                    |
                        // !!     CARDTS-SLOT (shadowDOM)      |
                        // !!       CARDTS-CARDT (shadowDOM)  Event
                        // !! The 'composed' and 'bubbles' Event came through element(s) with shadowDOM
                        // !! event.srcElement and event.target are the first NON shadowElement this CARDTS-AREA element can 'see'
                        // !! Since CARDTS-CARDT and CARDTS-SLOT have shadowDOM. CARDTS-AREA 'sees' the CARDTS-ZONE the Event came from.
                        // !! event.path is an array : [CARDTS-CARDT, slot(the HTML slot!), #docfragment , CARDTS-SLOT , #docfragment , CARDTS-ZONE , CARDTS-AREA , BODY , HTML , DOCUMENT]
                        area.todo(`redo Event '${___SELECTCARDT___}' listener, use same named method on CARDTS-MEMORY`);
                        // !! below code is for Memory type area
                        // !! go UP from CARDT to ZONE here, so in ZONE in ZONE scenario the first containing ZONE is selected
                        // !! query all CARDTS-CARDTs in Zone where state="face"
                        let tell = (func, gate_closes_at_Time = 2) => {
                            let responses = [];
                            let extended_Timeout;                             // 
                            return (evt, cardt) => {
                                responses.push(cardt);
                                clearTimeout(extended_Timeout);           // clear timer
                                extended_Timeout = setTimeout(() => {
                                    func();
                                }, gate_closes_at_Time);//!! events usually come in at 0.5 to 0.8 MILLIseconds
                            }
                        }
                        (() => {// IIFE to create a function scope to store 'local' variables
                            let samecards = [];
                            //let starttime = new Event('').timeStamp;// fake Event to get current timeStamp
                            let extended_Timeout;                             // 
                            let gate_closes_at_Time = 2;                // nr of ms to wait for all reponses
                            area.say(selectedCardtId,
                                (evt, cardt) => {
                                    samecards.push(cardt);
                                    clearTimeout(extended_Timeout);           // clear timer
                                    extended_Timeout = setTimeout(() => {
                                        //console.error('delayed event', evt.timeStamp - starttime);
                                        if (samecards.every(cardt => cardt[___ATTR_STATE___] === ___STATE_face___)) {
                                            area.say(___OPENCARDTS___, ___STATE_match___);
                                        } else {
                                            let match_card_count = samecards.length;//!! this requires a same count for all cards?
                                            let openedcards = [];
                                            area.say(___OPENCARDTS___,
                                                (evt, cardt) => {
                                                    openedcards.push(cardt);
                                                    clearTimeout(extended_Timeout);           // clear timer
                                                    extended_Timeout = setTimeout(() => {
                                                        if (openedcards.length == ___APP_CHEATMODE___) { // cheat! on first click matching cards reveal themselves
                                                            area.say(selectedCardtId, ___WHERECARDTS___);
                                                        } else {
                                                            if (match_card_count == openedcards.length) {//todo Make it work with N cards matching
                                                                area.say(___OPENCARDTS___, ___REMEMBER___);
                                                                openedcards.forEach(cardt => cardt.mute(___OPENCARDTS___));
                                                            } else {
                                                                //need to match N cards and not all are open
                                                            }
                                                        }
                                                    }, gate_closes_at_Time);//!! events usually come in at 0.5 to 0.8 MILLIseconds
                                                })
                                        }
                                    }, gate_closes_at_Time);//!! events usually come in at 0.5 to 0.8 MILLIseconds
                                })// <<< area.say(selectCardtId
                        })();
                    })
                },//$connectedCallback()

                ___CEattr(name, oldValue, newValue) {//todo handle attr changes before CONNECTEDDONE
                    if (name === ___ATTR_CARDTSIZE___) this.$CSS(___ATTR_CARDTSIZE___, newValue + 'px');
                    else if (area && area.$Element_done && name === ___CARDTS___) {
                        // connectCallback will handle first init cards, not destroying the original HTML content
                        // if (___APP_LOGATTR___) area.log('attr replaceCardts()', newValue);
                        // if (oldValue) area.innerHTML = '';
                        // split newValue.split`,`.slice(0, (MAXIMUM_CARDTS / MATCHCOUNT) + 1)
                        // area.shuffle();
                    }
                }
            });// <<< super()
            if (___APP_LOGELEMENTS___) console.logCE(this);
        }// <<< AreaElement constructor
    }// <<< AreaElements
    // --------------------------------------------------------------------------------------------------- AreaElement
    // ***************************************************************************************************************
    // --------------------------------------------------------------------------------------------------- ZoneElement
    class ZoneElement extends HTML_E_lement {
        static get observedAttributes() {
            if (___APP_LOGELEMENTS___) console.logCE(this);
            return [...___CSSPropertiesAttributes___, ___ATTR_MAX___];
        }
        constructor(area, zone) {
            super({
                $connectedCallback() {
                    if (___APP_LOGELEMENTS___) console.logCE(this);
                    // zone variable is declared as constructor parameter so it doesn't require a let declaration
                    // its value is set asap here so all other functions in this constructor scope can use it
                    zone = this;
                    (zone || console).todo('What if Zone is DocumentFragment?', zone.nodeType, zone.parentNode);
                    area = zone.find(___CE_AREA___);//todo move to BaseElement init?

                    //every zone listen at area level, finds a free slot, then executes to given function
                    zone.on(area, ___FINDSLOT___, evt => evt.detail());

                    zone.watch(//todo MutationObserver to change _STR_STATE
                        added_node => {
                            //zone._m_animateIntoZone(added_node);//Mutation Add, animate to destination
                        },
                        removed_node => {
                            zone.$get_$Elements().map((el, idx) => { //reposition elements
                                if (el.$CSS(___CSSProp_INDEX___) != idx) {//not me
                                    let source = ___elementPosition(el), target = ___elementPosition(el);
                                    el.$CSS(___CSSProp_INDEX___, idx);//forces new x,y
                                    //zone._m_animateIntoZone(el, source[TOP] - target[TOP], source[LEFT] - target[LEFT]);//reposition, animate to destination
                                }
                            })
                            // todo "contain" and "fit" processing
                        }
                    );
                    // todo move to BaseElement
                    // loop all attribute names LAYOUT now only one, find matching STYLE definition, set disabled property (false activates style) matching the property defined on zone
                    // * <STYLE attr="value"> is ENabled
                    // * <STYLE attr="x"> is DISabled
                    [___LAYOUT___].map(attr =>
                        zone.$query(`STYLE[${attr}]`).map(sht =>
                            sht.disabled = sht.getAttribute(attr) != zone[attr])
                    );

                    /** append ATTR_MAX or 0 slots */
                    //!!todo BUILT WITH DOCUMENTTEMPLATE
                    //!!todo only add 1 slot, if that is filled check MAX and add another one 
                    zone.log('fill zone with slots', zone[___ATTR_MAX___]);
                    for (let n = zone[___ATTR_MAX___]; n--;) zone.$zone_appendChild(document.createElement(___CE_SLOT___));

                },// <<< Zone __CEconnectedCallback

                //!!Zone overrides default .appendChild to (optionally) force elements in a Cardts-Slot element
                //todo add something like onCardt and onSlot handlers
                $zone_appendChild(
                    el = 0,
                    slotTo =
                        this.getAttribute(___ATTR_SLOTSTO___)                                               // slot to slots="name" attribute on Zone
                        ||
                        ___TAGSLOT___,                                                                      // default = "CARDTS-SLOT"
                    newel = el
                ) {
                    if (
                        slotTo != ___NONE___                                                                // do not force if Zone has attribute slots=___NONE___
                        &&
                        !(el[NODENAME] == ___CE_SLOT___)                                                    // do not force SLOT into a SLOT
                    ) {
                        // @ts-ignore
                        newel = document.createElement(___PREFIX___ + slotTo.replace(___PREFIX___, ''));    // create a new SLOT
                        if (el) {
                            // @ts-ignore
                            newel.appendChild(el);                                                      // if an el as content was provided
                        }
                    }
                    // @ts-ignore
                    if (___APP_LOGDOMEVENTS___) (zone || console).todo(`.$zone_appendChild( ${newel && newel.nodeName} ${newel && newel.id} content:${el ? el.nodeName : ''})`);

                    //todo The ParentNode.append() method inserts a set of Node objects or DOMString objects after the last child of the ParentNode. DOMString objects are inserted as equivalent Text nodes.
                    return this[___EL_ROOT___].appendChild(newel);               // todo also an insertBefore function

                },// <<< Zone $zone_appendChild

                //todo how to overrule appendchild?
                // appendChild() {
                //     console.log(22, 'appendchild', ...arguments);
                //     //zone.$zone_appendChild(...arguments);
                // },

                $append(//!!todo move this Memory only code to new cardts-memory Element
                    id,
                    content = id,
                    duplicates = 2,
                    //Uglify
                    cardt,
                    fragment = document.createDocumentFragment()
                ) {
                    if (Array.isArray(id)) {
                        //!!todo documentfragment
                        id.map(zone.$append);                                               // call this function again for all values in array x
                        //!!todo add documentfragment to zone
                    } else {
                        cardt = document.createElement(___CE_CARDT___);
                        cardt.id = id;
                        cardt.innerHTML = `<div slot=face>${content}</div>`;
                        //if (!_isStr(id)) content = content.innerHTML;                             // todo cleanup? test with images
                        //OLD cardt[___ATTR_CONTENT___] = content;                                              // .cardDIV shadowCSS sets the font-size
                        cardt.$CSS( // same color for all N cards making up one set
                            CSSface_background,
                            `rgb(${___random(150)},${___random(150)},${___random(150)})`
                        );
                        //OLD zone.$zone_appendChild(cardt, ___CE_SLOT___);                                // !! changed duplicates counting to duplicates--
                        while (duplicates--) zone.$zone_appendChild(___cloneNode(cardt), ___CE_SLOT___);   // yes, we can play with 3 or more cards!
                    }
                },// <<< Zone $zone_appendChild

                // _m_animateIntoZone(el, y = 0, x = this[OFFSETWIDTH]) {//slide in from underneath Right border, todo clone el here  // Zone, also in Cardt
                //     // let zone = this;
                //     if (___APP_LOGANIMATION___) zone.log(ANIMATION + ' Element to: ' + zone.id);//todo test for being in correct position already
                //     zone[___ANIMATING_ELEMENTS__].add(el);
                //     el.animate(
                //         [
                //             { [TRANSFORM]: ___translateYX(y, x) },
                //             { [TRANSFORM]: ___translateYX(0, 0) }
                //         ],
                //         {
                //             [DURATION]: APP_ZONEANIMATIONSPEED
                //             //200 + (zone[ANIMATING_STORE].size * 100)// animate every N cardtslower
                //         }
                //     ).onfinish = () => {
                //         zone[___ANIMATING_ELEMENTS__].delete(el);
                //         if (zone[___ANIMATING_ELEMENTS__].size === 0) {
                //             if (___APP_LOGANIMATION___) zone.log('All Animations Finished');
                //         }
                //     };
                // }// <<< _m_animateIntoZone


            });// <<< Zone super()
            if (___APP_LOGELEMENTS___) console.logCE(this);
        }

    }
    // --------------------------------------------------------------------------------------------------- ZoneElement
    // ***************************************************************************************************************
    // --------------------------------------------------------------------------------------------------- SlotElement
    class SlotElement extends HTML_E_lement {
        static get observedAttributes() {
            if (___APP_LOGELEMENTS___) console.logCE(this);
            return ___CSSPropertiesAttributes___;
        }
        //!! Why do I even have a Slot element??
        // constructor() {
        //     super({});
        //     if (___APP_LOGELEMENTS___) console.logCE(this);
        // }
    }
    // --------------------------------------------------------------------------------------------------- SlotElement
    // ***************************************************************************************************************
    // --------------------------------------------------------------------------------------------------- CardtElement
    class CardtElement extends HTML_E_lement {
        static get observedAttributes() {
            if (___APP_LOGELEMENTS___) console.logCE(this);
            return [...___CSSPropertiesAttributes___, ___ATTR_FACETYPE___, ___ATTR_ANIMATION___];
        }
        constructor(area, zone, slot, cardt) {//--------------******************-------------- CardtElement
            let cardDIV;
            let cardDIV$classList;
            let cardDIVstyle$$setProperty = (name, val) => cardDIV.style.setProperty('--' + name, val);

            let back2back_timeout;//todo defined in scope here, used by evt handlers
            //https://thekevinscott.com/emojis-in-javascript/
            //this does not catch complex Emoji!!
            // __hasEmoji = (str, len = str.length) => {//todo oneline
            //     while (len--) if (str.codePointAt(len) > 255) return 1;
            // },
            // __isOneChar = x => x.length === 1 || (x.length === 2 && __hasEmoji(x)),
            let __isOneChar = x => x.length === 1 || (x.length === 2 && x.codePointAt(0) > 255);

            super({
                $connectedCallback() {
                    //todo animate cardtentrance, random flip up/down left/right
                    if (___APP_LOGELEMENTS___) console.logCE(this);
                    cardt = this;//initialize me in constructor scope (can't assign this scope before super call!)
                    area = cardt.find(___CE_AREA___);//todo move to BaseElement init?
                    slot = cardt.find(___CE_SLOT___);
                    zone = cardt.find(___CE_ZONE___);
                    cardDIV = cardt.$query(___CARD_SELECTOR___)[0];
                    if (!cardDIV) console.error('missing', ___CARD_SELECTOR___);
                    cardDIV$classList = cardDIV.classList;
                    cardt.setAttribute(___DATAATTR___ + ___TAGSLOT___, slot ? slot.id : ___NONE___); // [CSS] has CARDTS-CARDT[data-slot="none"] to align Cardt without Slot in Zone
                    //cardt.setAttribute('draggable', 'true');

                    //if (name === ___ATTR_CONTENT___) cardt[___ATTR_FACETYPE___] = __isOneChar(newValue) ? 'char' : 'word';
                    cardt[___ATTR_FACETYPE___] = cardt.id.includes('/') ? 'img' : __isOneChar(cardt.id) ? 'char' : 'word';

                    cardt[___ATTR_STATE___] =
                        (zone && zone[___ATTR_STATE___])
                            ? zone[___ATTR_STATE___]
                            : ___STATE_face___;//default value
                    if (cardt.$Element_done) {
                        cardt.warn('CONNECTEDDONE!!', 'When moving to another Zone, what Cardt stuff needs to be reset ??');
                    } else {
                        //only if Cardt is NOT a clone animating!
                        if (!cardt.id.includes(___ATTR_ANIMATION___)) {
                            //___TRANSFORMEDCARDCLASS___ activates these CSS properties, they are used on child element .cardt!!
                            let offset = () => ___random([-2, -1, 0, 1, 2]) + 'px'; // APP_CARDT_RANDOM_OFFSET transform: translate X,Y position
                            cardDIVstyle$$setProperty(___translatex___, offset());
                            cardDIVstyle$$setProperty(___translatey___, offset());
                            cardDIVstyle$$setProperty(___rotate___, ___random([-1.5, -1, -.5, .5, 1, 1.5])) + 'deg';// every cardtis titlted
                            //add .transformed class to sloppy display card
                            cardDIV$classList.add(___TRANSFORMEDCARDCLASS___);//todo more generic function to better minify
                            //todo  $face for relevant children; No face slot specified, put plain characters or emoji in templated slot
                            if (zone) cardt[___LAYOUT___] = zone.getAttribute(___LAYOUT___); // LAYOUT is an observedAttribute
                        }//End Not animating Cardt
                        /** copy the .cardDIV Element attributes to the inner container so shadow DOM can be styled (with shadowDOM STYLE) **/
                        //!! also applies to the clone that is animating to another Zone
                        cardDIV.setAttribute(___ATTR_STATE___, cardt[___ATTR_STATE___]);
                        cardDIV.setAttribute(___ATTR_FACETYPE___, cardt[___ATTR_FACETYPE___]);
                    }//CONNECTEDDONE
                    /** eventlistener on this CARDTS-CARDT **/
                    if (zone && zone.getAttribute('listen') == 'memory') {
                        cardt.mute();
                        cardt.on('click', evt => {// click on this card
                            //TODO area.say(___ALLCARDS___, ___CLOSE___);// only dispatch  for a NEW cardtin set clicked
                            //OLD now needs eventbased --- area.setAttribute('opencount', ~~area.getAttribute('opencount') + 1);
                            cardt[___ATTR_STATE___] = ___STATE_face___;
                            cardt.error('listen', ___OPENCARDTS___);
                            cardt.on(area, ___OPENCARDTS___, evt => {// !! Every cardtgets the same _OPENCARDTS eventname when Area says OPENCARDTS all 2 (or 3..) functions execute
                                //receives actions: ___STATE_match___ , ___EVENT_ACTION_REMEMBERTHESE___
                                //mute(___OPENCARDTS___);// not required removed by the once:true option on addEventListener
                                console.error('opencards', evt.detail);
                                if (___isFunction(evt.detail)) {
                                    evt.detail(evt, cardt);
                                } else {
                                    cardt[___ATTR_ANIMATION___] = evt.detail;
                                    if (evt.detail === ___STATE_match___) {
                                        cardDIV$classList.remove(___TRANSFORMEDCARDCLASS___);
                                        cardt[___ATTR_STATE___] = ___STATE_match___; // in onfinish in match animation cardtexits area
                                    } else {
                                        back2back_timeout = setTimeout(() => {
                                            cardt[___ATTR_STATE___] = ___STATE_back___;
                                            if (___APP_CHEATMODE___) {
                                                cardDIVstyle$$setProperty(CSSback_beforecontent, '\'!\'');//!!pseudo content:var(--VAR) requires explicit string notation!
                                                cardDIVstyle$$setProperty(CSSback_color, '#050');
                                            }
                                        }, 1e3);
                                    }
                                }
                            }, {
                                    //New code triggers OPENCARDTS more times//once: 1  //listen once then autoremove listener
                                });
                            // !! Let the world know I was selected
                            cardt.say(___SELECTCARDT___, evt.type);//bubbles up to Area, no need to pass cardt, will be in event.target
                        });// click on this card

                        cardt.on(area, cardt[___ATTR_CARDTID___], evt => {// so all cards with SAME cardid respond
                            console.error('cardtheard:', cardt[___ATTR_CARDTID___], cardt[___ATTR_STATE___]);
                            let func = evt.detail;
                            if (___isFunction(func)) func(evt, cardt);
                            if (cardt[___ATTR_STATE___] == ___STATE_back___)
                                cardt[___ATTR_ANIMATION___] = ___eventName(___WHERECARDTS___);// this closed cardtreceived an Event, but was not clicked
                        });

                        cardt.on(area, ___ALLCARDTS___, evt => {
                            //
                            if (cardt[___ATTR_STATE___] == ___STATE_face___ && cardt[___ATTR_ANIMATION___] == ___REMEMBER___) {
                                cardt[___ATTR_STATE___] = ___STATE_back___;
                                clearTimeout(back2back_timeout);
                                cardt[___ATTR_ANIMATION___] = ___NONE___;
                            }
                        });
                    }// <<< if zone == memory
                },// <<< $connectedCallback()

                toid: id => cardt[___ATTR_ANIMATION___] = ['move:' + id],
                to: destZone => {
                    let slots = destZone.free();
                    if (slots) cardt.toid(slots[0].id);
                },

                ___CEattr(name, oldValue, newValue) {
                    //!!atribute changed runs BEFORE CONNECTEDCALLBACK for attributes set in HTML 
                    cardt = this;

                    /** copy the .cardDIV Element attributes to the inner container so shadow DOM can be styled (with shadowDOM STYLE) **/
                    if (cardDIV) [___ATTR_STATE___].map(attr => cardDIV.setAttribute(attr, cardt[attr]));

                    if (name === ___ATTR_ANIMATION___) {//todo else if? seems NOT to minify better
                        //https://css-tricks.com/additive-animation-web-animations-api/
                        //https://gibbok.github.io/animatelo/
                        //https://github.com/gibbok/animatelo
                        let keyframes, keyframeFunc, settings = { [DURATION]: 500 }, animation, finish = () => { };
                        let EASING = 'easing', EASE = 'ease', OPACITY = 'opacity';
                        let ___pixels       /**/ = x                    /**/ => x + 'px';
                        let ___duration     /**/ = x                    /**/ => x + 's';
                        let ___degrees      /**/ = x                    /**/ => x + 'deg';
                        let ___scale        /**/ = x                    /**/ => `scale(${String(x)})`;
                        let ___distance     /**/ = (dest, src, prop)    /**/ => dest[prop] - src[prop];
                        let ___translate3d  /**/ = (x, y, z)            /**/ => `translate3d(${x}px,${y}px,${z}px)`;
                        //cardt.todo(___ATTR_ANIMATION___, ' ► ' + newValue, settings);
                        if (newValue == ___NONE___) {
                            // @ts-ignore
                            if (animation) animation.cancel();
                            cardt.todo('Animation canceled', newValue);
                        } else if (newValue == ___eventName(___WHERECARDTS___)) {
                            keyframes = [[0, 0], [-1, 1], [1, 2], [-1, 3], [1, 4], [-1, 5], [1, 6], [-1, 7], [1, 8], [-1, 8], [1, 10]];//translatex , offset
                            keyframeFunc = data => ({ [TRANSFORM]: ___translate3d(data[0] * 10, 0, 0), [___OFFSET___]: data[1] / 10, [EASING]: [EASE] });
                            // } else if (newValue == 'ontop') {
                            //     destination = ___querySelector(document, '#FIRSTFREESLOT');//todo get first free slot
                            //     keyframes = [
                            //         { [TRANSFORM]: ___translateYX(0, 0) },
                            //         { [TRANSFORM]: ___translateYX(___distance(destination, cardt, OFFSETTOP), ___distance(destination, cardt, OFFSETLEFT)) }
                            //     ];
                        } else if (newValue == ___STATE_match___) {
                            keyframes = [[1, 0, ___NONE___], [0, 1, ___translate3d(20, 0, 0) + "rotate3d(0,0,1,120deg)"]];
                            keyframeFunc = data => ({ [OPACITY]: data[0], [___OFFSET___]: data[1], [EASING]: [EASE], [TRANSFORM]: data[2] });
                            finish = cardt.bye;
                        } else if (newValue == ___REMEMBER___) {
                            keyframes = [[1, 0], [1.3, .8], [1, 1]];
                            keyframeFunc = data => ({ [TRANSFORM]: ___scale(data[0]), [___OFFSET___]: data[1] });
                            settings = {
                                [DURATION]      /**/: 999,        // milliseconds
                                [EASING]        /**/: 'ease-in-out',  // 'linear', a bezier curve, etc.
                                //delay         /**/ : 10,            // milliseconds
                                //iterations      /**/: 1,          // Infinity, //or a number
                                //direction       /**/ : 'alternate', // 'normal', 'reverse', etc.
                                // @ts-ignore
                                fill            /**/: 'forwards'        // backwards, both, none, auto, forwards=remain at endframe
                                //endDelay:     //todo Learn
                                //composite:    //todo Learn
                            }
                        } else if (newValue.includes('move')) {
                            //finds a slot by animation="move:Table_1"
                            // todo make it work for a Zone also
                            let id = newValue.split(':')[1];
                            if (id) cardt.say(___FINDSLOT___, slot => {
                                console.error('new find slot event with id:', id);
                                let foundslot = zone.free(id);
                                if (foundslot.length) cardt.toslot(foundslot[0]);
                            });
                        }
                        if (keyframes) {
                            animation = cardt.animate(
                                keyframes.map(keyframeFunc),
                                settings
                            );
                            animation.onfinish = finish;
                            //animation.oncancel = () => { }
                        }
                    }// <<< name==ANIMATION
                }// <<< ___CE_attr
            })// <<< super
        }// <<< constructor CardtElement
    }//--------------******************-------------- CardtElement

    //================================================================================================================================
    //================================================================================================================================
    //================================================================================================================================
    /**
     *    _____ _ ____     ____                      _
     *   |  ___/ |___ \   / ___|___  _ __  ___  ___ | | ___
     *   | |_  | | __) | | |   / _ \| '_ \/ __|/ _ \| |/ _ \
     *   |  _| | |/ __/  | |__| (_) | | | \__ \ (_) | |  __/
     *   |_|   |_|_____|  \____\___/|_| |_|___/\___/|_|\___|
     *
     * @param {*} el 
     */

    let __initConsole = (el) => {
        console['log'](...function (//prevents accidental early delete by build process
        ) {
            /** init empty functions when console.log is removed by Uglify **/
            el.log = el.warn = el.todo = el.info = el.error = _ => { };
            return '';//([`%c initialized logging for ${el.nodeName} ${el.id}`.padEnd(90), 'background:pink']);
        }());

        /**
         * Use (regex) Filter in F12:
         * CE: = only diplay custom events
         * -CE: Anim = Not events, only labels with 'Anim*'
         **/
        function logconsole(args, typenr, bgcolor, color = 'black') {
            if (!___APP_LOGNOTHING___) {
                let appcss = BACKGROUND + ':lightgreen;color:black',
                    css = BACKGROUND + `:${bgcolor};color:${color}`,
                    first = args.shift(),
                    logconsole_linenr = window['logconsole_linenr'] || (window.logconsole_linenr = 0),
                    label = `%c ${document.title} ${window.logconsole_linenr++} %c ${el.nodeName.replace(___PREFIX___, '')} id:${el.id || '?'}`;

                if (el.nodeName == window.logconsoleline_label) {
                    label = '\t' + label;
                }
                window.logconsoleline_label = el.nodeName;

                console[['log', 'warn', 'info', 'error'][typenr]].apply(el,
                    (typeof first === 'object')
                        ? [label + ' Object ', appcss, css, first, ...args]
                        : [label + ' ' + first + ' ', appcss, css, ...args]
                );
            }
        }

        const _TYPE_LOG = 0;
        const _TYPE_WARN = 1;
        const _TYPE_INFO = 2;
        const _TYPE_ERROR = 3;

        el.logmin = el.log = function () {
            let args = [...arguments];
            let color = 'white';
            logconsole(args, _TYPE_LOG, ['indianred', 'forestgreen', 'steelblue', 'brown', 'black'][['AREA', 'ZONE', 'SLOT', 'CARDT'].map(x => x).indexOf(el.nodeName.replace(___PREFIX___, ''))], color);
        };

        el.todo = function () {//!! needs to be a function because => function can not access ...arguments
            let args = [...arguments];
            logconsole(['(todo)' + args.shift(), ...args], _TYPE_LOG, 'orangered', 'white');//0=log
        };
        el.warn = function () {
            let args = [...arguments];
            logconsole(args, _TYPE_WARN, 'orange');
        };
        el.info = function () {
            let args = [...arguments];
            logconsole(args, _TYPE_INFO, 'skyblue');
        };
        console.doc = el.doc = function () {
            logconsole([...['DOC', ...arguments]], _TYPE_ERROR, 'gold', 'black');
        };
        el.error = function () {
            logconsole([...arguments], _TYPE_ERROR, 'red', 'white');//3=error
        };
        el.hear = function () {
            let args = [...arguments];
            args[0] = el.id + ' event: ' + args[0];
            logconsole([...args], _TYPE_LOG, 'black', 'white');
        };
        return [];
        // @ts-ignore
        return ([`%c initialized logging for new element:${el.nodeName} id:${el.id}`.padEnd(90), 'background:maroon;color:white']);
    };//end F12 console enhancements

    console['assert'](//return true to not output anything to console
        (() => {
            let elements = new Map();
            let DOMElementCount = 0;                                        // count number of DOM elements available
            console.logCE = function () {
                let calledby = new Error().stack.split('\n')[2];            // get second line in trace
                let line = calledby.split('(')[0].replace('at', '').trim(); // discardtlinenrs
                line = line.replace('Function.', '');                       // cleanup
                line = line.replace('[as observedAttributes]', '');         // cleanup
                if (line.includes('HTMLElement.connec')) DOMElementCount++; // new Element available
                if (line.includes('HTMLElement.discon')) DOMElementCount--; // Element was removed
                line = line.replace('new ', 'constructor() ');              // cleanup

                let args = [...arguments];
                // @ts-ignore
                let label = `%c CE: ${String(DOMElementCount).padStart(2)} ${line} `;
                let first = args.shift();   // this scope?
                let data = '';
                if (first instanceof HTMLElement) {// yes this scope
                    label = label.replace('HTMLElement', ` ${first.nodeName} id:${first.id} ► `);
                    if (first.isConnected) data += 'isConnected'
                    if (first.$Element_done) data += ' DONE! ';
                    if (elements.has(first)) data += elements.get(first) ? ' Exists:' + elements.get(first) : '';
                    elements.set(first, DOMElementCount);
                } else {
                    if (typeof first === 'string') data = first;
                    else data = String(first).split(`\n`)[0];
                }
                // @ts-ignore
                let text = (label.padEnd(60) + data.padEnd(14)).padEnd(90);
                let textcolor = text.includes('!!') ? 'white;font-weight:bold;' : 'whitesmoke;';
                let paddingcolor = 'teal';
                if (text.includes('disconnected')) paddingcolor = 'red';
                else if (text.includes('connected')) paddingcolor = 'lightgreen';
                else if (text.includes('constructor')) paddingcolor = 'gold';
                console.log(text, `border-left:20px solid ${paddingcolor};background:teal;color:${textcolor};`, ...args);
            }
            return true//console.assert does not output line in console
        })()
    );// <<< console
    //================================================================================================================================
    //================================================================================================================================
    //================================================================================================================================

    //!!VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
    //? replace STR.includes(HAS) with shorter code
    // saves 5 bytes when used 4 times, but I think it makes the code less readable
    // let ___hasstring = (x, y) = x.includes(y);  
    //? could extend with a long unique name on the prototype and then do STR[MYINCLUDECONST](HAS)
    // if (!String.prototype.includes) {
    //     Object.defineProperty(String.prototype, //?MYINCLUDECONST, {
    //         value: function (search, start) {
    //             if (typeof start !== 'number') {
    //                 start = 0
    //             }

    //             if (start + search.length > this.length) {
    //                 return false
    //             } else {
    //                 return this.indexOf(search, start) !== -1
    //             }
    //         }
    //     })
    // }

    // todo Append TEMPLATE from main Document, if one is defined
    let __addTemplate = (selector, replace = false) => {
        let template = ___querySelector(document, selector);
        if (template) {
            //this.warn('attaching TEMPLATE: ' + template.id + ' in shadowRoot');
            let cloneTemplate = ___cloneNode(template.content);
            this[___EL_ROOT___].append(cloneTemplate);
            return cloneTemplate;
        } else {
            return false;
        }
    };
    //!!^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    //   ### ### ####### #######                                                                                                           
    //    #   #  #       #           ####  #       ####  #####    ##   #         #    #   ##   #####  #   ##   #####  #      ######  ####  
    //    #   #  #       #          #    # #      #    # #    #  #  #  #         #    #  #  #  #    # #  #  #  #    # #      #      #      
    //    #   #  #####   #####      #      #      #    # #####  #    # #         #    # #    # #    # # #    # #####  #      #####   ####  
    //    #   #  #       #          #  ### #      #    # #    # ###### #         #    # ###### #####  # ###### #    # #      #           # 
    //    #   #  #       #          #    # #      #    # #    # #    # #          #  #  #    # #   #  # #    # #    # #      #      #    # 
    //   ### ### #       #######     ####  ######  ####  #####  #    # ######      ##   #    # #    # # #    # #####  ###### ######  ####  

    //let $Elements_Set = window[___APPNAME___] = new Set();

    let ___random           /**/ = x      /**/ => Array.isArray(x) ? x[___random(x.length)] : 0 | x * Math.random();// random item from Array OR beteen 0 and x value
    let ___querySelector    /**/ = (x, y) /**/ => x.querySelector(y);// maybe just native code and replace with FART?
    let ___cloneNode        /**/ = x      /**/ => x.cloneNode(1);
    let ___isFunction       /**/ = x      /**/ => typeof x === 'function';
    let ___elementPosition = (
        el,
        //Uglify
        rect = el.getBoundingClientRect(),
        docElement = document.documentElement // todo shorten to window?
    ) => ({
        [TOP]: rect[TOP] + (window.pageYOffset || docElement[SCROLLTOP]),
        [LEFT]: rect[LEFT] + (window.pageXOffset || docElement[SCROLLLEFT]),
        [OFFSETLEFT]: el[OFFSETLEFT],
        [OFFSETTOP]: el[OFFSETTOP],
        [OFFSETHEIGHT]: el[OFFSETHEIGHT],
        [OFFSETWIDTH]: el[OFFSETWIDTH],
    });

    //JAVASCRIPT RESERVED NAMES - for better Uglify mangling
    //don't change, attributes need to be lowercase
    let LENGTH = 'length',//FART
        ATTRIBUTE = 'Attribute',//FART
        GETATTRIBUTE = 'get' + ATTRIBUTE,//FART
        SETATTRIBUTE = 'set' + ATTRIBUTE,//FART
        NODENAME = 'nodeName',//FART
        INNERHTML = 'innerHTML',//FART
        SETPROPERTY = 'setProperty',//FART
        STYLESHEETS = 'styleSheets',//FART
        STYLE = 'style',//FART
        ADDEVENTLISTENER = 'addEventListener',//FART
        INCLUDES = 'includes',//FART

        CHILDREN = 'children',
        GETELEMENTBYID = 'getElementById',
        PARENTNODE = 'parentNode',
        SHADOWROOT = 'shadowRoot',//FART
        GETPROPERTYVALUE = 'getPropertyValue',
        //ASSIGN = 'assign',//!! breaks assignedSlot

        ___OFFSET___ = 'offset',                // animation property
        POSITION = 'position',
        //ABSOLUTE = 'absolute',
        TRANSFORM = 'transform',
        DURATION = 'duration',
        OFFSETLEFT = ___OFFSET___ + 'Left',
        OFFSETTOP = ___OFFSET___ + 'Top',
        OFFSETHEIGHT = ___OFFSET___ + 'Height',
        OFFSETWIDTH = ___OFFSET___ + 'Width',
        TOP = 'top',
        LEFT = 'left',
        SCROLLTOP = 'scrollTop',
        SCROLLLEFT = 'scrollLeft',
        BACKGROUND = 'background',
        // UNDEFINED = 'undefined',
        VISIBILITY = 'visibility',
        APPENDCHILD = 'appendChild',
        REMOVECHILD = 'removeChild',
        CREATEELEMENT = 'createElement',
        ZINDEX = 'z-index',
        // PREVENTDEFAULT = 'preventDefault',
        // CONSTRUCTOR = 'constructor',
        ISCONNECTED = 'isConnected',// true for elements connected to DOM
        FILTER = 'filter';

    let ___NONE___ = 'none';
    //JavaScript Computed Keys        

    //Application
    let ___DATAATTR___ = 'data-';//1
    // APPLICATION CONFIGURATION
    let ___EL_ROOT___ = '$Element_Root';                    // property on Custom Element point to lightDOM or shadowRoot
    let ___PREFIX___ = ___APPNAME___ + '-';

    //Custom Element properties that can be minified because they are internal references
    let ___internal_INITIALHTML___ = 'lDOM';


    let ___APP_CHEATMODE___ = 1;        // at how many cards the matching cards reveal themselves
    let APP_ZONEANIMATIONSPEED = 200;

    // APPLICATION CONSTANTS
    // Custom Element attributes may be used in the outside world
    let ___ATTR_CONTENT___              /**/ = 'content';
    let ___ATTR_WIDTH___                /**/ = 'width';             // todo Width x Height were attributes on zone
    let ___ATTR_HEIGHT___               /**/ = 'height';
    let ___ATTR_STATE___                /**/ = 'state';             // [observed]
    let ___ATTR_CARDTSIZE___             /**/ = 'cardsize';
    let ___ATTR_SLOTSTO___              /**/ = 'slotsto';           // slotsto="SLOT" indicates if items in a Zone are forced into this slottype (default CARDTS-SLOT)
    let ___ATTR_MAX___                  /**/ = 'max';               // maximum nummber of slots in a Zone, on init the SLOTSNAME slots are create
    let ___ATTR_FACETYPE___             /**/ = 'facetype';          // [CSS]!! cardt face is a: char,img,word
    let ___COLOR___                     /**/ = 'color';
    let ___CSSProp_INDEX___             /**/ = 'index';             // [CSS]!
    let ___ATTR_ANIMATION___            /**/ = 'animation';         //!! can't rename to animate conflicts with el.animate()
    let ___LAYOUT___                    /**/ = 'layout';            // [CSS]
    let ___offsety___                   /**/ = ___OFFSET___ + 'y';  // [CSS]
    let ___offsetx___                   /**/ = ___OFFSET___ + 'x';  // [CSS]
    let ___rotate___                    /**/ = 'rotate';            // [CSS]
    let ___translatex___                /**/ = 'translatex';        // [CSS]
    let ___translatey___                /**/ = 'translatey';        // [CSS]
    let ___translate3d___               /**/ = 'translate3d';       // [CSS]

    //MemoryGame attributes
    let ___ATTR_CARDTID___               /**/ = 'id';                // change with care, might break code, yes Duplicate ids rule in this app
    let ___CARDTS___                     /**/ = 'cards';
    let ___CARD_SELECTOR___             /**/ = '.card';             // used in HTML & CSS !! inner DIV classname containing the card
    let ___MATCHCOUNT___                /**/ = 'matchcount';        // [fixed]
    let ___STATE_face___                /**/ = 'face';              // [CSS] [EVENT] [SLOT]
    let ___STATE_back___                /**/ = 'back';              // [CSS]
    let ___STATE_match___               /**/ = 'match';             // [CSS] [EVENT]

    // attributes applied to ALL Cardts Elements //todo add more
    let ___CSSPropertiesAttributes___ = [___LAYOUT___, ___ATTR_STATE___, ___offsety___, ___offsetx___, ___rotate___, ___translatey___, ___translatex___];

    //!!==================================================================================================
    //!! settings matching CSS in STYLEs
    let ___TRANSFORMEDCARDCLASS___      /**/ = 'transform'; // [CSS] in TEMPLATE CARDTS-CARDT //todo use standard 'transform' for better minify

    //static CSS variables mathing with declaration in STYLE element
    //todo is still in HTML/STYLE let CSScard_boxshadowColor = 'card_boxshadowColor';

    let CSSface_color                   /**/ = 'Fclr';      //bit cryptic without vowels.. we are saving bytes
    let CSSface_background              /**/ = 'Fbgd';
    let CSSface_borderColor             /**/ = 'FbrdrClr';
    let CSSface_fontsize                /**/ = 'Ffntsz';

    let CSSback_background              /**/ = 'Bbgd';
    let CSSback_color                   /**/ = 'Bclr';
    let CSSback_hoverColor              /**/ = 'BhvrClr';
    let CSSback_beforecontent           /**/ = 'Bcntnt';
    //!!==================================================================================================

    //------------------------------------------------------------------------------------------------------------------------------------------------------
    let ___EVENT_PREFIX___ = ___APPNAME___ + '_';
    let ___eventName = idx => [
        ___EVENT_PREFIX___ + 'ALLELEMENTS',      /* = 0 */
        ___EVENT_PREFIX___ + 'ALL'               /* = 1 */,
        ___EVENT_PREFIX___ + 'SELECT'            /* = 2 */,
        ___EVENT_PREFIX___ + 'REMEMBER'          /* = 3 */,
        ___EVENT_PREFIX___ + 'PEEKCARDTS'         /* = 4 */,
        ___EVENT_PREFIX___ + 'OPENCARDTS'         /* = 5 */,
        ___EVENT_PREFIX___ + 'CLOSE'             /* = 6 */,
        ___EVENT_PREFIX___ + 'FINDSLOT'          /* = 7 */,
        ___EVENT_PREFIX___ + 'CONNECT'           /* = 8 */,
        ___EVENT_PREFIX___ + 'DISCONNECT'        /* = 9 */
    ][idx];//!! do not concat strings, code relies on function returning undefined for numbers that don't exist
    // eventNR
    let ___ALLELEMENTS___               /**/ = 0;
    let ___ALLCARDTS___                  /**/ = 1;
    let ___SELECTCARDT___                /**/ = 2;
    let ___REMEMBER___                  /**/ = 3;
    let ___WHERECARDTS___                /**/ = 4;// send to cards with same id to cheat
    let ___OPENCARDTS___                 /**/ = 5;
    let ___CLOSE___                     /**/ = 6;
    let ___FINDSLOT___                  /**/ = 7;
    let ___CONNECT___                   /**/ = 8;
    let ___DISCONNECT___                /**/ = 9;

    //0 for no logging, all are removed in Uglified code
    let ___APP_LOGNOTHING___            /**/ = 1;
    let ___APP_LOGLISTENERS___          /**/ = 1;
    let ___APP_LOGDOMEVENTS___          /**/ = 0;
    let ___APP_LOGEVENTS___             /**/ = 1;
    let ___APP_LOGELEMENTS___           /**/ = 0;
    let ___APP_LOGSLOTS___              /**/ = 0;
    let ___APP_LOGPROPS___              /**/ = 0;
    let ___APP_LOGATTR___               /**/ = 0;  // show attributes changes
    let ___APP_LOGATTRINIT___           /**/ = 0;  // show initial value of attributes
    let ___APP_LOGANIMATION___          /**/ = 0;

    //------------------------------------------------------------------------------------------------------------------------------------------------------
    let ___TAGSLOT___ = 'Slot';
    let ___CE_AREA___ = ___PREFIX___ + 'AREA';  //todo used 2 times to find parent AREA container, merge into one statement on BaseElement?
    let ___CE_ZONE___ = ___PREFIX___ + 'ZONE';
    let ___CE_SLOT___ = ___PREFIX___ + 'SLOT';
    let ___CE_CARDT___ = ___PREFIX___ + 'CARDT';

    let lower = x => x.toLowerCase();

    let ElementsName = 'Elements';
    let CARDTS = window[___APPNAME___] = window[___APPNAME___] || {}
    CARDTS[ElementsName] = CARDTS[ElementsName] || {};
    CARDTS.extend = (
        source,
        name,
        classFactory,
        prefix = ___PREFIX___
    ) => {
        try {
            customElements.define(
                lower(prefix + name),
                CARDTS[ElementsName][lower(name)] = classFactory(CARDTS[ElementsName][lower(source)])
            );
            console.log('extended', name, 'from:', source)
        } catch (e) {
            console.error(___PREFIX___, 'extend error:', e);
        }
    }

    [['AREA', AreaElement],
    ['ZONE', ZoneElement],
    [___TAGSLOT___, SlotElement],
    ['CARDT', CardtElement]]
        // @ts-ignore
        .map(newElement => {
            let elementTag = lower(newElement[0]);
            let elementName = lower(___PREFIX___ + elementTag);
            CARDTS[ElementsName][elementTag] = newElement[1];
            customElements.define(elementName, newElement[1])
        })

})(window, document, Object, String);