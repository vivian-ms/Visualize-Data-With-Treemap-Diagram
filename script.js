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
const tree = {
  w: 800,
  h: 300
};
const legend_box = {
  w: 300,
  h: 100
};
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
  document.querySelector('title').innerHTML = `Top 100 ${datasets[index].name}`;
  document.querySelector('#title').innerHTML = datasets[index].name;
  document.querySelector('#description').innerHTML = datasets[index].description;
  document.querySelector('#treemap_container').innerHTML = '';
  document.querySelector('#legend_container').innerHTML = '';
}  // End updateInfo()


function createCanvas(data) {
  d3.select('#treemap_container')
    .append('svg')
    .attr('id', 'treemap')
    .attr('viewBox', `0 0 ${tree.w} ${tree.h}`)
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

  let tooltip = d3.select('#treemap_container')
                  .append('div')
                  .attr('id', 'tooltip')
                  .style('opacity', 0);

  let root = d3.hierarchy(data, d => d.children)
               .sum(d => d.value)
               .sort((a, b) => b.value - a.value);

  let treemap = d3.treemap()
                  .size([tree.w, tree.h]);

  treemap(root);

  let tiles = d3.select('#treemap').selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
                .on('mouseover', (evt, d) => {
                  d3.select(evt.currentTarget.querySelector('rect')).transition()
                    .duration(50)
                    .attr('stroke-width', '0.1rem');
                  tooltip.transition()
                         .duration(50)
                         .style('opacity', 1)
                         .style('left', `${evt.pageX - 150}px`)
                         .style('top', `${evt.pageY - 300}px`);
                  tooltip.attr('data-value', d.data.value)
                         .html(() => {
                           let format = d3.format(',');
                           return `<h4>${d.data.name}</h4> <p>${datasets[index].group}: ${d.data.category}</p> <p>Value: ${format(d.data.value)}</p>`;
                         })
                })
                .on('mouseleave', (evt, d) => {
                  d3.select(evt.currentTarget.querySelector('rect')).transition()
                    .duration(50)
                    .attr('stroke-width', '0.01rem');
                  tooltip.transition()
                         .duration(50)
                         .style('opacity', 0);
                });
  tiles.append('rect')
       .attr('x', 0)
       .attr('y', 0)
       .attr('width', d => d.x1 - d.x0)
       .attr('height', d => d.y1 - d.y0)
       .attr('fill', d => colorScale(d.data.category))
       .attr('stroke-width', '0.01rem')
       .attr('data-name', d => d.data.name)
       .attr('data-category', d => d.data.category)
       .attr('data-value', d => d.data.value)
       .classed('tile', true);
  tiles.append('text')
       .classed('tile-text', true)
       .selectAll('tspan')
       .data(d => (d.data.name).split(' '))
       .enter()
       .append('tspan')
       .attr('x', 2)
       .attr('y', (d, i) => i * 8 + 8)
       .text(d => d);

  drawLegend(category_array, colorScale);
}  // End drawTreemap()


function drawLegend(data, scale) {
  let legend = d3.select('#legend_container')
                 .append('svg')
                 .attr('id', 'legend')
                 .attr('viewBox', `0 0 ${legend_box.w} ${legend_box.h}`)
                 .attr('preserveAspectRatio', 'xMidYMid meet');
  legend.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .classed('legend-item', true)
        .attr('x', (d, i) => (i % 4) * 70 + 15)
        .attr('y', (d, i) => Math.floor(i / 4) * 15 + 10)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', d => scale(d));
  legend.selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .classed('legend-text', true)
        .attr('x', (d, i) => (i % 4) * 70 + 28)
        .attr('y', (d, i) => Math.floor(i / 4) * 15 + 17)
        .text(d => d);
}  // End drawLegend()
