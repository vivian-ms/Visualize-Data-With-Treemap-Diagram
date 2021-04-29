const datasets = [
  {
    name: 'Kickstarter Pledges',
    description: 'Top 100 Kickstarter Pledges Grouped by Category',
    group: 'Category',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
  },
  {
    name: 'Movie Sales',
    description: 'Top 100 Highest Grossing Movies Grouped by Genre',
    group: 'Genre',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
  },
  {
    name: 'Video Game Sales',
    description: 'Top 100 Video Game Sales Grouped by Platform',
    group: 'Platform',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
  }
];
var index = 0;


window.onload = () => {
  updateInfo();

  document.querySelectorAll('.navbar a').forEach(elem => {
    elem.addEventListener('click', evt => {
      index = evt.target.getAttribute('data-index');
      updateInfo();
    });
  });

  Promise.all(datasets.map(d => fetch(d.url)))
         .then(responses => Promise.all(responses.map(response => response.json())))
         .then(data => {
           console.log(data);
         })
         .catch(err => {
           console.log(`ERROR: ${err}`);
         });
};  // End window.onload()


function updateInfo() {
  document.querySelectorAll('title, #title').forEach(elm => {
    elm.innerHTML = datasets[index].name;
  });
  document.querySelector('#description').innerHTML = datasets[index].description;
}  // End updateInfo()
