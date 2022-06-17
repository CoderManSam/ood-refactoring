const maxCapacity = 100
const anHour = 60
const timeItTakesToCleanScreen = 20

class Cinema {

  constructor() {
    this.films = []
    this.screens = []
  }

  addNewScreen(screenName, capacity) {
    if (capacity > maxCapacity) {
      return 'Exceeded max capacity'
    }

    //Check the screen doesn't already exist
    let screen = null
    for (let i=0;i<this.screens.length;i++) {
      if (this.screens[i].name===screenName) {
        screen = this.screens[i]
      }
    }

    if(screen!=null) {
      return 'Screen already exists'
    }

    this.screens.push({
      name: screenName,
      capacity: capacity,
      showings : []
    })
  }

  addNewFilm(movieName, rating, duration) {

    //Check the film doesn't already exist
    let movie = null
    for (let i=0;i<this.films.length;i++) {
      if (this.films[i].name==movieName) {
        movie = this.films[i]
      }
    }

    if(movie!=null) {
      return 'Film already exists'
    }

    const ratingIsInvalid = rating!="U" && rating!="PG" && rating!="12" && rating!="15" && rating!="18"

    if (ratingIsInvalid) {
        return 'Invalid rating'
    }
    
    const durationValidity = /^(\d?\d):(\d\d)$/.exec(duration)
    if(durationValidity==null) {
      return 'Invalid duration'
    }

    const hours = parseInt(durationValidity[1])
    const mins = parseInt(durationValidity[2])
    if(hours<=0 || mins>anHour) {
      return 'Invalid duration'
    }

    this.films.push({name:movieName, rating:rating, duration: duration})
  }

  addShowing(movie, screenName, startTime) {

    let startTimeValidity = /^(\d?\d):(\d\d)$/.exec(startTime)
    if(startTimeValidity==null) {
      return 'Invalid start time'
    }

    const intendedStartTimeHours = parseInt(startTimeValidity[1])
    const intendedStartTimeMinutes = parseInt(startTimeValidity[2])
    if(intendedStartTimeHours<=0 || intendedStartTimeMinutes>anHour) {
      return 'Invalid start time'
    }


    let film = null
    //Find the film by name
    for (let i=0;i<this.films.length;i++) {
      if (this.films[i].name==movie) {
        film = this.films[i]
      }
    }

    if(film===null) {
      return 'Invalid film'
    }

    //From duration, work out intended end time
    startTimeValidity = /^(\d?\d):(\d\d)$/.exec(film.duration)
    if(startTimeValidity==null) {
      return 'Invalid duration'
    }

    const durationHours = parseInt(startTimeValidity[1])
    const durationMins = parseInt(startTimeValidity[2])
    
    let intendedEndTimeHours = intendedStartTimeHours + durationHours
    
    let intendedEndTimeMinutes = intendedStartTimeMinutes + durationMins + timeItTakesToCleanScreen
    if (intendedEndTimeMinutes>=anHour) {
      intendedEndTimeHours += Math.floor(intendedEndTimeMinutes/anHour)
      intendedEndTimeMinutes = intendedEndTimeMinutes%anHour
    }

    const filmEndsAfterMidnight = intendedEndTimeHours>=24

    if(filmEndsAfterMidnight) {
      return 'Invalid start time - film ends after midnight'
    }

    //Find the screen by name
    let theatre = null
    for (let i=0;i<this.screens.length;i++) {
      if (this.screens[i].name==screenName) {
        theatre = this.screens[i]
      }
    }

    if(theatre===null) {
      return 'Invalid screen'
    }
    
    //Go through all existing showings for this film and make
    //sure the start time does not overlap 
    let error = false
    for(let i=0;i<theatre.showings.length;i++) {

      //Get the start time in hours and minutes
      const startTime = theatre.showings[i].startTime
      startTimeValidity = /^(\d?\d):(\d\d)$/.exec(startTime)
      if(startTimeValidity==null) {
        return 'Invalid start time'
      }
  
      const startTimeHours = parseInt(startTimeValidity[1])
      const startTimeMins = parseInt(startTimeValidity[2])
      if(startTimeHours<=0 || startTimeMins>anHour) {
        return 'Invalid start time'
      }

      //Get the end time in hours and minutes
      const endTime = theatre.showings[i].endTime
      startTimeValidity = /^(\d?\d):(\d\d)$/.exec(endTime)
      if(startTimeValidity==null) {
        return 'Invalid end time'
      }
  
      const endTimeHours = parseInt(startTimeValidity[1])
      const endTimeMins = parseInt(startTimeValidity[2])
      if(endTimeHours<=0 || endTimeMins>anHour) {
        return 'Invalid end time'
      }

      //if intended start time is between start and end
      const intendedStartTime = new Date()
      intendedStartTime.setMilliseconds(0)
      intendedStartTime.setSeconds(0)
      intendedStartTime.setMinutes(intendedStartTimeMinutes)
      intendedStartTime.setHours(intendedStartTimeHours)

      const intendedEndTime = new Date()
      intendedEndTime.setMilliseconds(0)
      intendedEndTime.setSeconds(0)
      intendedEndTime.setMinutes(intendedEndTimeMinutes)
      intendedEndTime.setHours(intendedEndTimeHours)

      const actualStartTime = new Date()
      actualStartTime.setMilliseconds(0)
      actualStartTime.setSeconds(0)
      actualStartTime.setMinutes(startTimeMins)
      actualStartTime.setHours(startTimeHours)

      const actualEndTime = new Date()
      actualEndTime.setMilliseconds(0)
      actualEndTime.setSeconds(0)
      actualEndTime.setMinutes(endTimeMins)
      actualEndTime.setHours(endTimeHours)

      if ((intendedStartTime > actualStartTime && intendedStartTime < actualEndTime) || 
          (intendedEndTime > actualStartTime && intendedEndTime < actualEndTime) || 
          (intendedStartTime < actualStartTime && intendedEndTime > actualEndTime) ) {
        error = true
        break
      }
    }

    if(error) {
      return 'Time unavailable'
    }

    theatre.showings.push({
      film: film,
      startTime: startTime,
      endTime: intendedEndTimeHours + ":" + intendedEndTimeMinutes
    })
  } 

  allShowings() {
    let showings = {}
    for (let i=0;i<this.screens.length;i++) {
      const screen = this.screens[i]
      for(let j=0;j<screen.showings.length;j++) {
        const showing = screen.showings[j]
        if (!showings[showing.film.name]) {
          showings[showing.film.name] = []
        }
        showings[showing.film.name].push( `${screen.name} ${showing.film.name} (${showing.film.rating}) ${showing.startTime} - ${showing.endTime}`)
      }
    }
  
    return showings
  }
}

module.exports = Cinema