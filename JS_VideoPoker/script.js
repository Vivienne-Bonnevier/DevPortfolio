/*initialize an undefined deckID*/
let deckID = ""
/*initialize starting credits*/
window.credits = 1000
document.getElementById("para_credval").innerHTML=window.credits
/*event listeners for buttons: activate when clicked*/
document.getElementById("draw").addEventListener("click", play)
document.getElementById("redraw").addEventListener("click",part2)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*starts a round, deducts credits, updates credit UI, and swaps buttons*/
function play(){
    let deck = draw()
    window.credits -= 100
    credit()
    buttonSwap()
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*drawing function. Generates a deck if needed, then draws 5 cards,
inserts the loading gif or card png as needed*/
async function draw(){
    if (window.deck === undefined){
        /*when I tried doing 'let apiurl' here, it didn't work. 
        I realized that's because 'let' has a block scope. var solves that at least*/
        var apiurl = "https://deckofcardsapi.com/api/deck/new/draw/?count=5"
        console.log("Creating new deck")
    }
    else {
        /*if a deck is already generated, it's nice to keep using that deck.
        I felt bad generating a ton of decks over and over while testing
        and wanted to get better at re-using the same one per refresh*/
        var apiurl = "https://deckofcardsapi.com/api/deck/"+window.deck["deck_id"]+"/draw/?count=5"
        console.log("Using deck: "+window.deck["deck_id"])
        /*shuffle the deck*/
        console.log("shuffling...")
        document.getElementById("loadinghere").style.display = "inline"
        let shuffle = await fetch("https://deckofcardsapi.com/api/deck/"+window.deck["deck_id"]+"/shuffle/")
        let shuffleComplete = await shuffle.json()
        document.getElementById("loadinghere").style.display = "none"
    }
    for (let i=0; i<5; i++){
        awaitingCard(i)
    }
    let response = await fetch(apiurl)
    let deck = await response.json()
    /*=======================================Test code below for testing of scoring.=======================================*/
    //deck=RF()
    //deck=SF()
    //deck=FOAK()
    //deck=FH()
    //deck=F()
    //deck=S()
    /*=====================================================================================================================*/
    console.log(deck)
    window.deck = deck
    sortHand(1)
    for (let i=0; i<5; i++){
        loadCard(i,deck)
    }
    changeResults("What to KEEP and what to REPLACE?")
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Called when the redraw button is pressed. Runs redraw with a callback to the sortAndScore function*/
function part2(){
    redraw(sortAndScore)
}
/*Checks which cards are to be replaced and swaps them with a newly drawn card.
Also resets the drop down back to keep.*/
async function redraw(sortAndScore){
    for (let i=0; i<5; i++){
        awaitingCard(i)
        if (document.getElementById("k"+String(i+1)).value=="k"+String(i+1)+"r"){
            let response = await fetch("https://deckofcardsapi.com/api/deck/"+deck["deck_id"]+"/draw/?count=1")
            let card = await response.json()
            console.log("slot "+String(i+1)+" new card:")
            console.log(card)
            window.deck["cards"][i]=card["cards"][0]
            document.getElementById("k"+String(i+1)).selectedIndex = 0
        }
    }
    sortAndScore()
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*place the image of a card object into the card slot*/
function loadCard(i,deck){
    document.getElementById("div_c"+String(i+1)).innerHTML=`<img src="`+deck["cards"][i]["image"]+`">`
}
/*substitutes the card slot with a loading gif*/
function awaitingCard(i){
    document.getElementById("div_c"+String(i+1)).innerHTML=`<img src="loading.gif">`
}
/*update the credits in the top-left*/
function credit(){
    document.getElementById("para_credval").innerHTML=window.credits
}
/*changes the text in the result box*/
function changeResults(text){
    document.getElementById("para_results").innerHTML=text
}
/*toggles between drawing and redrawing. Both HTML elements are always
present, but by changing their visibility, the code runs well and 
it keeps the player from starting a new hand before finishing a round*/
function buttonSwap(){
    console.log("trying button swap...")
    if (document.getElementById("draw").style.display === "none"){
        document.getElementById("draw").style.display = "inline"
        document.getElementById("redraw").style.display = "none"
        console.log("redraw now hidden, draw visible")
    }
    else {
        document.getElementById("draw").style.display = "none"
        document.getElementById("redraw").style.display = "inline"
        console.log("draw now hidden, redraw visible")
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*sort the hand, which makes it easier for the player to deal with 
and also easier to score.*/
function sortHand(whichSort){
    console.log("attempting sort "+whichSort)
    /*assign each card a score based on hierarchy*/
    /*1-10 are easy, but for the royals and ace we just go higher*/
    for (let i=0; i<5; i++){
        let valcheck=window.deck["cards"][i]["value"]
        window.deck["cards"][i]["score"]=0
        if (valcheck==="ACE"){
            score=14
        }
        else if (valcheck==="KING"){
            score=13
        }
        else if (valcheck==="QUEEN"){
            score=12
        }
        else if (valcheck==="JACK"){
            score=11
        }
        else {
            score=parseInt(valcheck)
        }
        window.deck["cards"][i]["score"]=score
    }
    /*sort the array by using the score we created*/
    /*originally I was going to write my own selection sort
    using a nested for loop in a for loop,
    but that was a lot of work for something JavaScript already does
    pretty well. So I just used built in sorting instead*/
    window.deck["cards"].sort((a,b) => a.score - b.score)
    console.log("after sort")
    console.log(window.deck)
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sortAndScore(){
    console.log("after swap and load:")
    console.log(window.deck)
    sortHand(2)
    for (let i=0; i<5; i++){
        loadCard(i,window.deck)
    }
    scoreHand()
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*Scores the current hand, looking for the highest set and then dishing out rewards as applicable
This logic assumes that the hand is sorted in ascending order (starting at 2 and working up to ace*/
function scoreHand(){
    let card=window.deck["cards"]
    var result
    var loot
    //ROYAL FLUSH
    /*Variant of a Straight Flush where the cards go 10-J-Q-K-A
    Logically, it's the same logic of a Straight Flush but card[0[score]==10*/
    if((card[0]["score"]==10)&&((card[0]["score"]==(card[1]["score"]-1))&&(card[1]["score"]==(card[2]["score"]-1))&&(card[2]["score"]==(card[3]["score"]-1))&&(card[3]["score"]==(card[4]["score"]-1)))&&((card[0]["suit"]===card[1]["suit"])&&(card[1]["suit"]===card[2]["suit"])&&(card[2]["suit"]===card[3]["suit"])&&(card[3]["suit"]===card[4]["suit"]))){
        result="Royal Flush! Won 5000 Credits"
        loot=5000
    }
    //STRAIGHT FLUSH
    /*Basically, just need to combine the logic of a Straight and Flush with an && operator
    Make sure cards are sequential and same suit.*/
    else if(((card[0]["score"]==(card[1]["score"]-1))&&(card[1]["score"]==(card[2]["score"]-1))&&(card[2]["score"]==(card[3]["score"]-1))&&(card[3]["score"]==(card[4]["score"]-1)))&&((card[0]["suit"]===card[1]["suit"])&&(card[1]["suit"]===card[2]["suit"])&&(card[2]["suit"]===card[3]["suit"])&&(card[3]["suit"]===card[4]["suit"]))){
        result="Straight Flush! Won 3000 Credits"
        loot=3000
    }
    //FOUR OF A KIND
    /*Can check with the transitive property that a=b, b=c, and c=d.
    This can be checked for cards 0-3 and 1-4*/
    else if(((card[0]["score"]==card[1]["score"])&&(card[1]["score"]==card[2]["score"])&&(card[2]["score"]==card[3]["score"]))||((card[1]["score"]==card[2]["score"])&&(card[2]["score"]==card[3]["score"])&&(card[3]["score"]==card[4]["score"]))){
        result="Four of a Kind! Won 1500 Credits"
        loot=1500
    }
    //FULL HOUSE
    /*Checking for a full house: If the first two cards match, then the last 3 should match each other. 
    If the last two cards match, the first 3 should match.*/
    else if(((card[0]["score"]==card[1]["score"])&&((card[2]["score"]==card[3]["score"])&&(card[3]["score"]==card[4]["score"])))||((card[3]["score"]==card[4]["score"])&&((card[0]["score"]==card[1]["score"])&&(card[1]["score"]==card[2]["score"])))){
        result="Full House! Won 1200 Credits"
        loot=1200
    }
    //FLUSH
    /*Check if all cards have the same suit. This can be done with ==== and the card's "suit" value
    This also uses the transitive property, using suits for the logic:
    If a and b have the same suit, and b and c have the same suit,
    then a and c have the same suit as well*/
    else if((card[0]["suit"]===card[1]["suit"])&&(card[1]["suit"]===card[2]["suit"])&&(card[2]["suit"]===card[3]["suit"])&&(card[3]["suit"]===card[4]["suit"])){
        result="Flush! Won 1000 Credits"
        loot=1000
    }
    //STRAIGHT
    /*Check if each card's "score" value is 1 less than the card after it
    Card0 is one less than Card1, AND Card1 is one less than Card2, etc*/
    else if((card[0]["score"]==(card[1]["score"]-1))&&(card[1]["score"]==(card[2]["score"]-1))&&(card[2]["score"]==(card[3]["score"]-1))&&(card[3]["score"]==(card[4]["score"]-1))){
        result="Straight! Won 800 Credits"
        loot=800
    }
    //THREE OF A KIND
    /*Using the transitive property (if a=b and b=c, then a=c),
    checking for a 3 of a kind is simple enough if all checks above fail.
    This logic checks if there are matches in the first 3, middle 3, or last 3 cards.*/
    else if(((card[0]["score"]==card[1]["score"])&&(card[1]["score"]==card[2]["score"]))||((card[1]["score"]==card[2]["score"])&&(card[2]["score"]==card[3]["score"]))||((card[2]["score"]==card[3]["score"])&&(card[3]["score"]==card[4]["score"]))){
        result="Three of a Kind! Won 500 Credits"
        loot=500
    }
    //TWO PAIR
    /*since there are only 5 cards and they are sorted, 
    this logic checks for 2 pairs if all other checks above fail*/
    else if((card[0]["score"]==card[1]["score"]&&(card[2]["score"]==card[3]["score"]||card[3]["score"]==card[4]["score"]))||((card[1]["score"]==card[2]["score"])&&(card[3]["score"]==card[4]["score"]))){
        result="Two Pair! Won 300 Credits"
        loot=300
    }
    //LOSS
    /*No matches means a loss. Let the player know and grant no loot*/
    else {
        result="Sorry, you lost. Play again!"
        loot=0
    }
    changeResults(result)
    window.credits+=loot
    credit()
    buttonSwap()
    /*it wasnt a requirement but to be honest, I think itd be really easy to check for a royal flush as well.
    Using the logic for a straight flush, I can just add an && operator to check the score of one of the cards:
    for example, checking if card[0][score]==10. if Card0 is a 10, and all of the cards' scores increase by 1 each, 
    and share all cards share the same suit, then that is a royal flush*/
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*testing things with brute force and blind luck is hard, 
so I've constructed some test objects here to copy+plug into the code for testing.

I just looked at the basic structure of the cards in the object in order to specify which I want.

I know this can't possibly account for every possible combination of cards but its still helpful*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Royal Flush
function RF(){
    let deck=JSON.parse(`{
        "success": true,
        "deck_id": "wikp966lz67u",
        "cards": [
            {
                "code": "0H",
                "image": "https://deckofcardsapi.com/static/img/0H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/0H.svg",
                    "png": "https://deckofcardsapi.com/static/img/0H.png"
                },
                "value": "10",
                "suit": "HEARTS",
                "score": 10
            },
            {
                "code": "JH",
                "image": "https://deckofcardsapi.com/static/img/JH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/JH.svg",
                    "png": "https://deckofcardsapi.com/static/img/JH.png"
                },
                "value": "JACK",
                "suit": "HEARTS",
                "score": 11
            },
            {
                "code": "QH",
                "image": "https://deckofcardsapi.com/static/img/QH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QH.svg",
                    "png": "https://deckofcardsapi.com/static/img/QH.png"
                },
                "value": "QUEEN",
                "suit": "HEARTS",
                "score": 12
            },
            {
                "code": "KH",
                "image": "https://deckofcardsapi.com/static/img/KH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/KH.svg",
                    "png": "https://deckofcardsapi.com/static/img/KH.png"
                },
                "value": "KING",
                "suit": "HEARTS",
                "score": 13
            },
            {
                "code": "AH",
                "image": "https://deckofcardsapi.com/static/img/AH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/AH.svg",
                    "png": "https://deckofcardsapi.com/static/img/AH.png"
                },
                "value": "ACE",
                "suit": "HEARTS",
                "score": 14
            }
        ],
        "remaining": 47
    }`)
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Straight Flush
function SF(){
    let deck=JSON.parse(`{
        "success": true,
        "deck_id": "wikp966lz67u",
        "cards": [
            {
                "code": "4H",
                "image": "https://deckofcardsapi.com/static/img/4H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/4H.svg",
                    "png": "https://deckofcardsapi.com/static/img/4H.png"
                },
                "value": "4",
                "suit": "HEARTS",
                "score": 4
            },
            {
                "code": "5H",
                "image": "https://deckofcardsapi.com/static/img/5H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/5H.svg",
                    "png": "https://deckofcardsapi.com/static/img/5H.png"
                },
                "value": "5",
                "suit": "HEARTS",
                "score": 5
            },
            {
                "code": "6H",
                "image": "https://deckofcardsapi.com/static/img/6H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/6H.svg",
                    "png": "https://deckofcardsapi.com/static/img/6H.png"
                },
                "value": "6",
                "suit": "HEARTS",
                "score": 6
            },
            {
                "code": "7H",
                "image": "https://deckofcardsapi.com/static/img/7H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/7H.svg",
                    "png": "https://deckofcardsapi.com/static/img/7H.png"
                },
                "value": "7",
                "suit": "HEARTS",
                "score": 7
            },
            {
                "code": "8H",
                "image": "https://deckofcardsapi.com/static/img/8H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/8H.svg",
                    "png": "https://deckofcardsapi.com/static/img/8H.png"
                },
                "value": "8",
                "suit": "HEARTS",
                "score": 8
            }
        ],
        "remaining": 47
    }`)
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Four of a Kind
function FOAK(){
    let deck=JSON.parse(`{
        "success": true,
        "deck_id": "wikp966lz67u",
        "cards": [
            {
                "code": "QS",
                "image": "https://deckofcardsapi.com/static/img/QS.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QS.svg",
                    "png": "https://deckofcardsapi.com/static/img/QS.png"
                },
                "value": "QUEEN",
                "suit": "SPADES",
                "score": 12
            },
            {
                "code": "QH",
                "image": "https://deckofcardsapi.com/static/img/QH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QH.svg",
                    "png": "https://deckofcardsapi.com/static/img/QH.png"
                },
                "value": "QUEEN",
                "suit": "HEARTS",
                "score": 12
            },
            {
                "code": "QD",
                "image": "https://deckofcardsapi.com/static/img/QD.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QD.svg",
                    "png": "https://deckofcardsapi.com/static/img/QD.png"
                },
                "value": "QUEEN",
                "suit": "DIAMONDS",
                "score": 12
            },
            {
                "code": "QC",
                "image": "https://deckofcardsapi.com/static/img/QC.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QC.svg",
                    "png": "https://deckofcardsapi.com/static/img/QC.png"
                },
                "value": "QUEEN",
                "suit": "CLUBS",
                "score": 12
            },
            {
                "code": "AH",
                "image": "https://deckofcardsapi.com/static/img/AH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/AH.svg",
                    "png": "https://deckofcardsapi.com/static/img/AH.png"
                },
                "value": "ACE",
                "suit": "HEARTS",
                "score": 14
            }
        ],
        "remaining": 47
    }`)
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Full House
function FH(){
    let deck=JSON.parse(`{
        "success": true,
        "deck_id": "wikp966lz67u",
        "cards": [
            {
                "code": "QS",
                "image": "https://deckofcardsapi.com/static/img/QS.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QS.svg",
                    "png": "https://deckofcardsapi.com/static/img/QS.png"
                },
                "value": "QUEEN",
                "suit": "SPADES",
                "score": 12
            },
            {
                "code": "QH",
                "image": "https://deckofcardsapi.com/static/img/QH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QH.svg",
                    "png": "https://deckofcardsapi.com/static/img/QH.png"
                },
                "value": "QUEEN",
                "suit": "HEARTS",
                "score": 12
            },
            {
                "code": "QD",
                "image": "https://deckofcardsapi.com/static/img/QD.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/QD.svg",
                    "png": "https://deckofcardsapi.com/static/img/QD.png"
                },
                "value": "QUEEN",
                "suit": "DIAMONDS",
                "score": 12
            },
            {
                "code": "AC",
                "image": "https://deckofcardsapi.com/static/img/AC.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/AC.svg",
                    "png": "https://deckofcardsapi.com/static/img/AC.png"
                },
                "value": "ACE",
                "suit": "CLUBS",
                "score": 14
            },
            {
                "code": "AH",
                "image": "https://deckofcardsapi.com/static/img/AH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/AH.svg",
                    "png": "https://deckofcardsapi.com/static/img/AH.png"
                },
                "value": "ACE",
                "suit": "HEARTS",
                "score": 14
            }
        ],
        "remaining": 47
    }`)
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Flush
function F(){
    let deck=JSON.parse(`{
        "success": true,
        "deck_id": "wikp966lz67u",
        "cards": [
            {
                "code": "2H",
                "image": "https://deckofcardsapi.com/static/img/2H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/2H.svg",
                    "png": "https://deckofcardsapi.com/static/img/2H.png"
                },
                "value": "2",
                "suit": "HEARTS",
                "score": 2
            },
            {
                "code": "4H",
                "image": "https://deckofcardsapi.com/static/img/4H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/4H.svg",
                    "png": "https://deckofcardsapi.com/static/img/4H.png"
                },
                "value": "4",
                "suit": "HEARTS",
                "score": 4
            },
            {
                "code": "6H",
                "image": "https://deckofcardsapi.com/static/img/6H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/6H.svg",
                    "png": "https://deckofcardsapi.com/static/img/6H.png"
                },
                "value": "6",
                "suit": "HEARTS",
                "score": 6
            },
            {
                "code": "7H",
                "image": "https://deckofcardsapi.com/static/img/7H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/7H.svg",
                    "png": "https://deckofcardsapi.com/static/img/7H.png"
                },
                "value": "7",
                "suit": "HEARTS",
                "score": 7
            },
            {
                "code": "AH",
                "image": "https://deckofcardsapi.com/static/img/AH.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/AH.svg",
                    "png": "https://deckofcardsapi.com/static/img/AH.png"
                },
                "value": "ACE",
                "suit": "HEARTS",
                "score": 14
            }
        ],
        "remaining": 47
    }`)
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Straight
function S(){
    let deck=JSON.parse(`{
        "success": true,
        "deck_id": "wikp966lz67u",
        "cards": [
            {
                "code": "2H",
                "image": "https://deckofcardsapi.com/static/img/2H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/2H.svg",
                    "png": "https://deckofcardsapi.com/static/img/2H.png"
                },
                "value": "2",
                "suit": "HEARTS",
                "score": 2
            },
            {
                "code": "3S",
                "image": "https://deckofcardsapi.com/static/img/3S.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/3S.svg",
                    "png": "https://deckofcardsapi.com/static/img/3S.png"
                },
                "value": "3",
                "suit": "SPADES",
                "score": 3
            },
            {
                "code": "4H",
                "image": "https://deckofcardsapi.com/static/img/4H.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/4H.svg",
                    "png": "https://deckofcardsapi.com/static/img/4H.png"
                },
                "value": "4",
                "suit": "HEARTS",
                "score": 4
            },
            {
                "code": "5D",
                "image": "https://deckofcardsapi.com/static/img/5D.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/5D.svg",
                    "png": "https://deckofcardsapi.com/static/img/5D.png"
                },
                "value": "5",
                "suit": "DIAMONDS",
                "score": 5
            },
            {
                "code": "6C",
                "image": "https://deckofcardsapi.com/static/img/6C.png",
                "images": {
                    "svg": "https://deckofcardsapi.com/static/img/6C.svg",
                    "png": "https://deckofcardsapi.com/static/img/6C.png"
                },
                "value": "6",
                "suit": "CLUBS",
                "score": 6
            }
        ],
        "remaining": 47
    }`)
    return deck
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*I don't have test functions for three of a kind and two pair just because they're 
easy to get with blind luck*/