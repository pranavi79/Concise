var parent = document.querySelector(".result");
var discFilters;
var discType;
var discCategory;
var genres;
var tokens;
var final_str = "";
var maxPage=0;
window.addEventListener('DOMContentLoaded', (event) => {
      // using a loader 
      var results = document.querySelector('.result');
      var loader = document.querySelector('.loader');
      var x = setInterval(function () {
            if (results.childElementCount > 0) {
                  loader.style.display = 'none';
                  clearInterval(x);
                  if (tokens[1] === "select-genres" || tokens[1] === "select-year") {
                        addListenerToSubmitButton();
                  }
            } else {
                  loader.style.display = 'block';
            }
      }, 100);

      // validating the URL
      var disc_str = location.search.substring(1);
      // if ?disc_str... is missing
      if (disc_str === "") {
            noResults();
            return;
      }

      tokens = disc_str.split('&');
      console.log(tokens);

      if ((tokens[0] !== "movie" && tokens[0] !== "tv") || tokens.length == 1 || tokens[2] === "") {
            noResults();
            return;
      }

      discType = tokens[0];
      discCategory = tokens[1];

      if (tokens[0] === "movie") {
            if (tokens[1] === "most-liked") {
                  // tokens[2] is page number 
                  discFilters = [orderby.vote_count, options.page(tokens[2])];
                  discoverMedia("movie", discFilters);

            } else if (tokens[1] === "highest-grossing") {
                  discFilters = [orderby.revenue, options.page(tokens[2])];
                  discoverMedia("movie", discFilters);

            } else if (tokens[1] === "with-genres") {
                  // token[2] - genre list ',' seperated, token[3] - page number 
                  if (tokens[2] === undefined || tokens[2] === "" || tokens[3] === undefined || tokens[3] === "") {
                        noResults();
                        return;
                  } else {
                        discFilters = [options.genres(tokens[2].split(',')), orderby.vote_count, options.page(tokens[3])];
                        discoverMedia("movie", discFilters);
                  }
            } else if (tokens[1] === "with-year") {
                  if (tokens[2] === undefined || tokens[2] === "" || tokens[3] === undefined || tokens[3] === "") {
                        noResults();
                        return;
                  } else {
                        // release year
                        discFilters = [options.release_year(tokens[2]), orderby.vote_count, options.page(tokens[3])];
                        discoverMedia("movie", discFilters);
                  }
            } else if (tokens[1] === "select-genres") {
                  createInputForGenres();
            } else if (tokens[1] === "select-year") {
                  createInputForYear();
            } else {
                  noResults();
                  return;
            }

      } else if (tokens[0] === "tv") {
            if (tokens[1] === "most-liked") {
                  discFilters = [orderby.vote_count, options.page(tokens[2])];
                  discoverMedia("tv", discFilters);
            } else if (tokens[1] === "with-genres") {
                  // token[2] becomes the genre list seperated by commas, token[3] - page number
                  console.log('hello genres t');
                  if (tokens[2] === undefined || tokens[2] === "" || tokens[3] === undefined || tokens[3] === "") {
                        noResults();
                        return;
                  } else {
                        discFilters = [options.genres(tokens[2].split(',')), orderby.vote_count, options.page(tokens[3])];
                        discoverMedia("tv", discFilters);
                  }
            } else if (tokens[1] === "select-genres") {
                  createInputForGenres();
            } else {
                  noResults();
                  return;
            }
      } else {
            // else - just for safety
            console.log("invalid media");
            return;
      }
});

function discoverMedia(media, filters) {
      media_disc = media;
      query_url = getQueryUrl("/discover/" + media)(filters);
      if (media === "movie") {
            fetchData(query_url, displayDiscoverResults);
      } else if (media === "tv") {
            fetchData(query_url, displayDiscoverResults);
      }
}

function displayDiscoverResults(data) {
      if (data.total_results == 0) {
            noResults();
            return;
      }
      data.results.forEach(element => {
            final_str += constructHTMLStr(element, discType);
      });

      parent.innerHTML = final_str;
      // event listeener for details 
      addEventListenerToItems();
      //maxPage=Math.max(maxPage,data.page);
      window.addEventListener('scroll',()=>{
            let documentHeight = document.body.scrollHeight;
            let currentScroll = window.scrollY + window.innerHeight;
            if(currentScroll+10>documentHeight){
                  //alert("scrolled to bottom");
                  if(data.page>maxPage){
                        maxPage=data.page;
                        loadMorePages(data.page, data.total_pages);
                  }
            }
      });
}
function loadMorePages(currentPage,totalPages){
      var loader = document.querySelector('.loader2');
      if(currentPage < totalPages) {
            setTimeout(function () {
            loader.style.display = 'block';
            if (tokens[0] === "movie") {
                  if (tokens[1] === "most-liked" || tokens[1] === "highest-grossing") {
                        // tokens[2] is page number 
                        tokens[2]=currentPage+1;
                        discFilters[1] =  options.page(tokens[2]);
                        discoverMedia("movie", discFilters);
                  } else {
                        tokens[3]=currentPage+1;
                        discFilters[2] = options.page(tokens[3]);
                        discoverMedia("movie", discFilters);
                  }
            } else {
                  if (tokens[1] === "most-liked") {
                        tokens[2]=currentPage+1;
                        discFilters[1]=options.page(tokens[2]);
                        discoverMedia("tv", discFilters);
                  } else {
                        // token[2] becomes the genre list seperated by commas, token[3] - page number
                        tokens[3]=currentPage+1;
                        discFilters[2] = options.page(tokens[3]);
                        discoverMedia("tv", discFilters);
                  }
            }}, 1000);
      } else {
            loader.style.display = 'none';
      }

};
function noResults() {
      document.querySelector('.main-content').innerHTML = '<h1 style="text-align:center"><i style="color: #AFFC41" class="fa fa-frown-o" aria-hidden="true"></i> No results found!</h1>';
}

function createInputForGenres() {
      var query_url = getQueryUrl("/genre/" + discType + "/list")([]);

      fetchData(query_url, function (data) {
            var str = "";
            str += "<div class='genre-form'>";
            data.genres.forEach(element => {
                  str += "<div class='input-box'>";
                  str += "<label><input type='checkbox' value=" + element.id + ">" + element.name + "</label>";
                  str += "</div>";
            });

            str += "<div class='submit-genres'> <button> Find " + ((discType === "movie") ? "Movies" : "TV Shows") + "</button>";
            str += "</div>";
            parent.innerHTML = str;
      });
}

function createInputForYear() {
      var str = "";
      str += "<div class='year-form'>";
      str += "<input type='number' placeholder='Year of release'>";
      str += "<button>Find Movie</button>";
      str += "</div>";
      parent.innerHTML = str;
}

function addListenerToSubmitButton() {
      if (tokens[1] === "select-year") {
            var baseDiscoverLocation = "discover_results.html?movie&with-year&";
            var yearFormBtn = document.querySelector('.year-form button');
            var yearFormInput = document.querySelector('.year-form input');

            yearFormInput.addEventListener('keyup', function(event) {
                  if(event.keyCode === 13) {
                        yearFormBtn.click();
                  }
            });

            yearFormBtn.addEventListener('click', function() {
                  var inputVal = yearFormInput.value;
                  if(inputVal === "") {
                        alert("Release year of the movie required.")
                  } else {
                        window.location.assign(baseDiscoverLocation + inputVal + '&1');
                  }
            });

      } else {
            var submitBtn = document.querySelector('.submit-genres>button');
            var checkboxes = document.querySelectorAll('.genre-form > div.input-box > label > input');

            submitBtn.addEventListener('click', function () {
                  var checked = [];
                  for (var i = 0; i < checkboxes.length; i++) {
                        if (checkboxes[i].checked === true) {
                              checked.push(checkboxes[i].value);
                        }
                  }

                  if (checked.length === 0) {
                        alert("At least one genre must be selected!")
                  } else {
                        console.log(checked.join(','));
                        window.location.assign('discover_results.html?' + discType + '&with-genres&' + checked.join(',') + "&1");
                  }
            });
      }
}