
console.log(apiKey);
const mealForm = document.getElementById('form1');
const mealPlanContainer = document.getElementById('mealPlan');


function calculateBFP(BMI, age, gender){
  let BFP=0;
  if (gender === 'Male' && age >= 18) {
    BFP = 1.20 * BMI + 0.23 * age - 16.2;
   
  } else if (gender === 'Male' && age < 18) {
    BFP = 1.51 * BMI - 0.70 * age - 2.2;
   
  } else if (gender === 'Female' && age >= 18) {
    BFP = 1.20 * BMI + 0.23 * age - 5.4;
   
  } else if (gender === 'Female' && age < 18) {
    BFP = 1.51 * BMI - 0.70 * age + 1.4;
    
  }
  return BFP
  }
  
  function calculateBMR(age, gender, weight, height) {
    let bmr = 0;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'Female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      
    }
    return bmr;
  }
  
  function calculateTDEE(bmr, activity) {
    let tdee = 0;
  
    switch (activity) {
      case 'sedentary':
        tdee = bmr * 1.2;
        break;
      case 'lightlyActive':
        tdee = bmr * 1.375;
        break;
      case 'moderatelyActive':
        tdee = bmr * 1.55;
        break;
      case 'veryActive':
        tdee = bmr * 1.725;
        break;
      case 'extraActive':
        tdee = bmr * 1.9;
        break;
    }
  
    return tdee;
  }

  function updateValues(){
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activity = document.getElementById('activity').value;
    const BMI = (weight)/(Math.pow((height/100), 2))
    
    const bmr = calculateBMR(age, gender, weight, height);
    const tdee = calculateTDEE(bmr, activity);
    const calorieGoal = Math.round(tdee);  // Calculate user's daily calorie needs using Mifflin-St Jeor equation
    const fat = Math.round(calculateBFP(BMI, age, gender));
    document.getElementById('fat').value = fat;
    document.getElementById('cal').value = calorieGoal;
    return calorieGoal
  }
  mealForm.addEventListener('input', updateValues);
 
  function fetchRecipe(mealId) {
    
    if (mealId) {
      const recipeUrl = `https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${apiKey}`;
      
      fetch(recipeUrl)
        .then(response => response.json())
        .then(recipeData => {
          // Display recipe and ingredients
          const recipeHTML = `
            <h2 >${recipeData.title}  <span id="symbox">${recipeData.vegetarian ? '<span class="green-symbol">&#x1F7E2;</span>' : '<span class="brown-symbol">&#x1F7E4;</span>'}</span></h2>
            <span><h4>Servings: </h4>${recipeData.servings} </span>
            <span><h4>Ready in minutes: </h4>${recipeData.readyInMinutes}</span>
            <span><h4>Meal Type: </h4>${recipeData.dishTypes[0]}</span>
            <h4>Ingredients: </h4>
            <ul>
              ${recipeData.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
            </ul>
            <h4>How to make: </h4>
            <ul>${recipeData.instructions}</ul>
            <p>${recipeData.nutrients}</p>
          `;
          
          const recipeContent = document.getElementById('recipeContent');
          recipeContent.innerHTML = recipeHTML;

          const recipeModal = document.getElementById('recipeModal');
          recipeModal.style.display = 'block';

          const closeButton = document.getElementsByClassName('close')[0];
          closeButton.addEventListener('click', function(){
            recipeModal.style.display = 'none'
          })
        })
        .catch(error => {
          console.error('Error fetching recipe:', error);
        });
    } else {
      console.log("No meal ID provided");
    }
  }

  let meal_data;
  mealForm.addEventListener('submit', function(event){
  event.preventDefault();
  
  const type = document.getElementById('mealType').value;
  const bmr = calculateBMR(age, gender, weight, height);
    const tdee = calculateTDEE(bmr, activity);
    const calorieGoal = updateValues();
    let targetCal = 0;
    let mealType1, mealType2 = type;
    let url1;
    
  
function nutritioninfo(mealId){
  const id = mealId.id
url2 = `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${apiKey}`;
fetch(url2)
.then(response=> response.json())
.then(data=>{
  
  const nutrientsinfo = 
  `
  <h4>Nutrients</h4>
  <p>Calories:${data.calories} Cal</p>
  <p>Fat:${data.fat} </p>
  <p>Carbohydrates:${data.carbs} </p>
  <p>Protein:${data.protein} </p>
  `;
  const nutrientsContainer = document.getElementById(`nutrients-${id}`);
  if (nutrientsContainer) {
    nutrientsContainer.innerHTML = nutrientsinfo;
  }
})
.catch(error => {
  console.error('Error in getting nutirents', error);
});
}
 
 // Make API request to generate meal plan
 if(type ==='All Three'){
  const url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${calorieGoal}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Display the generated meal plan
      const meals = data.meals;
      const mealPlanHTML = meals.map((meal, index) => {
        return `
          <div>
          <h3>Meal ${index + 1}</h3>
          <p>${meal.title}</p>
          <img src="https://webknox.com/recipeImages/${meal.id}-556x370.jpg" width="100px" height=100px" alt="Meal ${index + 1} Image"><br>
          <button class="show-recipe-button" data-recipe-id="${meal.id}">Show Recipe</button><br>
          <div id="nutrients-${meal.id}"></div>
          </div>
         
        `;
      }).join('');
     
      mealPlanContainer.innerHTML = mealPlanHTML;
      meal_data = meals[0].title+','+meals[1].title+','+meals[2].title;
      console.log(meal_data);
      
      meals.forEach(meal => {
        nutritioninfo(meal);
      });
      
      })
    .catch(error => {
      console.error('Error generating meal plan:', error);
    });}

    else{
      if(type === 'breakfast'){
        targetCal = Math.round(.25 * calorieGoal);
        mealType1 === type;
        url1 = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&type=breakfast&targetCalories=${targetCal}`;
      }
      else if(type ==='dinner'){
        targetCal = Math.round(.25 * calorieGoal);
        mealType1 = 'maincourse';
        mealType2='salad';
       url1 = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&type=maincourse&targetCalories=${targetCal}`;
      }
      else if(type === 'lunch'){
        targetCal = Math.round(.50 * calorieGoal);
        mealType1 = 'maincourse';
        mealType2 = 'salad';
       url1 = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&type=maincourse,maincourse&targetCalories=${targetCal}`;
      }

      // const url1 = `https://api.spoonacular.com/mealplanner/generate&type=${mealType1}${mealType2 ? `,${mealType2}` : ''}&targetCalories=${targetCal}`;      
      fetch(url1)
      .then(response =>response.json())
      .then(data=>{
        const meals = data.meals;
        const mealPlanHTML = meals.map((meal, index) => {
          return `
            <div>
            <h3>Meal ${index + 1}</h3>
            <p>${meal.title}</p>
            <img src="https://webknox.com/recipeImages/${meal.id}-556x370.jpg" width="100px" height=100px" alt="Meal ${index + 1} Image"><br>
            <button class="show-recipe-button" data-recipe-id="${meal.id}">Show Recipe</button><br>
            <div id="nutrients-${meal.id}"></div>
            </div>
           
          `;
        }).join('');
  
        mealPlanContainer.innerHTML = mealPlanHTML;
        meal_data = meals[0].title+','+meals[1].title+','+meals[2].title;
        
       
        meals.forEach(meal => {
          nutritioninfo(meal);
        });
       
        }
      )
      .catch(error => {
        console.error('Error generating meal plan:', error);
      });
    }
    mealPlanContainer.addEventListener('click', function(event){
      const target = event.target;

      if(target.classList.contains('show-recipe-button')){
        const recipeId = target.getAttribute('data-recipe-id');
        fetchRecipe(recipeId);
      }
    })
});

const savebutton = document.getElementById('save-button');


// savebutton.addEventListener('click',function(){
      
//       const type = document.getElementById('mealType').value;
//       const currentDate = new Date();
//       let doc =  confirm("Are you sure you want to save it for future?");
      
//       if(doc){
//       const datalist = {
//         meal_type: type,
//         meal_data: meal_data,
//         date_planned: currentDate.toISOString().split('T')[0],
//         time_planned: currentDate.toTimeString().split(' ')[0],
//       };
//       // Send data to the backend to save the meal
//       const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
//       fetch('api/meals/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRFToken': csrftoken,
//           'Authorization': `Token ${token}`
//         },
//         body: JSON.stringify(datalist),
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           // console.log(data);
//           alert('Meal saved successfully!');
//         })
//         .catch((error) => {
//           console.error('Error saving meal:', error);
//           alert('An error occurred while saving the meal.');
//         });}
//       })
// const historyButton = document.getElementById('historyButton');
// const historyContent = document.getElementById('historyContent');
// const historyModal = document.getElementById('historyModal');
// const historyTable = document.getElementById('historyTable');

// historyForm.addEventListener('submit',function(event){
//   fetch('api/user/history/', {
//     method: 'GET',
//     headers: {
//       'X-CSRFToken': csrfToken
//     }   
//   })
//   .then(response => response.json())
//   .then(data => {
//     if (data.success) {
//       // Display user history in the historyContent element
//       const historyHTML = 
//         `<table class="historytable" id="data-table">
//         <thead>
//         <tr>
//         <th>Date</th>
//         <th>Time</th>
//         <th>Meal </th>
//         <th>List of meals</th>
//         </tr> 
//         </thead>  
//         <tr id="filterrows">
//         <th><select id="filterDate"></select></th>
//         <th><select id="filterTime"></select></th>
//         <th><select id="filterType"></select></th>
//         <th><select id="filterMeal"></select></th>
//         </tr>   
        
//         <tbody>
//        ${data.meal_history.map(meal => `
//         <tr>
//         <td>${meal.date_planned}</td><td>${meal.time_planned}</td><td>${meal.meal_type}</td><td>${meal.meal_data}</td>
//         </tr> `).join('')}
//         </tbody>
//         </table>`;
//       // console.log(data.meal_history);
//       historyContent.innerHTML = historyHTML;
//       historyModal.style.display = 'block';

      
//       function populateFilterDropdown(filterId, columnIndex){
//         const dropdown = document.getElementById(filterId);
//         const columnCells = document.querySelectorAll(`#historyContent .historytable tbody tr td:nth-child(${columnIndex})`);
//         const cellWidths = Array.from(columnCells).map(cell => cell.offsetWidth);
    
//         // Calculate the maximum width of the column
//         const maxWidth = Math.max(...cellWidths);
    
//         // Apply the maximum width to the dropdown options and table cells
//         dropdown.style.width = `${maxWidth}px`;
    
//         columnCells.forEach(cell => {
//             cell.style.maxWidth = `${maxWidth}px`;
//             cell.style.whiteSpace = 'normal';
//         });
//         const uniqueValues = Array.from(new Set([...document.querySelectorAll(`#historyContent .historytable tbody tr td:nth-child(${columnIndex})`)].map(cell => cell.textContent)));
//        dropdown.innerHTML = '<option value="">Select...</option>';
//        console.log(uniqueValues);
//         uniqueValues.forEach(unique => {
//             const option = document.createElement('option');
//             option.textContent = unique;
//             option.classList.add('dropdown-option');
//             dropdown.appendChild(option);
//         });
//       }
//     populateFilterDropdown('filterDate', 1);
//     populateFilterDropdown('filterTime', 2);
//     populateFilterDropdown('filterType', 3);
//     populateFilterDropdown('filterMeal', 4);
      
//     function filterTable(){
//       const filterDate = document.getElementById('filterDate').value;
//       const filterTime = document.getElementById('filterTime').value;
//       const filterType = document.getElementById('filterType').value.toLowerCase();
//       const filterMeal = document.getElementById('filterMeal').value.toLowerCase();
    
//       const rows = document.querySelectorAll('#data-table tbody tr');
    
//       rows.forEach(row=>{
//         const date = row.cells[0].textContent.toLowerCase();
//         const time = row.cells[1].textContent.toLowerCase();
//         const type = row.cells[2].textContent.toLowerCase();
//         const meal = row.cells[3].textContent.toLowerCase();
//         const isVisible = date.includes(filterDate) && time.includes(filterTime) && type.includes(filterType)&& meal.includes(filterMeal);
    
//         row.style.display = isVisible ? 'table-row' : 'none';
//       });
//     }
//     document.getElementById('data-table').addEventListener('change', function(event) {
//       if (event.target.id === 'filterDate' || event.target.id === 'filterTime' || event.target.id === 'filterType' || event.target.id === 'filterMeal') {
//           filterTable();
//       }
//     });
        
//       const closeButton = document.querySelector('.closetable');
//       closeButton.addEventListener('click', function() {
//        historyModal.style.display = 'none';
       
//       });
//     } else {
//       // Display error message for invalid credentials
//       historyContent.innerHTML = '<p>Invalid credentials.</p>';
//     }
//   })
//   .catch(error => {
//     console.error('Error fetching user history:', error);
//     historyContent.innerHTML = '<p>An error occurred while fetching user history.</p>';
//   });
// })

// function exportTableToCSV() {
//   const rows = document.querySelectorAll('#data-table tbody tr');
//   let csvContent = 'Date,Time,Meal Type,List of meals\n';

//   // Collect data from the table rows
//   rows.forEach(row => {
//     const rowData = [];
//     row.querySelectorAll('td').forEach(cell => {
//       rowData.push(cell.textContent);
//     });
//     csvContent += rowData.join(',') + '\n';
//   });

//   const csvBlob = new Blob([csvContent], { type: 'text/csv' });

//   const downloadLink = document.createElement('a');
//   downloadLink.href = URL.createObjectURL(csvBlob);
//   downloadLink.download = 'table.csv';
//   downloadLink.click();
// }

document.addEventListener('DOMContentLoaded', function () {
  const HomeSaveButton = document.getElementById('home-save');
  HomeSaveButton.addEventListener('click', () => {
      alert("Please login to save the meal");

  });
});


