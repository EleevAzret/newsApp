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

const http = customHttp();

const newsService = (function() {
  const apiKey = 'dae53cecec8342ac8fcf172a69ef8867';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadlines(country = 'us', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
})

//load news function
function loadNews() {
  newsService.topHeadlines('ru', onGetResponse);
};

//function on get response from server
function onGetResponse(err, res) {
  if(err) {
    console.error(err);
    return;
  }

  renderNews(JSON.parse(res.responseText).articles);
}

function renderNews(news) {
  let newsContainer = document.querySelector('.news');
  let fragment = '';

  news.forEach(newsItem => {
    let el = createNews(newsItem);
    fragment += el;
  })

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
};

//create html news card
function createNews({urlToImage, url, title, description}) {
  return `<div class="news-card">
            <div class="news-card__image">
            <a href="${url}">
              <img src="${urlToImage}">
            </a>
            </div>
            <span class="news-card__title">${title || ''}</span>
            <div class="news-card__content">
              <p>${description || ''}</p>
            </div>
          </div>`
}