document.addEventListener("DOMContentLoaded", function () {
    let lastScroll = 0;
    const header = document.querySelector(".header");

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        const displayNameEl = document.getElementById("displayName");
        displayNameEl.textContent = loggedInUser;
    }
    
    // Hide/Show Header on Scroll
    window.addEventListener("scroll", () => {
        let currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add("hidden");
        } else {
            header.classList.remove("hidden");
        }
        header.classList.toggle("scrolled", currentScroll > 0);
        lastScroll = currentScroll;
    });

    // Debounce utility
    function debounce(func, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(func, delay);
        };
    }

    function initializeMap() {
        const mapContainer = document.getElementById('map');
        const searchContainer = document.querySelector('.search-container');
        const searchContainerWidth = searchContainer ? searchContainer.offsetWidth : 0;
        const width = mapContainer.offsetWidth;
        const isMobile = window.innerWidth < 768;
        const height = isMobile ? 500 : 700; // Adjusted height
        
        const center = [82.8, 22.5]; // India's center
        const scale = isMobile ? 670 : 1200; // Adjusted scale for better fit
        
        const datamapInstance = new Datamap({
            scope: 'india',
            element: mapContainer,
            responsive: true,
            setProjection: function (element) {
                const projection = d3.geo.mercator()
                    .center(center)
                    .scale(scale)
                    .translate([
                        element.offsetWidth / 2 + (isMobile ? 0 : searchContainerWidth / 2 + 20), 
                        height / 2 + (isMobile ? 50 : 20)
                    ]); // Adjusted translate values
    
                const path = d3.geo.path().projection(projection);
                return { path, projection };
            },
            geographyConfig: {
                dataUrl: 'https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/geography-data/india.topo.json',
                highlightOnHover: true,
                popupTemplate: function (geo) {
                    return `<div class="hoverinfo">${geo.properties.name} - Click for Details</div>`;
                },
                popupOnHover: true,
                highlightBorderColor: 'teal'
            },
            fills: { defaultFill: 'rgba(0,0,0, 0.5)' },
            done: function (datamap) {
                datamap.svg.selectAll('.datamaps-subunit')
                    .attr("data-state-name", function (d) { return d.properties.name; })
                    .on('click', function (geography) {
                        openStatePage(geography.properties.name);
                    });
    
                if (isMobile) {
                    datamap.svg
                        .attr("preserveAspectRatio", "xMidYMid meet")
                        .style("max-width", "100%")
                        .style("height", height + "px")
                        .style("display", "block")
                        .style("margin-top", "-100px")
                        .style("position", "relative");
                } else {
                    datamap.svg
                        .attr("preserveAspectRatio", "xMidYMid meet")
                        .style("max-width", "100%")
                        .style("height", height + "px")
                        .style("display", "block")
                        .style("margin", "0 auto");
                }
            }
        });
    }
    
    
    let lastWidth = window.innerWidth;

    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth !== lastWidth) {
            document.getElementById('map').innerHTML = '';
            initializeMap();
            lastWidth = window.innerWidth;
        }
    }, 300));


    initializeMap();

    const statePages = {
        "Maharashtra": "./States HTML/maharashtra.html",
        "West Bengal": "./States HTML/wb.html",
        "Jharkhand": "./States HTML/jharkhand.html",
        "Madhya Pradesh": "./States HTML/mp.html",
        "Odisha": "./States HTML/odisha.html",
        "Chhattisgarh": "./States HTML/chhattisgarh.html",
        "Sikkim": "./States HTML/sikkim.html",
        "Assam": "./States HTML/assam.html",
        "Uttar Pradesh": "./States HTML/up.html",
        "Bihar": "./States HTML/bihar.html",
        "Goa": "./States HTML/goa.html",
        "Gujarat": "./States HTML/gj.html",
        "Rajasthan": "./States HTML/rj.html",
        "Uttarakhand": "./States HTML/uttar.html",
        "Himachal Pradesh": "./States HTML/hima.html",
        "Haryana": "./States HTML/har.html",
        "Punjab": "./States HTML/pun.html",
        "Jammu & Kashmir": "./States HTML/jk.html",
        "NCT of Delhi": "./States HTML/delhi.html",
        "New Delhi": "./States HTML/delhi.html",
        "Arunachal Pradesh": "./States HTML/arunachal.html",
        "Nagaland": "./States HTML/nagaland.html",
        "Manipur": "./States HTML/manipur.html",
        "Mizoram": "./States HTML/mizoram.html",
        "Tripura": "./States HTML/tripura.html",
        "Meghalaya": "./States HTML/meghalaya.html",
        "Andhra Pradesh": "./States HTML/andhra.html",
        "Telangana": "./States HTML/telangana.html",
        "Karnataka": "./States HTML/karnataka.html",
        "Tamil Nadu": "./States HTML/tamil.html",
        "Kerala": "./States HTML/kerala.html",
        "Andaman & Nicobar Island": "./States HTML/and.html"
    };

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.querySelector("button");
    const suggestionsList = document.getElementById("suggestions");

    searchInput.addEventListener("input", function () {
        let query = searchInput.value.trim();
        highlightMatchingStates(query);
        showSuggestions(query);
    });

    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") searchState();
    });

    searchButton.addEventListener("click", function () {
        searchState();
    });

    function highlightMatchingStates(query) {
        query = query.toLowerCase().trim();
        document.querySelectorAll(".datamaps-subunit").forEach(state => {
            let stateName = state.getAttribute("data-state-name");
            if (stateName && stateName.toLowerCase().includes(query)) {
                state.style.fill = "red";
            } else {
                state.style.fill = "rgba(0, 0, 0, 0.5)";
            }
        });
    }

    function searchState() {
        let query = searchInput.value.trim();
        if (!query) return alert("Please enter a state name.");

        let formattedName = formatStateName(query);
        if (statePages[formattedName]) {
            highlightMatchingStates(formattedName);
            setTimeout(() => openStatePage(formattedName), 500);
        } else {
            alert("State not found! Check your spelling.");
        }
    }

    function showSuggestions(query) {
        suggestionsList.innerHTML = "";
        suggestionsList.style.display = "none";
        if (!query) return;

        let filtered = Object.keys(statePages).filter(state =>
            state.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length) suggestionsList.style.display = "block";

        filtered.forEach(state => {
            let li = document.createElement("li");
            li.textContent = state;
            li.addEventListener("click", () => {
                searchInput.value = state;
                highlightMatchingStates(state);
                searchState();
            });
            suggestionsList.appendChild(li);
        });
    }

    function openStatePage(stateName) {
        if (statePages[stateName]) {
            window.open(statePages[stateName], "_blank");
        } else {
            alert("Page not found for " + stateName);
        }
    }

    function formatStateName(name) {
        return name.toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
});
