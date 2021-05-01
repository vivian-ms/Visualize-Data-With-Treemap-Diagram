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
const w = 800;
const h = 300;
const colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];  // Source: https://colorbrewer2.org/?type=qualitative&scheme=Set3&n=12


window.onload = () => {
  updateInfo();

  Promise.all(datasets.map(d => fetch(d.url)))
         .then(responses => Promise.all(responses.map(response => response.json())))
         .then(data => {
           createCanvas(data[index]);

           document.querySelectorAll('.navbar a').forEach(elem => {
             elem.addEventListener('click', evt => {
               index = evt.target.getAttribute('data-index');
               updateInfo();
               createCanvas(data[index]);
             });
           });
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
  document.querySelector('#treemap_container').innerHTML = '';
}  // End updateInfo()


function createCanvas(data) {
  d3.select('#treemap_container')
    .append('svg')
    .attr('id', 'treemap')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  drawTreemap(data);
}  // End createCanvas()


function drawTreemap(data) {
  let category_array = data.children.map(child => child.name);
  let color_array = [];

  for (let i = 0; i < category_array.length; i++) {
    color_array.push(colors[i % colors.length]);
  }

  let colorScale = d3.scaleOrdinal()
                     .domain(category_array)
                     .range(color_array);

  let root = d3.hierarchy(data, d => d.children)
               .sum(d => d.value)
               .sort((a, b) => b.value - a.value);

   let treemap = d3.treemap()
                      .size([w, h]);

   treemap(root);

   let tiles = d3.select('#treemap').selectAll('g')
                 .data(root.leaves())
                 .enter()
                 .append('g')
                 .attr('transform', d => `translate(${d.x0}, ${d.y0})`);
   tiles.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => colorScale(d.data.category))
        .attr('stroke', 'black')
        .attr('stroke-width', '0.01rem')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .classed('tile', true);
}  // End drawTreemap()
