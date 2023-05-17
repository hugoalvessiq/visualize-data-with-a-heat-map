const {
  json,
  timeFormat,
  tickFormat,
  ticks,
  tooltip,
  format,
  scaleBand,
  scaleLinear,
  max,
  min,
  axisBottom,
  axisLeft,
  select,
} = d3;

const dataMonth = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((data) => {
  const w = 1200;
  const h = 550;
  const padding = 70;

  const minYear = min(data.monthlyVariance, (d) => d.year);
  const maxYear = max(data.monthlyVariance, (d) => d.year);

  const rectHeight = (h - 2 * padding) / 12;
  const rectWidth = w / Math.floor(data.monthlyVariance.length / 13);

  const tempScale = scaleLinear().domain([1, 14]).range([0, 14]);

  const tempVariance = [];
  data.monthlyVariance.forEach((e) => {
    return tempVariance.push(e.variance);
  });

  const temperatureRounded = [];
  tempVariance.map((d, i) => {
    temperatureRounded.push(
      d > 0 ? data.baseTemperature + d : data.baseTemperature - Math.abs(d)
    );
  });

  const mouseMove = (d, i) => {
    const month = d3.utcFormat("%B")(
      new Date().setUTCMonth(d.srcElement.dataset.month)
    );
    const year = d.srcElement.dataset.year;
    const tooltipTemp = parseFloat(d.srcElement.dataset.temp).toFixed(1);

    const tempDiference = tooltipTemp - data.baseTemperature;

    tooltip
      .attr("data-year", `${year}`)
      .style("left", d.pageX + 10 + "px")
      .style("top", d.pageY + 20 + "px");

    d3.selectAll("#tooltip")
      .html(
        `${year} - ${month} <br/> ${tooltipTemp}°C <br/> ${tempDiference.toFixed(
          1
        )}°C`
      )
      .style("font-size", "1rem");

    return tooltip.style("visibility", "visible");
  };

  const mouseOver = (d, i) => {
    return tooltip.style("visibility", "visible");
  };

  const mouseOut = (d, i) => {
    return tooltip.style("visibility", "hidden");
  };

  const colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061",
  ].reverse();

  const tooltip = d3
    .select("body")
    .append("div")
    .data(data.monthlyVariance)
    .style("position", "absolute")
    .attr("id", "tooltip")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "grey")
    .style("padding", "10px")
    .style("opacity", 1)
    .style("color", "white")
    .style("text-align", "center")
    .style("border-radius", "5px");

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", 600)
    .style("padding", 20)
    .style("display", "flex")
    .style("margin", "30 auto")
    .style("font-family", "Helvetica");

  svg
    .append("text")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("font-size", "23")
    .attr("transform", "translate(360,17)")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature");

  svg
    .append("text")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("font-size", "15")
    .attr("transform", "translate(450,45)")
    .style("display", "flex")
    .style("margin", "auto")
    .attr("id", "description")
    .text(
      `${minYear} - ${maxYear}:  base temperature ${data.baseTemperature}°C`
    );

  const xScale = d3
    .scaleLinear()
    .domain([new Date(minYear), new Date(maxYear)])
    .range([padding, w - padding]);

  const xAxis = axisBottom(xScale).tickFormat(format("d"));

  const yScale = d3
    .scaleBand()
    .domain(dataMonth)
    .range([padding, h - padding]);

  const yAxis = axisLeft(yScale).tickFormat((d, i) => {
    return d3.utcFormat("%B")(new Date().setUTCMonth(d));
  });

  svg
    .selectAll("rect")
    .data(data.monthlyVariance)
    .join("rect")
    .attr("class", "cell")
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month - 1))
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .on("mouseover", (d, i) => mouseOver(d, i))
    .on("mousemove", (d, i) => mouseMove(d, i))
    .on("mouseout", (d, i) => mouseOut(d, i));

  svg
    .selectAll(".cell")
    .data(temperatureRounded)
    .attr("fill", (d) => colors[Math.floor(tempScale(d))]);

  svg
    .selectAll("rect")
    .data(temperatureRounded)
    .attr("data-temp", (d) => {
      return d;
    });

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

  /* **************** Legends **************** */

  const minimumTemperature = data.baseTemperature + min(tempVariance);
  const maximumTemperature = data.baseTemperature + max(tempVariance);

  svg.append("g").attr("transform", "translate(360,550)").attr("id", "legend");

  formatNumber = d3.format(".1f");

  const temperatureDomain = (min, max) => {
    const tempVariation = [];
    const tempColor = formatNumber((max - min) / colors.length);

    colors.map((d, i) => {
      tempVariation.push(minimumTemperature + i * tempColor);
    });

    return tempVariation;
  };

  const threshold = d3
    .scaleThreshold()
    .domain(temperatureDomain(minimumTemperature, maximumTemperature))
    .range(colors);

  const x = d3
    .scaleLinear()
    .domain([minimumTemperature, maximumTemperature])
    .range([0, 400]);

  const xAxisLegend = d3
    .axisBottom()
    .scale(x)
    .tickSize(30, 0)
    .tickValues(threshold.domain())
    .tickFormat((d) => formatNumber(d));

  const g = d3.select("#legend").call(xAxisLegend);

  g.select(".domain").remove();

  g.selectAll("rect")
    .data(
      threshold.range().map((color) => {
        const d = threshold.invertExtent(color);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .insert("rect", ".tick")
    .attr("height", 20)
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("fill", (d) => threshold(d[0]));

  g.append("text")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .attr("font-size", "15")
    .attr("y", -6)
    .text("Temperature variation");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -300)
    .attr("font-size", "12")
    .attr("y", 11)
    .text("Months");

  svg
    .append("text")
    .attr("transform", "translate(1400,510)")
    .attr("x", -300)
    .attr("font-size", "12")
    .attr("y", 11)
    .text("Years");
});
