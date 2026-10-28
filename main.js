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

async function updateBanner(index){
    const movie = moviesList[index];
    if (!movie) return;

    const bannerImage = URL_IMAGE_BASE + movie.backdrop_path;
    const imgElement = document.querySelector('.banner-img');
    const titleElement = document.getElementById('banner-title');
    const overviewElement = document.getElementById('banner-overview');
    const certElement = document.getElementById('banner-certification');

    if(imgElement){
        imgElement.src = bannerImage;
    }
    if(titleElement){
        titleElement.textContent = movie.title;
    }
    if(overviewElement){
        overviewElement.textContent = movie.overview;
    }
    if(certElement){
        const cert = await getMovieCertification(movie.id);

        certElement.textContent = cert;

        const cleanCert = cert.toLowerCase().replace(/[^a-z0-9]/g, '');
        certElement.className = `badge-certification badge-${cleanCert}`;
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

    setTimeout(() => {isLocked = false}, 800);
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

async function getMovieCertification(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${API_KEY}`;
    
    try{
        const response = await fetch(url);
        const data = await response.json();

        const contentRate = data.results.find(release => release.iso_3166_1 == 'US');

        if(contentRate && contentRate.release_dates.length > 0){
            return contentRate.release_dates[0].certification || "NR"; /*Not Rated*/
        }
        return "NR";
    }
    catch (error) {
        console.error("failed to load age rating:", error);
        return "NR";
    }

}
    showMovies();
