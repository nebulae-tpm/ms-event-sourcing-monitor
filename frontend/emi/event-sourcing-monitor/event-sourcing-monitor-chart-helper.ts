export enum TimeRanges {
  MINUTE = 1,
  HOUR = 2,
  DAY = 3,
  MONTH = 4,
  YEAR = 5
}

export class NgxChartsPieChart {
  doughnut: boolean;
  explodeSlices: boolean;
  results: { name: string; value: number }[];
  gradient: boolean;
  labels: boolean;
  legend: boolean;
  scheme: { domain: string[] };
  onSelect: () => void;
  clearResultData: () => void;
  updateResultData: () => void;
  constructor(){
    this.doughnut = true;
    this.results = [];
    this.explodeSlices = false;
    this.gradient = false;
    this.labels = true;
    this.legend = false;
    this.scheme = {
      domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63']
    };
  }
}

export const genericLineChart = {
  name: 'generalEventsOverView',
  ready: false,
  showFilterForm: false,
  optionsToFilter: [],
  filtersApplied: [],
  timeScales: {
    MINUTE: 1,
    HOUR: 2,
    DAY: 3,
    MONTH: 4,
    YEAR: 5
  },
  quantities: {
  },
  currentTimeRange: 1,
  currentQuantity: 30,
  datasets: [
    {
      label: 'Event_A',
      data: [1234, 5687, 3456],
      fill: 'start'
    }
  ],
  labels: ['A', 'B', 'C'],
  colors: [
    {
      borderColor: '#3949ab',
      // backgroundColor: 'rgba(57,73, 171,0.3)',
      pointBackgroundColor: '#3949ab',
      pointHoverBackgroundColor: '#3949ab',
      pointBorderColor: '#ffffff',
      pointHoverBorderColor: '#ffffff'
    },
    {
      borderColor: 'rgba(30, 136, 229, 0.87)',
      // backgroundColor: 'rgba(30, 136, 229, 0.3)',
      pointBackgroundColor: 'rgba(30, 136, 229, 0.87)',
      pointHoverBackgroundColor: 'rgba(30, 136, 229, 0.87)',
      pointBorderColor: '#ffffff',
      pointHoverBorderColor: '#ffffff'
    },
    {
      borderColor: 'rgba(40, 10, 229, 0.87)',
      // backgroundColor: 'rgba(40, 10, 229, 0.3)',
      pointBackgroundColor: 'rgba(40, 10, 229, 0.87)',
      pointHoverBackgroundColor: 'rgba(40, 10, 229, 0.87)',
      pointBorderColor: '#ffffff',
      pointHoverBorderColor: '#ffffff'
    }
  ],
  options: {
    spanGaps: false,
    legend: { display: false },
    maintainAspectRatio: false,
    tooltips: { position: 'nearest', mode: 'index', intersect: false },
    layout: { padding: { left: 24, right: 32 } },
    elements: {
      point: {
        radius: 4,
        borderWidth: 2,
        hoverRadius: 4,
        hoverBorderWidth: 2
      }
    },
    scales: {
      xAxes: [
        {
          gridLines: { display: false },
          ticks: { fontColor: 'rgba(0,0,0,0.54)' }
        }
      ],
      yAxes: [
        {
          gridLines: { tickMarkLength: 16 },
          ticks: {
            // stepSize: 200,
            beginAtZero: true
          }
        }
      ]
    },
    plugins: { filler: { propagate: false } }
  },
  chartType: 'line'
};


