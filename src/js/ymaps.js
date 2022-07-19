import { formTemplate } from "./templates"
import 'regenerator-runtime/runtime'

let clusterer

function mapInit() {
  ymaps.ready(() => {
    const myMap = new ymaps.Map('map', {
      center: [46.223442, 39.833914],
      zoom: 15,
      controls: ['zoomControl'],
    });

    myMap.events.add('click', async function (e) {
      const coords = e.get('coords');
      openBalloon(myMap, coords, []);
    });

    clusterer = new ymaps.Clusterer({ clusterDisableClickZoom: true, preset: 'islands#pinkClusterIcons' });
    clusterer.options.set('hasBalloon', false);

    getGeoObjects(myMap)
    clusterer.events.add('click', function (e) {
      let geoObjectsInCluster = e.get('target').getGeoObjects()
      openBalloon(myMap, e.get('coords'), geoObjectsInCluster)
    })
  })
};

var now = new Date().toLocaleDateString();

function getReviewList(currentGeoObjects) {
  let reviewListHTML = '';

  for (const review of getReviewsFromLS()) {
    if (currentGeoObjects.some(geoObject => JSON.stringify(geoObject.geometry._coordinates) === JSON.stringify(review.coords))) {
      reviewListHTML += `
      <div class="review">
        <div class="review__item"><b class="review__item__author">${review.author}</b> ${review.place} ${now}</div>
        <div class="review__item">${review.reviewText}</div>
      </div> 
      `;
    }
  }
  return reviewListHTML;
}

function getReviewsFromLS() {
  const reviews = localStorage.reviews
  return JSON.parse(reviews || "[]")
}

function getGeoObjects(map) {
  const geoObjects = []
  for (const review of getReviewsFromLS() || []) {
    const placemark = new ymaps.Placemark((review.coords), {}, { preset: 'islands#pinkIcon' });

    placemark.events.add('click', e => {
      e.stopPropagation();
      openBalloon(map, e.get('coords'), [e.get('target')])
    })
    geoObjects.push(placemark);
  }

  clusterer.removeAll()
  map.geoObjects.remove(clusterer)
  clusterer.add(geoObjects)
  map.geoObjects.add(clusterer)
}

async function openBalloon(map, coords, currentGeoObjects) {
  await map.balloon.open(coords, {
    content: `<div class="reviews">${getReviewList(currentGeoObjects)}</div>` + formTemplate,
  });
  document.querySelector('#add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const review = {
      coords,
      author: this.elements.author.value,
      place: this.elements.place.value,
      reviewText: this.elements.review.value,
    };

    localStorage.reviews = JSON.stringify([...getReviewsFromLS(), review])

    getGeoObjects(map)

    map.balloon.close();
  });
}

export {
  mapInit
}