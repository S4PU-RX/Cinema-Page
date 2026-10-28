const API_KEY = '3c5d2154825dde5f0c9146a11f3d9081';
const URL_NOW_SHOWING = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en`;
const URL_IMAGE_BASE = `https://image.tmdb.org/t/p/original`;


let moviesList = [];
let currentIndex = 0;
let carrouselInterval;
let isLocked = false; //prevents banners from cycling too quickly, avoiding a bug where they switch infinitely//
const bannerContainer = document.querySelector('.carrosel-banner');

async function showMovies() {
    try{
        const response = await fetch(URL_NOW_SHOWING);

        if (!response.ok){
            throw new Error(`Requisition error: ${response.status}`);
        }

        const data = await response.json();
        moviesList = data.results;

        if(moviesList && moviesList.length > 0){
            updateBanner(currentIndex);
            startAutoSlide();
        }
    }
    catch (error){
        console.error("failed to load movies from TMDb", error);
    }
}

function updateBanner(index){
    const movie = moviesList[index];
    if (!movie) return;

    const bannerImage = URL_IMAGE_BASE + movie.backdrop_path;
    const imgElement = document.querySelector('.banner-img');
    const titleElement = document.getElementById('banner-title');
    const overviewElement = document.getElementById('banner-overview');

    if(imgElement){
        imgElement.src = bannerImage;
    }
    if(titleElement){
        titleElement.textContent = movie.title;
    }
    if(overviewElement){
        overviewElement.textContent = movie.overview;
    }
            
}

function nextMovie(){
    if(isLocked) return;
    isLocked = true;

    currentIndex = (currentIndex + 1) % moviesList.length;
    updateBanner(currentIndex);

    setTimeout(() => {isLocked = false}, 1200);
}

function prevMovie(){
    if(isLocked) return;
    isLocked = true;

    currentIndex = (currentIndex - 1 + moviesList.length) % moviesList.length;
    updateBanner(currentIndex);

    setTimeout(() => {isLocked = false}, 2000);
}

bannerContainer.addEventListener('mouseenter', () =>
    {if (carrouselInterval) clearInterval(carrouselInterval);}
)

bannerContainer.addEventListener('mouseleave', () => {startAutoSlide()})

function startAutoSlide(){

    carrouselInterval = setInterval(() => {
        nextMovie();
    }, 5000);
}

function resetTimer(){
    startAutoSlide();
}

showMovies();