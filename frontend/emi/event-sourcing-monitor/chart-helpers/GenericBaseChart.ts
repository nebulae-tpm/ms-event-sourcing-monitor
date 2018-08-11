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
   * Returns de default range time for the timeRangeType
   * @param timeRangeType MINUTE, HOUR, DAY, MONTH, YEAR
   */
  static getDefaultLimitByTimeRangeType(timeRangeType: string): number{
    switch (timeRangeType){
      case 'MINUTE': return 30;
      case 'HOUR':   return 12;
      case 'DAY':    return 7;
      case 'MONTH':  return 12;
      case 'YEAR':   return 5;
      default: return 0;
    }
  }

    /**
   * return the rangeTime options that are posible represent with the scaleTime given
   * @param scaleTime MINUTE, HOUR, DAY, MONTH, YEAR
   */
  static  getDefaultsTimeRangesForscaleTime(scaleTime: string){
    switch (scaleTime){
      case 'MINUTE': return { TEN_MINUTES: 10, HALF_HOUR: 30, ONE_HOUR: 60 };
      case 'HOUR':   return { SIX_HOURS: 6, TWELVE_HOURS: 12, TWENTYFOUR: 24, FORTYEIGHT: 48  };
      case 'DAY':    return { ONE_WEEK: 7, FIFTEEN_DAYS: 15, ONE_MONTH: 30 };
      case 'MONTH':  return { SIX_MONTH: 6, ONE_YEAR: 12 };
      case 'YEAR':   return { FIVE_YEAR : 5 };
      default: return 0;
    }
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

  /**
   * Return the object to format the labels for timeRangeType given
   * @param timeRangeType MINUTE, HOUR, DAY, MONTH, YEAR
   */
  getLabelFormatter(timeRangeType: string): Object{
    // return { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric',  hour12: false };
    switch (timeRangeType){
      case 'MINUTE': return { hour: 'numeric', minute: 'numeric',  hour12: false };
      case 'HOUR':   return { hour: 'numeric', minute: 'numeric',  hour12: false };
      case 'DAY':    return { month: 'short', day: 'numeric',  hour12: false };
      case 'MONTH':  return { year: 'numeric', month: 'short',  hour12: false };
      case 'YEAR':   return { year: 'numeric',  hour12: false };
      default: {}
    }
  }
    /**
   * force to update the chart scheme
   * @param chartName
   */
  updateChart(): void {
    this.labels = this.labels.slice();
  }

}
