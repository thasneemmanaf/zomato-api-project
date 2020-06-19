class ZOMATO {
  constructor() {
    this.urlKey = "7baa2421a7ee96ad0b7ffd9fec06faf0";
    this.header = {
      method: "GET",
      headers: {
        "user-key": this.urlKey,
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    };
  }
  //   calling api for getting categories
  async searchCategoryAPI() {
    const baseUrl = "https://developers.zomato.com/api/v2.1/categories";
    const categoriesInfo = await fetch(baseUrl, this.header);
    const categoriesdata = await categoriesInfo.json();
    const { categories } = categoriesdata;

    return categories;
  }
  // calling api for getting cityId
  async searchCityAPI(city, ui) {
    const baseUrl = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;
    const citiesInfo = await fetch(baseUrl, this.header);
    const citiesData = await citiesInfo.json();
    const location = citiesData.location_suggestions;
    if (location.length > 0) {
      return location[0].id;
    } else {
      ui.showFeedback("invalid city");
    }
  }
  // calling api for getting restaurants list
  async searchRestaurantsAPI(categoryId, cityId) {
    const baseUrl = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityId}&entity_type=city&category=${categoryId}&sort=rating&order=desc`;
    const restaurantsInfo = await fetch(baseUrl, this.header);
    const restaurantsData = await restaurantsInfo.json();
    const { restaurants } = restaurantsData;
    return restaurants;
  }
}

class UI {
  constructor() {}
  //   dispaly categories
  displayCategory(categories) {
    const categoryElement = document.getElementById("searchCategory");
    let output = `<option value="0" selected>Please select a category</option>`;
    categories.forEach(function (category) {
      output += `<option value="${category.categories.id}">${category.categories.name}</option>`;
    });
    categoryElement.innerHTML = output;
  }
  // to show alert on the top
  showFeedback(text) {
    const feedback = document.querySelector(".feedback");
    feedback.classList.add("showItem");
    feedback.innerHTML = `<p>${text}</p>`;
    setTimeout(function () {
      feedback.classList.remove("showItem");
    }, 2000);
  }

  showPreloader(preLoader) {
    preLoader.classList.add("showItem");
  }

  hidePreloader(preLoader) {
    preLoader.classList.remove("showItem");
  }

  //   display restaurants
  dispalyRestaurants(restaurants) {
    console.log(restaurants);
    const restaurantList = document.getElementById("restaurant-list");
    let info = "";
    restaurants.forEach(function (restaurant) {
      info += ` <div class="col-11 mx-auto my-3 col-md-4">
     <div class="card">
      <div class="card">
       <div class="row p-3">
        <div class="col-5">
         <img src="img/food.jpeg" class="img-fluid img-thumbnail" alt="">
        </div>
        <div class="col-5 text-capitalize">
         <h6 class="text-uppercase pt-2 redText">${restaurant.restaurant.name}</h6>
         <p>${restaurant.restaurant.location.address}</p>
        </div>
        <div class="col-1">
         <div class="badge badge-success">
          ${restaurant.restaurant.user_rating.aggregate_rating}
         </div>
        </div>
       </div>
       <hr>
       <div class="row py-3 ml-1">
        <div class="col-5 text-uppercase ">
         <p>cousines :</p>
         <p>cost for two :</p>
        </div>
        <div class="col-7 text-uppercase">
         <p>${restaurant.restaurant.cuisines}</p>
         <p>${restaurant.restaurant.average_cost_for_two}</p>
        </div>
       </div>
       <hr>
       <div class="row text-center no-gutters pb-3">
        <div class="col-6">
         <a href="${restaurant.restaurant.menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> menu</a>
        </div>
        <div class="col-6">
         <a href="${restaurant.restaurant.url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> website</a>
        </div>
       </div>
      </div>
     </div>

     <!-- item -->

    </div>`;
    });
    restaurantList.innerHTML = info;
  }
}

(function () {
  const searchForm = document.getElementById("searchForm");
  const searchCategory = document.getElementById("searchCategory");
  const searchCity = document.getElementById("searchCity");
  const preLoader = document.querySelector(".loader");
  let IdOfCity;

  const zomato = new ZOMATO();
  const ui = new UI();

  document.addEventListener("DOMContentLoaded", function () {
    zomato.searchCategoryAPI().then(function (categories) {
      ui.displayCategory(categories);
    });
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (searchCategory.value === "0" || searchCity.value === "") {
      ui.showFeedback("please enter a category and a city");
    } else {
      ui.showPreloader(preLoader);
      // find city id
      zomato.searchCityAPI(searchCity.value, ui).then(function (cityId) {
        // console.log(cityId);
        IdOfCity = cityId;
      });
      //   find restaurants
      zomato
        .searchRestaurantsAPI(searchCategory.value, IdOfCity)
        .then(function (restaurants) {
          if (restaurants.length > 0) {
            ui.hidePreloader(preLoader);
            ui.dispalyRestaurants(restaurants);
          } else {
            ui.showFeedback("no restaurants found");
          }
        });
    }
  });
})();
