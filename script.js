let quotes = [];
let currentQuoteIndex = -1;
let isAnimating = false;
let isFirstQuote = true;
let splitInstance = null;
let authorSplitInstance = null;

const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');
const nextBtn = document.getElementById('next-btn');

async function init() {
    console.log('Initializing app...');
    try {
        const response = await fetch('quotes.json');
        quotes = await response.json();
        console.log(`Loaded ${quotes.length} quotes.`);
        showNextQuote();
    } catch (error) {
        console.error('Error loading quotes:', error);
        quoteTextElement.innerText = "COULD NOT LOAD QUOTES.";
    }
}

function showNextQuote() {
    console.log('showNextQuote called. isAnimating:', isAnimating);
    if (isAnimating && quotes.length > 0) return;
    
    if (quotes.length === 0) {
        console.warn('No quotes available to show.');
        return;
    }

    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * quotes.length);
    } while (nextIndex === currentQuoteIndex && quotes.length > 1);

    currentQuoteIndex = nextIndex;
    const { quote, author } = quotes[currentQuoteIndex];
    
    console.log(`Selected quote index: ${currentQuoteIndex}, isFirst: ${isFirstQuote}`);

    if (isFirstQuote) {
        isFirstQuote = false;
        displayQuote(quote, author);
    } else {
        isAnimating = true;
        animateOut(() => displayQuote(quote, author));
    }
}

function displayQuote(quote, author) {
    console.log('Displaying new quote...');
    
    // Cleanup previous splits if they exist
    if (splitInstance) splitInstance.revert();
    if (authorSplitInstance) authorSplitInstance.revert();

    quoteTextElement.innerText = quote;
    quoteAuthorElement.innerText = `- ${author}`;

    // Reset visibility
    gsap.set([quoteTextElement, quoteAuthorElement], { opacity: 1 });

    // Create new splits
    splitInstance = new SplitType('#quote-text', { types: 'lines, words' });
    authorSplitInstance = new SplitType('#quote-author', { types: 'lines' });

    gsap.set('.line', { overflow: 'hidden' });

    const tl = gsap.timeline({
        onComplete: () => {
            console.log('Animation IN complete.');
            isAnimating = false;
        }
    });

    tl.from(splitInstance.words, {
        y: 200,
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power4.out",
        skewY: 10
    })
    .from(authorSplitInstance.lines, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.5");
}

function animateOut(callback) {
    console.log('Animating out...');
    const tl = gsap.timeline({
        onComplete: () => {
            console.log('Animation OUT complete.');
            callback();
        }
    });

    // Animate words out (if they exist)
    const words = document.querySelectorAll('.word');
    if (words.length > 0) {
        tl.to(words, {
            y: -200,
            opacity: 0,
            duration: 0.5,
            stagger: 0.02,
            ease: "power4.in"
        });
    } else {
        // Fallback if no words found
        tl.to(quoteTextElement, { opacity: 0, duration: 0.3 });
    }

    tl.to(quoteAuthorElement, {
        opacity: 0,
        duration: 0.3
    }, "-=0.3");
}

nextBtn.addEventListener('click', () => {
    console.log('Next button clicked');
    showNextQuote();
});

init();
