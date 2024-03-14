import { FORM_INPUT_QUERY, LOCALSTORAGE_KEY } from '../constant/constants';
import RestaurantService from '../domain/RestaurantService';
import { $ } from '../utils/querySelector';
import OutputView from '../views/OutputView';
import Dropdown from '../components/Common/Dropdown';
import { FILTER_DROPDOWN_PROPS, SORT_DROPDOWN_PROPS } from '../constant/options';

class RestaurantController {
  #restaurantList;

  #category;

  #property;

  constructor() {
    this.#restaurantList = this.getRecentData();

    this.#category = '전체';
    this.#property = 'name';
  }

  run() {
    this.showFilterDropdown();
    this.updateRestaurantList();
    this.showAddRestaurantModal();
    this.manageFilterValue();
  }

  getRecentData() {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY.RESTAURANT_LIST)) || [];
  }

  showFilterDropdown() {
    const filterContainer = $('.restaurant-filter-container');

    const filterDropdown = Dropdown(FILTER_DROPDOWN_PROPS);
    const sortDropdown = Dropdown(SORT_DROPDOWN_PROPS);

    filterContainer.insertAdjacentHTML('beforeend', filterDropdown);
    filterContainer.insertAdjacentHTML('beforeend', sortDropdown);
  }

  updateRestaurantList() {
    const restaurantService = new RestaurantService();
    const filteredList = restaurantService.filterByCategory(this.#category, this.#restaurantList);
    const processedList = restaurantService.sortByProperty(this.#property, filteredList);

    OutputView.renderRestaurantList(processedList);

    this.manageRestaurantItems();
  }

  showAddRestaurantModal() {
    const addRestaurantButton = $('.gnb__button');
    addRestaurantButton.addEventListener('click', () => {
      OutputView.renderAddRestaurant(this.#restaurantList);
      this.manageAddRestaurantFormEvents();
      this.manageModalEvents();
    });
  }

  manageAddRestaurantFormEvents() {
    const restaurantService = new RestaurantService();
    const formAddRestaurant = $('.form-add-restaurant');

    formAddRestaurant.addEventListener('reset', () => OutputView.closeModal());
    formAddRestaurant.addEventListener('submit', e => {
      e.preventDefault();
      const newRestaurant = this.createRestaurant();
      const isAdded = restaurantService.addRestaurant(newRestaurant, this.#restaurantList);
      const isAddedText = isAdded ? '추가되었습니다.' : '중복된 식당입니다. 다시 입력해주세요.';
      alert(isAddedText);

      if (!isAdded) return;
      this.updateRestaurantList();
      OutputView.closeModal();
    });
  }

  createRestaurant() {
    const formData = {};

    FORM_INPUT_QUERY.forEach(id => {
      const input = $(id);
      formData[input.name] = input.name === 'distance' ? parseInt(input.value, 10) : input.value;
    });

    return formData;
  }

  manageModalEvents() {
    const modalBackdrop = $('.modal-backdrop');

    modalBackdrop.addEventListener('click', () => {
      OutputView.closeModal();
    });
  }

  manageFilterValue() {
    const categoryFilter = $('#category-filter');
    categoryFilter.addEventListener('change', () => {
      this.#category = categoryFilter.options[categoryFilter.selectedIndex].value;
      this.updateRestaurantList();
    });

    const sortingFilter = $('#sorting-filter');
    sortingFilter.addEventListener('change', () => {
      this.#property = sortingFilter.options[sortingFilter.selectedIndex].value;
      this.updateRestaurantList();
    });
  }

  manageRestaurantItems() {
    const restaurantList = $('.restaurant-list');
    restaurantList.addEventListener('click', event => {
      const favoriteButton = event.target.closest('.favorite-button');
      const restaurantItem = event.target.closest('.restaurant');

      if (favoriteButton) {
        this.changeFavoriteButton(restaurantItem.id, favoriteButton);
      } else if (restaurantItem) {
        this.showDetailRestaurantModal(restaurantItem.id);
      }
    });
  }

  changeFavoriteButton(restaurantId, favoriteButton) {
    const targetRestaurant = this.#restaurantList.find(restaurant => restaurant.id === Number(restaurantId));

    targetRestaurant.favorite = !targetRestaurant.favorite;
    favoriteButton.src = targetRestaurant.favorite ? './favorite-icon-filled.png' : './favorite-icon-lined.png';
  }

  showDetailRestaurantModal(restaurantId) {
    const targetRestaurant = this.#restaurantList.find(restaurant => restaurant.id === Number(restaurantId));

    OutputView.renderDetailRestaurant(targetRestaurant);
    // this.manageAddRestaurantFormEvents();
    this.manageModalEvents();

    const modalContainer = $('.modal-container');
    modalContainer.addEventListener('click', event => {
      const favoriteButton = event.target.closest('.favorite-button');

      if (favoriteButton) {
        this.changeFavoriteButton(restaurantId, favoriteButton);
      }
    });
  }
}

export default RestaurantController;
