/* =========================================================
   MOVIEFLIX JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loginPopup = document.getElementById("loginPopup");
    const openLogin = document.getElementById("openLogin");
    const closeLogin = document.getElementById("closeLogin");

    const modal = document.getElementById("movieModal");
    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const closeModal = document.getElementById("closeModal");

    const cards = document.querySelectorAll(".card img, .top-card img");

    const trailerBtn = document.getElementById("watchTrailer");

    /* =====================================================
       TMDB API
    ===================================================== */

    const API_KEY = "cd7fd352bda84df7464e5c07934b2d35";

    const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";

    /* =====================================================
       LOGIN
    ===================================================== */

    if (openLogin && loginPopup) {
        openLogin.addEventListener("click", () => {
            loginPopup.classList.add("show");
            document.body.style.overflow = "hidden";
        });
    }

    if (closeLogin && loginPopup) {
        closeLogin.addEventListener("click", () => {
            loginPopup.classList.remove("show");
            document.body.style.overflow = "";
        });
    }

    /* =====================================================
       MOVIE MODAL CLOSE
    ===================================================== */

    if (closeModal) {
        closeModal.addEventListener("click", closeMovieModal);
    }

    function closeMovieModal() {

        modal.classList.remove("show");

        document.body.style.overflow = "";

        if (trailerBtn) {
            trailerBtn.style.display = "none";
        }
    }

    /* =====================================================
       CLICK OUTSIDE MODAL
    ===================================================== */

    window.addEventListener("click", (event) => {

        if (event.target === loginPopup) {

            loginPopup.classList.remove("show");

            document.body.style.overflow = "";
        }

        if (event.target === modal) {

            closeMovieModal();
        }

    });

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            if (loginPopup) {
                loginPopup.classList.remove("show");
            }

            if (modal) {
                modal.classList.remove("show");
            }

            document.body.style.overflow = "";
        }

    });

    /* =====================================================
       MOVIE CARD CLICK
    ===================================================== */

    cards.forEach((card) => {

        card.addEventListener("click", async () => {

            const title = card.dataset.title;
            const type = card.dataset.type || "movie";

            if (!title) {

                openMovieModal(
                    card.src,
                    "Movie Preview",
                    "No movie information available."
                );

                return;
            }

            /* Open modal immediately */

            openMovieModal(
                card.src,
                "Loading...",
                "Fetching movie information..."
            );

            try {

                const encodedTitle = encodeURIComponent(title);

                let searchURL;

                if (type === "series") {

                    searchURL =
                        `https://api.themoviedb.org/3/search/tv` +
                        `?api_key=${API_KEY}` +
                        `&query=${encodedTitle}`;

                } else {

                    searchURL =
                        `https://api.themoviedb.org/3/search/movie` +
                        `?api_key=${API_KEY}` +
                        `&query=${encodedTitle}`;
                }

                const response = await fetch(searchURL);

                if (!response.ok) {
                    throw new Error("TMDB request failed");
                }

                const data = await response.json();

                const result = data.results?.[0];

                if (!result) {

                    modalTitle.innerText = title;

                    modalDesc.innerText =
                        "No information was found for this movie.";

                    return;
                }

                /* =================================================
                   TITLE
                ================================================= */

                modalTitle.innerText =
                    result.title ||
                    result.name ||
                    title;

                /* =================================================
                   POSTER
                ================================================= */

                if (result.poster_path) {

                    modalImg.src =
                        TMDB_IMAGE + result.poster_path;

                } else {

                    modalImg.src = card.src;
                }

                /* =================================================
                   DESCRIPTION
                ================================================= */

                const description =
                    result.overview ||
                    "No description available.";

                const rating =
                    result.vote_average
                        ? Number(result.vote_average).toFixed(1)
                        : "N/A";

                const releaseDate =
                    result.release_date ||
                    result.first_air_date ||
                    "Unknown";

                const contentType =
                    type === "series"
                        ? "📺 TV Series"
                        : "🎬 Movie";

                modalDesc.innerText =
                    `${description}\n\n` +
                    `⭐ Rating: ${rating}/10\n` +
                    `${contentType}\n` +
                    `📅 Release: ${releaseDate}`;

                /* =================================================
                   TRAILER
                ================================================= */

                await loadTrailer(
                    result.id,
                    type
                );

            } catch (error) {

                console.error(error);

                modalTitle.innerText = title;

                modalDesc.innerText =
                    "Unable to load movie information. Please try again.";

                if (trailerBtn) {
                    trailerBtn.style.display = "none";
                }

            }

        });

    });

    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openMovieModal(image, title, description) {

        modal.classList.add("show");

        document.body.style.overflow = "hidden";

        modalImg.src = image;

        modalTitle.innerText = title;

        modalDesc.innerText = description;

        if (trailerBtn) {
            trailerBtn.style.display = "none";
        }
    }

    /* =====================================================
       LOAD TRAILER
    ===================================================== */

    async function loadTrailer(id, type) {

        if (!trailerBtn) {
            return;
        }

        trailerBtn.style.display = "none";

        try {

            let videoURL;

            if (type === "series") {

                videoURL =
                    `https://api.themoviedb.org/3/tv/${id}/videos` +
                    `?api_key=${API_KEY}`;

            } else {

                videoURL =
                    `https://api.themoviedb.org/3/movie/${id}/videos` +
                    `?api_key=${API_KEY}`;
            }

            const response = await fetch(videoURL);

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            const trailer =
                data.results?.find(
                    video =>
                        video.site === "YouTube" &&
                        video.type === "Trailer"
                );

            if (!trailer) {
                return;
            }

            trailerBtn.style.display = "inline-block";

            trailerBtn.onclick = () => {

                window.open(
                    `https://www.youtube.com/watch?v=${trailer.key}`,
                    "_blank"
                );

            };

        } catch (error) {

            console.error(
                "Trailer error:",
                error
            );

            trailerBtn.style.display = "none";
        }
    }

    /* =====================================================
       PLAY BUTTON
    ===================================================== */

    const playButton =
        document.querySelector(".play");

    if (playButton) {

        playButton.addEventListener("click", () => {

            const trailer =
                document.getElementById("watchTrailer");

            if (trailer &&
                trailer.style.display !== "none") {

                trailer.click();

            } else {

                document
                    .getElementById("movies")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });
            }

        });

    }

    /* =====================================================
       MORE INFO BUTTON
    ===================================================== */

    const moreButton =
        document.querySelector(".more");

    if (moreButton) {

        moreButton.addEventListener("click", () => {

            document
                .getElementById("top10")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        });

    }

    /* =====================================================
       LOGIN FORM
    ===================================================== */

    const signupButton =
        document.querySelector(".signin-btn");

    if (signupButton) {

        signupButton.addEventListener("click", () => {

            const inputs =
                document.querySelectorAll(
                    ".login-box input"
                );

            let valid = true;

            inputs.forEach(input => {

                if (
                    input.hasAttribute("required") &&
                    !input.value.trim()
                ) {

                    valid = false;

                    input.focus();
                }

            });

            if (!valid) {

                alert(
                    "Please fill all required fields."
                );

                return;
            }

            alert(
                "Account created successfully! 🎉"
            );

            loginPopup.classList.remove("show");

            document.body.style.overflow = "";

        });

    }

});