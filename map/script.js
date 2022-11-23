'use strict'




class Workout {
    date = new Date()
    id =(Date.now() + '').slice(-10)
    // to get unique identifier
    clicks = 0;


    constructor(cords, distance, duration){
        this.cords = cords;
        this.distance = distance;
        this.duration = duration;

    }

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;



    }
    click(){
        this.clicks++;
    }
}

class Running extends Workout{
    type = 'running';
    constructor(cords, distance, duration, cadence){
        super(cords, distance, duration)
        this.cadence = cadence

        // calling the method in the construction method
        this.calPace();
        this._setDescription()
    }
    // callculate the pace
    calPace(){
        this.pace = this.duration/ this.distance
        return this.pace;
    }
}

class Cycling extends Workout{
    type = 'cycling';
    constructor(cords, distance, duration,ElevationGain){
        super(cords, distance, duration)
        this.ElevationGain = ElevationGain;

        this._setDescription();
        
        this.calSpeed();
    }

    calSpeed(){
        this.speed = this.distance / (this.duration/60)
        return this.speed;
    }
}
// const newRunning = new Running([39,-12],5.2,24,178)
// const newCycling = new Cycling([39, -12],27,95, 5000)
// console.log(newRunning, newCycling)

// Application Archectecture

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{
    #map;
    #mapEvent;
    #mapZoomLevel = 13
    #workouts = [];
    constructor(){
        // get umap position
        this._getPosition()


        // get data from local storage
        this._getLocalStorage() 
     

        
        // attaching event listener
        form.addEventListener('submit', this._newWorkOut.bind(this))  
        inputType.addEventListener('change', this._toggleElevationField)
        // containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this))

    }

    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
                alert("couldn't get your current position")
            })
        
        }
    }

    _loadMap(position){
     
     // using destructuring to the the latitude and longititude
            const {latitude,longitude} = position.coords
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
         
            const coords = [latitude, longitude]
            
            console.log(this)
             this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
     
             L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             }).addTo(this.#map);
     
             
             // handle click on map
             this.#map.on('click', this._showForm.bind(this))

             this.#workouts.forEach(work=>{
                this._renderWorkOutMarker(work)
            })

            
    }

    _showForm(mapE){
        this.#mapEvent = mapE
        form.classList.remove("hidden")
        inputDistance.focus()
    }

    _hideForm(){
        // empty the input
        inputDistance.value = inputDuration.value = inputCadence.value = '';
        form.style.display = 'none';
        form.classList.add("hidden")
        setTimeout(()=>form.style.display='grid',1000)
    }

    _toggleElevationField(){
        inputElevation.closest(".form__row").classList.toggle('form__row--hidden')
        inputCadence.closest(".form__row").classList.toggle('form__row--hidden')
    }

    _newWorkOut(e){

        // using every to check it they are all finite using every method
        const validInput = (...input)=>input.every(inpt=>Number.isFinite(inpt))
        const allPositive = (...input)=>input.every(inpt=>inpt > 0)
        e.preventDefault();

        // get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat,lng} =this.#mapEvent.latlng;
        let workOut;

        // check if the data is valid

        // if workout runing , create a runing object
        if(type === "running"){
            const cadence = +inputCadence.value;
            if (!validInput(distance, duration, cadence) || !allPositive(distance, duration, cadence))  return alert("this is not a number")

            workOut = new Running([lat,lng],distance, duration, cadence)
            
        
        
        }


        // if the workout cycling, create a cycling object
        if(type === "cycling"){
            const elevation = +inputElevation.value;
            if(!validInput(distance, duration, elevation) || !allPositive(distance, duration))return alert('this is not a number')

            workOut = new Cycling([lat,lng], distance, duration,elevation)

        }

        //add new object to workout array
        this.#workouts.push(workOut)

        console.log(workOut)

        //render workout on the map as a marker
        this._renderWorkOutMarker(workOut)
        
        
       

        // render the new workout on the list
        this._renderWorkOut(workOut)
       

        // hide the form aand clear the input field 
        this._hideForm()
      
        
    
        this._setLocalStorage()
        // set local storage
        
        
  
  
              // put it into an array
             
    }
    _renderWorkOutMarker(workOut){
        L.marker(workOut.cords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth:250, 
            minWidth:200,
            autoClose:false,
            closeOnClick:false,
            className:`${workOut.type}-popup`,
        }))
        .setPopupContent(`${workOut.type === "running" ? '🏃‍♂️':'🚴‍♀️'} ${workOut.description}`)
        .openPopup();
    }

    _renderWorkOut(workOut){
        let html = `
            <li class="workout workout--${workOut.type}" data-id="${workOut.id}">
            <h2 class="workout__title">${workOut.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workOut.type === "running" ? '🏃‍♂️':'🚴‍♀️'}</span>
                <span class="workout__value">${workOut.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workOut.duration}</span>
                <span class="workout__unit">min</span>
            </div>
        
        `;

        if(workOut.type === "running")
            html += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workOut.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workOut.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
            </li>
            
        `;
        
        if(workOut.type === "cycling")
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workOut.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workOut.ElevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
            </li>
            
            `;

            form.insertAdjacentHTML('afterend', html);


    }

    _moveToPopUp(e){
        if (!this.#map) return;

        const workoutEl = e.target.closest('.workout');
        console.log(workoutEl)
    
        if (!workoutEl) return;
    
        const workout = this.#workouts.find(
          work => work.id === workoutEl.dataset.id
        );
    
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
          animate: true,
          pan: {
            duration: 1,
          },
        });


        // workout.click()
       


    }

    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }

    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'))
        

        // if the doesnt exist that a guide clause

        if(!data)return;
        
        this.#workouts = data;
        

        this.#workouts.forEach(work=>{
            this._renderWorkOut(work)
        })
    }

    



    
}
const app = new App();
 



