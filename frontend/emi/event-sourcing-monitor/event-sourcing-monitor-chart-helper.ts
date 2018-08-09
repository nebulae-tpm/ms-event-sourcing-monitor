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

export class GenericBaseChart{
  name: string;
  ready: boolean;
  showFilterForm: boolean;
  optionsToFilter: any[];
  filtersApplied: string[];
  timeScales: any;
  quantities: any;
  currentTimeRange: number;
  currentQuantity: number;
  datasets: { label: string, data: number[], fill: string | boolean }[];
  labels: string[];
  chartType: string;
  colors: {
    borderColor: string,
    backgroundColor: string;
    pointBackgroundColor: string;
    pointHoverBackgroundColor: string;
    pointBorderColor: string;
    pointHoverBorderColor: string;
  }[];
  options: {
    spanGaps: boolean;
    legend: any;
    maintainAspectRatio: boolean;
    tooltips: { position: string, mode: string, intersect: boolean };
    layout: any;
    elements: {
      point: {
        radius: number,
        borderWidth: number,
        hoverRadius: number,
        hoverBorderWidth: number
      }
    };
    scales: {
      xAxes: any[];
      yAxes: any[];
    };
    plugins: any;
  };

  constructor(chartName: string = ''){
    this.name = chartName;
    this.ready = false;
    this.showFilterForm = false;
    this.optionsToFilter = [];
    this.filtersApplied = [];
    this.timeScales = { MINUTE: 1, HOUR: 2, DAY: 3, MONTH: 4, YEAR: 5 };
    this.quantities = {};
    this.currentTimeRange = 1;
    this.currentQuantity = 30;
    this.datasets = [{label: '', data: [0], fill: 'start'}];
    this.labels = [''];
    this.colors = this.getDefaultBaseChartColors();
    this.chartType = 'line';
    this.options = {
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
    };
  }

  /**
   * default Colors for BaseChart
   */
  getDefaultBaseChartColors(){
    return [
      {
        borderColor: '#3949ab',
        // backgroundColor: 'rgba(57,73, 171,0.3)',
        backgroundColor: '',
        pointBackgroundColor: '#3949ab',
        pointHoverBackgroundColor: '#3949ab',
        pointBorderColor: '#ffffff',
        pointHoverBorderColor: '#ffffff'
      },
      {
        borderColor: 'rgba(30, 136, 229, 0.87)',
        // backgroundColor: 'rgba(30, 136, 229, 0.3)',
        backgroundColor: '',
        pointBackgroundColor: 'rgba(30, 136, 229, 0.87)',
        pointHoverBackgroundColor: 'rgba(30, 136, 229, 0.87)',
        pointBorderColor: '#ffffff',
        pointHoverBorderColor: '#ffffff'
      },
      {
        borderColor: 'rgba(40, 10, 229, 0.87)',
        // backgroundColor: 'rgba(40, 10, 229, 0.3)',
        backgroundColor: '',
        pointBackgroundColor: 'rgba(40, 10, 229, 0.87)',
        pointHoverBackgroundColor: 'rgba(40, 10, 229, 0.87)',
        pointBorderColor: '#ffffff',
        pointHoverBorderColor: '#ffffff'
      }

    ];
  }
}


