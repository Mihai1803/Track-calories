class CaloriesTracker {
    constructor() {
        this._calorieLimit = Storage.getCalorieLimit();
        this._totalCalories = Storage.getTotalCalories(0);
        this._meals = Storage.getMeals();
        this._workouts = Storage.getWorkouts();

        this._displayCaloriesLimit();
        this._displayCaloriesTotal();
        this._displayCalorieConsumed();
        this._displayCaloriesBurned();
        this._displayCaloriesRemaining();
        this._displayCaloriesProgress();

        document.querySelector('#limit').value = this._calorieLimit;
    }

    // Public Methods/API 
    addMeal(meal) {
        this._meals.push(meal);
        this._totalCalories += meal.calories;
        Storage.updateToalCalories(this._totalCalories);
        Storage.saveMeal(meal);
        this._displayNewMeal(meal);
        this._render();
    }

    addWorkout(workout) {
        this._workouts.push(workout);
        this._totalCalories -= workout.calories;
        Storage.updateToalCalories(this._totalCalories);
        Storage.saveWorkout(workout);
        this._displayNewWorkout(workout);
        this._render();
    }

    removeMeal(id) {
        const index = this._meals.findIndex((meal) => meal.id === id); // if the cond dose note match index = -1

        if (index != -1) {
            const meal = this._meals[index];
            this._totalCalories -= meal.calories;
            Storage.updateToalCalories(this._totalCalories);
            this._meals.splice(index, 1);
            Storage.removeMeal(id);
            this._render();
        }
    }

    removeWorkout(id) {
        const index = this._workouts.findIndex((workout) => workout.id === id); // if the cond dose note match index = -1

        if (index != -1) {
            const workout = this._workouts[index];
            this._totalCalories += workout.calories;
            Storage.updateToalCalories(this._totalCalories);
            this._workouts.splice(index, 1);
            Storage.removeWorkout(id);
            this._render();
        }
    }
    
    reset() {
        this._totalCalories = 0;
        this._meals = [];
        this._workouts = [];
        Storage.clearAll();
        this._render();
    }

    setLimit(calorieLimit) {
        this._calorieLimit = calorieLimit;
        Storage.setCalorieLimit(calorieLimit);
        this._displayCaloriesLimit();
        this._render();
    }

    loadItems() {
        this._meals.forEach((meal) => this._displayNewMeal(meal));
        this._workouts.forEach((workout) => this._displayNewWorkout(workout));
    }

    // Private Methods/API

    _displayCaloriesTotal() {
        const totalCaloriesEl = document.querySelector('#calories-total');
        totalCaloriesEl.innerHTML = this._totalCalories;
    }
    _displayCaloriesLimit() {
        const calorieLimitEl = document.querySelector('#calories-limit');
        calorieLimitEl.innerHTML = this._calorieLimit;
    }

    _displayCalorieConsumed() {
        const caloriesConsumedEl = document.querySelector('#calories-consumed');
        const consumed = this._meals.reduce((total, meal) => {
            return total + meal.calories;
        }, 0);
        caloriesConsumedEl.innerHTML = consumed;
    }
    _displayCaloriesBurned() {
        const caloriesBurnedEl = document.querySelector('#calories-burned');
        const burned = this._workouts.reduce((total, workout) => {
            return total + workout.calories;
        }, 0);
        caloriesBurnedEl.innerHTML = burned;
    }
    _displayCaloriesRemaining() {
        const caloriesRemainingEl = document.querySelector('#calories-remaining');
        const progressEl = document.querySelector('#calorie-progress')
        const remaining = this._calorieLimit - this._totalCalories;
        caloriesRemainingEl.innerHTML = remaining;
        if (remaining <= 0) {
            caloriesRemainingEl.parentElement.parentElement.classList.remove('bg-light');
            caloriesRemainingEl.parentElement.parentElement.classList.add('bg-danger');
            progressEl.classList.remove('bg-success');
            progressEl.classList.add('bg-danger');
        } else {
            caloriesRemainingEl.parentElement.parentElement.classList.remove('bg-danger');
            caloriesRemainingEl.parentElement.parentElement.classList.add('bg-light');
            progressEl.classList.remove('bg-danger');
            progressEl.classList.add('bg-success');
        }
    }
    _displayCaloriesProgress() {
        const progressEl = document.querySelector('#calorie-progress');
        const percentage = (this._totalCalories / this._calorieLimit) * 100;
        const width = Math.min(percentage, 100);
        progressEl.style.width = `${width}%`;
    }
    _displayNewMeal(meal) {
        const mealsEl = document.querySelector('#meal-items');
        const mealEl = document.createElement('div');
        mealEl.classList.add('card', 'my-2');
        mealEl.setAttribute('data-id', meal.id);
        mealEl.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <h4 class="mx-1">${meal.name}</h4>
                  <div
                    class="fs-1 bg-primary text-white text-center rounded-2 px-2 px-sm-5"
                  >
                    ${meal.calories}
                  </div>
                  <button class="delete btn btn-danger btn-sm mx-2">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
        `;
        mealsEl.appendChild(mealEl);
    }
     _displayNewWorkout(workout) {
        const workoutsEl = document.querySelector('#workout-items');
        const workoutEl = document.createElement('div');
        workoutEl.classList.add('card', 'my-2');
        workoutEl.setAttribute('data-id', workout.id);
        workoutEl.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <h4 class="mx-1">${workout.name}</h4>
                  <div
                    class="fs-1 bg-secondary text-white text-center rounded-2 px-2 px-sm-5"
                  >
                    ${workout.calories}
                  </div>
                  <button class="delete btn btn-danger btn-sm mx-2">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
        `;
        workoutsEl.appendChild(workoutEl);
    }



    _render() {
        this._displayCaloriesTotal();
        this._displayCalorieConsumed();
        this._displayCaloriesBurned();
        this._displayCaloriesRemaining();
        this._displayCaloriesProgress();
    }
}

class Meal {
    constructor(name, calories) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calories = calories;
    }
}

class Workout {
    constructor(name, calories) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calories = calories;
    }
}

class Storage {
    static getCalorieLimit(defaultLimit = 2000) {
        let calorieLimit;
        if (localStorage.getItem('calorieLimit') === null) {
            calorieLimit = defaultLimit;
        } else {
            calorieLimit = parseInt(localStorage.getItem('calorieLimit'));
        }
        return calorieLimit;
    }

    static setCalorieLimit(calorieLimit) {
        localStorage.setItem('calorieLimit', calorieLimit);
    }

    static getTotalCalories(defaultCalories = 0) {
        let totalCalories;
        if (localStorage.getItem('totalCalories') === null) {
            totalCalories = defaultCalories;
        } else {
            totalCalories = parseInt(localStorage.getItem('totalCalories'));
        }
        return totalCalories;
    }

    static updateToalCalories(calories) {
        localStorage.setItem('totalCalories', calories);
    }

    static getMeals() {
        let meals;
        if (localStorage.getItem('meals') === null) {
            meals = [];
        } else {
            meals = JSON.parse(localStorage.getItem('meals'));
        }
        return meals;
    }

    static saveMeal(meal) {
        const meals = Storage.getMeals();
        meals.push(meal);
        localStorage.setItem('meals', JSON.stringify(meals));
    }

    static removeMeal(id) {
        const meals = Storage.getMeals();
        meals.forEach((meal, index) => {
            if (meal.id === id) {
                meals.splice(index, 1);
            }
        });
        localStorage.setItem('meals', JSON.stringify(meals));
    }

    static getWorkouts() {
        let workouts;
        if (localStorage.getItem('workouts') === null) {
            workouts = [];
        } else {
            workouts = JSON.parse(localStorage.getItem('workouts'));
        }
        return workouts;
    }

    static saveWorkout(workout) {
        const workouts = Storage.getWorkouts();
        workouts.push(workout);
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    static removeWorkout(id) {
        const workouts = Storage.getWorkouts();
        workouts.forEach((workout, index) => {
            if (workout.id === id) {
                workouts.splice(index, 1);
            }
        });
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    static clearAll() {
        //localStorage.clear(); // removes the caloriesLimit as well
        localStorage.removeItem('totalCalories')
        localStorage.removeItem('meals')
        localStorage.removeItem('workouts')
    }
}


class App {
    constructor() {
        this._tracker = new CaloriesTracker();
        this._loadEventListeners();
        this._tracker.loadItems();
    }
    _loadEventListeners() {
        //document.querySelector('#meal-form').addEventListener('submit', this._newMeal.bind(this));
        //document.querySelector('#workout-form').addEventListener('submit', this._newWorkout.bind(this));
        document.querySelector('#meal-form').addEventListener('submit', this._newItem.bind(this, 'meal'));
        document.querySelector('#workout-form').addEventListener('submit', this._newItem.bind(this, 'workout'));
        document.querySelector('#meal-items').addEventListener('click', this._removeItems.bind(this, 'meal'));
        document.querySelector('#workout-items').addEventListener('click', this._removeItems.bind(this, 'workout'));
        document.querySelector('#filter-meals').addEventListener('keyup', this._filterItems.bind(this, 'meal'));
        document.querySelector('#filter-workouts').addEventListener('keyup', this._filterItems.bind(this, 'workout'));
        document.querySelector('#reset').addEventListener('click', this._reset.bind(this));
        document.querySelector('#limit-form').addEventListener('submit', this._setLimit.bind(this));
    }

    // _newMeal(e) {
    //     e.preventDefault();
    //     const name = document.querySelector('#meal-name');
    //     const calories = document.querySelector('#meal-calories');

    //     // Validate inputs
    //     if (name.value === '' || calories.value === '') {
    //         alert('Please fill in all fields');
    //         return;
    //     }

    //     const meal = new Meal(name.value, parseInt(calories.value));
    //     this._tracker.addMeal(meal);

    //     name.value = '';
    //     calories.value = '';

    //     const collapseMeal = document.querySelector('#collapse-meal');
    //     const bsCollapse = new bootstrap.Collapse(collapseMeal, {
    //         toggle: true
    //     });
    // }
    // _newWorkout(e) {
    //     e.preventDefault();
    //     const name = document.querySelector('#workout-name');
    //     const calories = document.querySelector('#workout-calories');

    //     // Validate inputs
    //     if (name.value === '' || calories.value === '') {
    //         alert('Please fill in all fields');
    //         return;
    //     }

    //     const workout = new Workout(name.value, parseInt(calories.value));
    //     this._tracker.addWorkout(workout);

    //     name.value = '';
    //     calories.value = '';

    //     const collapseWorkout = document.querySelector('#collapse-workout');
    //     const bsCollapse = new bootstrap.Collapse(collapseWorkout, {
    //         toggle: true
    //     });
    // }

     _newItem(type, e) {
        e.preventDefault();
        const name = document.querySelector(`#${type}-name`);
        const calories = document.querySelector(`#${type}-calories`);

        // Validate inputs
        if (name.value === '' || calories.value === '') {
            alert('Please fill in all fields');
            return;
        }

        if (type === 'meal') {
            const meal = new Meal(name.value, parseInt(calories.value));
            this._tracker.addMeal(meal);
        } else {
            const workout = new Workout(name.value, parseInt(calories.value));
            this._tracker.addWorkout(workout);
        }

        name.value = '';
        calories.value = '';

        const collapseItem = document.querySelector(`#collapse-${type}`);
        const bsCollapse = new bootstrap.Collapse(collapseItem, {
            toggle: true
        });
    }
    _removeItems(type, e) {
        if (e.target.classList.contains('delete') || e.target.classList.contains('fa-xmark')) {
            if (confirm('Are you sure?')) {
                const id = e.target.closest('.card').getAttribute('data-id');
                console.log(id);

                type === 'meal'
                    ? this._tracker.removeMeal(id)
                    : this._tracker.removeWorkout(id);
                
                e.target.closest('.card').remove();
            }
        }
    }

    _filterItems(type, e) {
        const text = e.target.value.toLowerCase();
        document.querySelectorAll(`#${type}-items .card`).forEach((item) => {
            const name = item.firstElementChild.firstElementChild.textContent;

            if (name.toLowerCase().indexOf(text) !== -1) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    _reset() {
        this._tracker.reset();
        document.querySelector('#meal-items').innerHTML = '';
        document.querySelector('#workout-items').innerHTML = '';
        document.querySelector('#filter-meals').value = '';
        document.querySelector('#filter-workouts').value = ''; 
    }

    _setLimit(e) {
        e.preventDefault();
        const limit = document.querySelector('#limit');

        if (limit.value === '') {
            alert('Please add a limit');
            return;
        }

        this._tracker.setLimit(parseInt(limit.value));
        limit.value = '';

        const modalEl = document.querySelector('#limit-modal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    }




}

const app = new App();