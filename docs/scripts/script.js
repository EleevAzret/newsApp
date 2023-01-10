"use strict";

function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest;
        xhr.open('GET', url);
        xhr.timeout = 10000;
    
        xhr.addEventListener('load', (e) => {
          if(Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status Error: ${xhr.status}`, xhr);
            return;
          }
          cb(null, xhr);
        });
    
        xhr.addEventListener('error', (e) => {
          console.error('Server not responding');
          return;
        });
    
        xhr.addEventListener('timeout', (e) => {
          console.error('Timed out');
          return;
        });
    
        xhr.send();
      } catch (err) {
        cb(err);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest;
        xhr.open('POST', url);
        xhr.timeout = 10000;

        if(headers) {
          Object.entries(headers).forEach( ([head, value]) => {
            xhr.setRequestHeader(head, value);
          });
        };

        xhr.addEventListener('load', (e) => {
          if(Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status Error: ${xhr.status}`, xhr);
            return;
          }
          cb(null, xhr);
          return;
        });

        xhr.addEventListener('error', (e) => {
          console.error('Error. Server Not responding');
          return;
        });

        xhr.addEventListener('timeout', (e) => {
          console.error('Timed out');
          return;
        });

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    }
  }
};

//init http module
const http = customHttp();

const newsService = (function() {
  const apiKey = '92358cd8db45fe7584426a4047d25d2a';
  const apiUrl = 'https://gnews.io/api/v4';

  return {
    topHeadlines(country = 'us', category = 'bussines', cb) {
      http.get(`${apiUrl}/top-headlines?topic=${category}&token=${apiKey}&lang=${country}&country=${country}&max=10`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/search?q=${query}&token=${apiKey}&lang=${country}&country=${country}&max=10`, cb);
    }
  }
})();

//elements
const form = document.forms['newsControls'],
      selectCountry = document.querySelector('#country'),
      selectCategory = document.querySelector('#category'),
      search = document.querySelector('#autocmplete-input');

form.addEventListener('submit', formSubmitHandler);

//activate materialize form
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  let selects = document.querySelectorAll('select');
  var instances = M.FormSelect.init(selects);
  loadNews();
})

//load start news function
function loadNews() {
  showPreloader();
  let country = selectCountry.value;
  let category = selectCategory.value;
  let searchMsg = search.value;

  if(!searchMsg) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchMsg, onGetResponse);
  }
};

//function on get response from server
function onGetResponse(err, res) {
  hidePreloader();
  let news = JSON.parse(res.responseText).articles;
  if(err) {
    showAlert(err, 'error-msg');
    console.log(err);
    return;
  }

  if(!news.length) {
    showAlert('Data loading error. Try again', 'error-msg');
    return;
  }

  renderNews(news);
}

//render news function
function renderNews(news) {
  let newsContainer = document.querySelector('.news');
  if(newsContainer.children.length) clearNews(newsContainer);
  let fragment = '';

  news.forEach(newsItem => {
    let el = createNews(newsItem);
    fragment += el;
  })

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
  loadImageCheck();
};

//create html news card
function createNews({image, url, title, description, publishedAt}) {
  return `<div class="news-card">
            <div class="news-card__image">
            <a href="${url}">
              <img src="${image}">
            </a>
            </div>
            <span class="news-card__title">${title || ''}</span>
            <div class="news-card__content">
              <p>${description || ''}</p>
            </div>
          </div>`
}

//clear news container
function clearNews(container) {
  container.innerHTML = '';
}

//handler form submit
function formSubmitHandler(event) {
  event.preventDefault();
  loadNews();
}

//function to show materilize toast
function showAlert(msg, type = 'success') {
  M.toast({html: msg, classes: type});
}

//show preloader function
function showPreloader() {
  if(document.querySelector('.progress')) {
    return;
  }
  let newsContainer = document.querySelector('.news');
  newsContainer.insertAdjacentHTML('beforebegin', 
  `  <div class="progress">
      <div class="indeterminate"></div>
    </div>`
  )
}

//hide preloader function
function hidePreloader() {
  let preloader = document.querySelector('.progress');
  if(preloader) preloader.remove();
  return;
}

function loadImageCheck() {
  let imgs = document.querySelectorAll('img');
  imgs.forEach(img => {
    img.addEventListener('error', function(e) {
      this.src = 'https://via.placeholder.com/480x300/6699CC/E0F6FD?text=Read+more+(newsApp)';
    })
  })
}